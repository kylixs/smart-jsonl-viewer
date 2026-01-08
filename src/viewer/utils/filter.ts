import type { JsonLineNode, FilterMode, SearchMode } from './types'
import { unescapeString } from './decoder'

// 缓存正则表达式，避免重复创建
const regexCache = new Map<string, RegExp>()

function getCachedRegex(keyword: string): RegExp {
  const cacheKey = `exact_${keyword}`
  let regex = regexCache.get(cacheKey)
  if (!regex) {
    regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i')
    regexCache.set(cacheKey, regex)
    // 限制缓存大小
    if (regexCache.size > 100) {
      const firstKey = regexCache.keys().next().value
      if (firstKey) {
        regexCache.delete(firstKey)
      }
    }
  }
  return regex
}

/**
 * 过滤 JSON Lines
 */
export function filterJsonLines(
  lines: JsonLineNode[],
  keyword: string,
  mode: FilterMode,
  searchMode: SearchMode = 'fuzzy',
  autoDecodeEnabled: boolean = true
): JsonLineNode[] {
  if (!keyword.trim()) {
    return lines
  }

  // JSONPath 模式特殊处理
  if (searchMode === 'jsonpath') {
    return filterByJsonPath(lines, keyword)
  }

  const processedKeyword = searchMode === 'exact'
    ? keyword.toLowerCase().trim()
    : keyword.toLowerCase()

  if (mode === 'line') {
    return lines.filter((line) =>
      matchInLine(line, processedKeyword, searchMode, autoDecodeEnabled)
    )
  } else {
    // 节点模式：只显示包含关键字的叶子节点及其路径
    return lines
      .map((line) => {
        const filteredData = filterNodes(
          line.parsedData,
          processedKeyword,
          searchMode,
          autoDecodeEnabled
        )
        if (filteredData === null) {
          return null
        }
        return {
          ...line,
          parsedData: filteredData
        }
      })
      .filter((line): line is JsonLineNode => line !== null)
  }
}

/**
 * 检查一行是否包含关键字（所看即所得）
 * 根据 autoDecodeEnabled 选择搜索解码内容还是原始内容
 */
function matchInLine(
  line: JsonLineNode,
  keyword: string,
  searchMode: SearchMode,
  autoDecodeEnabled: boolean
): boolean {
  // 所看即所得：根据用户的渲染偏好选择搜索的文本
  // - autoDecodeEnabled=true: 搜索 decodedText（如果有），否则搜索 rawContent
  // - autoDecodeEnabled=false: 搜索 rawContent
  const searchText = (autoDecodeEnabled && line.decodedText)
    ? line.decodedText
    : line.rawContent
  return matchString(searchText.toLowerCase(), keyword, searchMode)
}

/**
 * 根据搜索模式匹配字符串
 */
function matchString(text: string, keyword: string, searchMode: SearchMode): boolean {
  switch (searchMode) {
    case 'fuzzy':
      // 模糊匹配：包含即可
      return text.includes(keyword)

    case 'exact':
      // 完全匹配：完整单词匹配，使用缓存的正则
      return getCachedRegex(keyword).test(text)

    default:
      return text.includes(keyword)
  }
}

/**
 * 在对象中递归搜索关键字（优化版本）
 */
function searchInObject(obj: any, keyword: string, searchMode: SearchMode = 'fuzzy', autoDecodeEnabled: boolean = true): boolean {
  if (obj === null || obj === undefined) {
    return false
  }

  // 检查基本类型
  if (typeof obj !== 'object') {
    const str = String(obj).toLowerCase()
    if (matchString(str, keyword, searchMode)) {
      return true
    }

    // 如果是字符串，且开启了解码搜索，尝试解码后再搜索
    if (typeof obj === 'string' && autoDecodeEnabled && obj.length > 0) {
      // 优化：只对包含转义字符或看起来像 JSON 的字符串进行解码/解析
      const needsDecode = obj.includes('\\') || obj.includes('"')

      if (needsDecode) {
        // 尝试解码
        try {
          const unescaped = unescapeString(obj).toLowerCase()
          if (unescaped !== str && matchString(unescaped, keyword, searchMode)) {
            return true
          }
        } catch {
          // 解码失败，跳过
        }

        // 只对看起来像 JSON 的字符串尝试解析（以 { 或 [ 开头）
        const trimmed = obj.trim()
        if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && trimmed.length < 10000) {
          try {
            const parsed = JSON.parse(obj)
            if (searchInObject(parsed, keyword, searchMode, autoDecodeEnabled)) {
              return true
            }
          } catch {
            // 不是有效的 JSON，跳过
          }
        }
      }
    }

    return false
  }

  // 递归搜索数组
  if (Array.isArray(obj)) {
    return obj.some((item) => searchInObject(item, keyword, searchMode, autoDecodeEnabled))
  }

  // 递归搜索对象
  for (const key in obj) {
    // 搜索键名
    if (matchString(key.toLowerCase(), keyword, searchMode)) {
      return true
    }
    // 搜索值
    if (searchInObject(obj[key], keyword, searchMode, autoDecodeEnabled)) {
      return true
    }
  }

  return false
}

/**
 * 过滤节点，只保留包含关键字的叶子节点及其路径
 */
function filterNodes(
  node: any,
  keyword: string,
  searchMode: SearchMode,
  autoDecodeEnabled: boolean
): any {
  if (node === null || node === undefined) {
    return null
  }

  // 叶子节点
  if (typeof node !== 'object') {
    if (searchInObject(node, keyword, searchMode, autoDecodeEnabled)) {
      return node
    }
    return null
  }

  // 数组
  if (Array.isArray(node)) {
    const filtered = node
      .map((item) => filterNodes(item, keyword, searchMode, autoDecodeEnabled))
      .filter((item) => item !== null)

    return filtered.length > 0 ? filtered : null
  }

  // 对象
  const result: any = {}
  let hasMatch = false

  for (const key in node) {
    // 键名匹配
    if (matchString(key.toLowerCase(), keyword, searchMode)) {
      result[key] = node[key]
      hasMatch = true
      continue
    }

    // 递归过滤值
    const filtered = filterNodes(node[key], keyword, searchMode, autoDecodeEnabled)
    if (filtered !== null) {
      result[key] = filtered
      hasMatch = true
    }
  }

  return hasMatch ? result : null
}

/**
 * 使用 JSONPath 过滤
 */
function filterByJsonPath(lines: JsonLineNode[], path: string): JsonLineNode[] {
  try {
    const filtered: JsonLineNode[] = []
    for (const line of lines) {
      try {
        const result = evaluateJsonPath(line.parsedData, path)
        if (result !== null && result !== undefined) {
          // 检查是否是递归查询结果（包含实际路径信息）
          if (result.__matchedPath) {
            filtered.push({
              ...line,
              parsedData: result.value,
              matchedPath: result.__matchedPath
            })
          } else {
            // 普通查询，使用查询路径
            filtered.push({
              ...line,
              parsedData: result,
              matchedPath: path
            })
          }
        }
      } catch {
        // 忽略解析错误
      }
    }
    return filtered
  } catch {
    return []
  }
}

/**
 * 简单的 JSONPath 实现
 * 支持基本语法：$.field, $.field.nested, $[0], $.array[*], $..field
 */
function evaluateJsonPath(obj: any, path: string): any {
  if (!path.startsWith('$')) {
    throw new Error('JSONPath must start with $')
  }

  // 移除开头的 $
  let query = path.substring(1)

  // 如果是 $ 根节点
  if (!query || query === '.') {
    return obj
  }

  // 检测是否包含递归下降操作符 ..
  if (query.includes('..')) {
    return evaluateRecursivePath(obj, query)
  }

  // 分割路径
  const parts = query.split(/\.|\[/).map(p => p.replace(/\]$/, ''))

  let current = obj

  for (const part of parts) {
    if (!part) continue

    // 处理数组通配符 [*]
    if (part === '*') {
      if (Array.isArray(current)) {
        return current.length > 0 ? current : null
      }
      return null
    }

    // 处理数组索引
    if (/^\d+$/.test(part)) {
      const index = parseInt(part)
      if (Array.isArray(current) && index < current.length) {
        current = current[index]
      } else {
        return null
      }
    } else {
      // 处理对象属性
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return null
      }
    }
  }

  return current
}

/**
 * 处理递归下降路径 (例如 $..content)
 */
function evaluateRecursivePath(obj: any, query: string): any {
  // 解析递归路径
  // 例如：..content 或 ..message.content
  const recursiveMatch = query.match(/^\.\.(.+)$/)
  if (!recursiveMatch) {
    return null
  }

  const targetPath = recursiveMatch[1]
  const results: Array<{ value: any; path: string }> = []

  // 递归查找所有匹配的节点，记录完整路径
  function findRecursive(current: any, remainingPath: string, currentPath: string) {
    if (current === null || current === undefined) {
      return
    }

    // 尝试直接匹配当前路径
    try {
      const matched = evaluateJsonPath(current, '$.' + remainingPath)
      if (matched !== null && matched !== undefined) {
        // 构建实际匹配的完整路径
        const fullPath = currentPath + '.' + remainingPath
        results.push({ value: matched, path: fullPath })
      }
    } catch {
      // 忽略匹配失败
    }

    // 递归查找子节点
    if (typeof current === 'object') {
      if (Array.isArray(current)) {
        for (let i = 0; i < current.length; i++) {
          findRecursive(current[i], remainingPath, `${currentPath}[${i}]`)
        }
      } else {
        for (const key in current) {
          findRecursive(current[key], remainingPath, `${currentPath}.${key}`)
        }
      }
    }
  }

  findRecursive(obj, targetPath, '$')

  // 如果找到多个结果，返回第一个匹配（带路径信息）
  // 如果只有一个，返回该值（带路径信息）
  if (results.length === 0) {
    return null
  } else if (results.length === 1) {
    // 返回单个结果，包含实际路径
    return {
      value: results[0].value,
      __matchedPath: results[0].path
    }
  } else {
    // 返回第一个匹配的结果，包含实际路径
    return {
      value: results[0].value,
      __matchedPath: results[0].path
    }
  }
}

/**
 * 高亮显示匹配的关键字
 */
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword.trim()) {
    return text
  }

  const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
