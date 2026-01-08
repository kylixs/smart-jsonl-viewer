import type { DecodedResult } from './types'

const MAX_RECURSION_DEPTH = 10

/**
 * 提取对象中所有解码后的文本值，用于搜索
 * 智能判断：如果不需要解码，返回空字符串
 */
export function extractDecodedText(parsedData: any): string {
  let hasDecoding = false  // 标记是否发生了解码
  const texts: string[] = []

  function traverse(value: any, depth: number = 0) {
    // 防止无限递归
    if (depth > MAX_RECURSION_DEPTH) return

    if (value === null || value === undefined) return

    if (typeof value === 'string') {
      // 检查是否需要解码
      const hasEscape = value.includes('\\')
      const looksLikeJson = value.trim().startsWith('{') || value.trim().startsWith('[')

      if (!hasEscape && !looksLikeJson) {
        // 不需要解码，原样添加
        texts.push(value)
        return
      }

      // 需要解码转义字符
      if (hasEscape) {
        const decoded = unescapeString(value)
        if (decoded !== value) {
          hasDecoding = true  // 标记发生了解码
          texts.push(decoded)
        } else {
          texts.push(value)
        }
      } else {
        texts.push(value)
      }

      // 尝试解析嵌套 JSON
      if (looksLikeJson && value.length < 100000) {  // 避免解析超大 JSON
        try {
          const nested = JSON.parse(value)
          hasDecoding = true  // 解析了嵌套 JSON
          traverse(nested, depth + 1)
        } catch {
          // 解析失败，不是有效 JSON
        }
      }
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach(item => traverse(item, depth + 1))
      } else {
        for (const key in value) {
          traverse(value[key], depth + 1)
        }
      }
    } else {
      // 数字、布尔值等
      texts.push(String(value))
    }
  }

  traverse(parsedData)

  // 关键变化：如果没有发生任何解码，返回空字符串
  if (!hasDecoding) {
    return ''  // 不需要解码，返回空字符串
  }

  // 发生了解码，返回新字符串
  return texts.join(' ')
}

/**
 * 智能解码值，递归处理嵌套的 JSON 字符串
 */
export function smartDecode(
  value: any,
  depth: number = 0
): DecodedResult {
  // 防止无限递归
  if (depth > MAX_RECURSION_DEPTH) {
    return { type: 'primitive', value }
  }

  if (typeof value !== 'string') {
    return { type: 'primitive', value }
  }

  // 检测是否为 JSON 字符串
  if (isJsonString(value)) {
    try {
      const parsed = JSON.parse(value)
      // 递归解码嵌套的 JSON 字符串
      return {
        type: 'json',
        original: value,
        decoded: smartDecode(parsed, depth + 1),
        displayMode: 'decoded'
      }
    } catch (e) {
      // 解析失败，当作普通字符串处理
      return {
        type: 'string',
        value,
        displayValue: unescapeString(value)
      }
    }
  }

  // 处理包含实际换行符等特殊字符的字符串
  if (value.includes('\n') || value.includes('\t') || value.includes('\r')) {
    // 检测是否为XML/HTML内容并格式化
    const formatted = formatXmlIfNeeded(value)
    return {
      type: 'string',
      value,
      displayValue: formatted
    }
  }

  // 处理转义字符串
  const unescaped = unescapeString(value)
  if (unescaped !== value) {
    return {
      type: 'string',
      value,
      displayValue: unescaped
    }
  }

  return { type: 'string', value }
}

/**
 * 检测字符串是否为 JSON 格式
 */
function isJsonString(str: string): boolean {
  const trimmed = str.trim()
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  )
}

/**
 * 反转义字符串，处理 \n, \", \t 等
 */
export function unescapeString(str: string): string {
  try {
    // 尝试使用 JSON.parse 来处理转义字符
    return JSON.parse(`"${str.replace(/"/g, '\\"')}"`)
  } catch {
    // 如果失败，手动处理常见的转义字符
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }
}

/**
 * 递归解码对象中的所有字符串值
 */
export function decodeObject(obj: any, depth: number = 0): any {
  if (depth > MAX_RECURSION_DEPTH) {
    return obj
  }

  if (typeof obj === 'string') {
    const decoded = smartDecode(obj, depth)
    if (decoded.type === 'json') {
      return decoded.decoded
    }
    if (decoded.type === 'string') {
      return decoded.displayValue || decoded.value
    }
    return decoded.value
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => decodeObject(item, depth + 1))
  }

  if (obj !== null && typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      result[key] = decodeObject(obj[key], depth + 1)
    }
    return result
  }

  return obj
}

/**
 * 检查值是否可解码
 */
export function isDecodable(value: any): boolean {
  if (typeof value !== 'string') {
    return false
  }

  // 检查是否包含转义字符序列
  if (
    value.includes('\\n') ||
    value.includes('\\t') ||
    value.includes('\\"') ||
    value.includes('\\r')
  ) {
    return true
  }

  // 检查是否包含实际的换行符、制表符等特殊字符
  if (
    value.includes('\n') ||
    value.includes('\t') ||
    value.includes('\r')
  ) {
    return true
  }

  // 检查是否为 JSON 字符串
  return isJsonString(value)
}

/**
 * 检测并格式化XML/HTML内容
 */
function formatXmlIfNeeded(value: string): string {
  // 检测是否包含XML/HTML标签
  if (!value.includes('<') || !value.includes('>')) {
    return value
  }

  // 简单检测是否为XML/HTML内容
  const hasXmlTags = /<[^>]+>/.test(value)
  if (!hasXmlTags) {
    return value
  }

  // 移除每行开头的多余空白，保持相对缩进
  const lines = value.split('\n')

  // 找出最小的非空行缩进
  let minIndent = Infinity
  for (const line of lines) {
    const trimmedLine = line.trimStart()
    if (trimmedLine.length > 0) {
      const indent = line.length - trimmedLine.length
      minIndent = Math.min(minIndent, indent)
    }
  }

  // 如果没有找到有效缩进，返回原值
  if (minIndent === Infinity) {
    return value
  }

  // 移除最小缩进，保持相对缩进关系
  const normalized = lines.map(line => {
    if (line.trim().length === 0) {
      return ''
    }
    return line.substring(minIndent)
  }).join('\n')

  return normalized
}
