import type { JsonLineNode } from './types'

/**
 * 解析 JSONL 文本内容
 */
export function parseJsonLines(text: string): JsonLineNode[] {
  const lines = text.split('\n').filter((line) => line.trim())
  const result: JsonLineNode[] = []

  lines.forEach((line, index) => {
    try {
      const parsedData = JSON.parse(line)
      result.push({
        id: `line-${index}`,
        lineNumber: index + 1,
        rawContent: line,
        parsedData,
        isExpanded: false,
        decodedStrings: new Map()
      })
    } catch (error) {
      console.warn(`Failed to parse line ${index + 1}:`, error)
      // 跳过无效的 JSON 行
    }
  })

  return result
}

/**
 * 解析单个 JSON 对象（用于普通 JSON 文件）
 */
export function parseJson(text: string): JsonLineNode | null {
  try {
    const parsedData = JSON.parse(text)
    return {
      id: 'json-0',
      lineNumber: 1,
      rawContent: text,
      parsedData,
      isExpanded: false,
      decodedStrings: new Map()
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return null
  }
}

/**
 * 检测文本是否为 JSONL 格式
 */
export function isJsonLines(text: string): boolean {
  const lines = text.trim().split('\n')

  // 至少要有一行
  if (lines.length === 0) {
    return false
  }

  // 如果只有一行，可能是普通 JSON
  if (lines.length === 1) {
    return false
  }

  // 检查前几行是否都是有效的 JSON
  const samplesToCheck = Math.min(lines.length, 10)
  let validCount = 0

  for (let i = 0; i < samplesToCheck; i++) {
    const line = lines[i].trim()
    if (!line) continue

    try {
      JSON.parse(line)
      validCount++
    } catch {
      // 如果有一行解析失败，可能不是 JSONL
      return false
    }
  }

  // 如果大部分行都是有效的 JSON，认为是 JSONL
  return validCount > 0
}

/**
 * 检测文本是否为有效的 JSON
 */
export function isValidJson(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

/**
 * 自动检测并解析文本
 */
export function parseText(text: string): {
  type: 'jsonl' | 'json' | 'invalid'
  data: JsonLineNode[] | null
} {
  if (!text.trim()) {
    return { type: 'invalid', data: null }
  }

  // 先检测是否为 JSONL
  if (isJsonLines(text)) {
    return {
      type: 'jsonl',
      data: parseJsonLines(text)
    }
  }

  // 检测是否为普通 JSON
  if (isValidJson(text)) {
    const parsed = parseJson(text)
    return {
      type: 'json',
      data: parsed ? [parsed] : null
    }
  }

  return { type: 'invalid', data: null }
}

/**
 * 导出为 JSONL 格式
 */
export function exportToJsonLines(lines: JsonLineNode[]): string {
  return lines
    .map((line) => JSON.stringify(line.parsedData))
    .join('\n')
}

/**
 * 导出为 JSON 格式
 */
export function exportToJson(lines: JsonLineNode[]): string {
  if (lines.length === 1) {
    return JSON.stringify(lines[0].parsedData, null, 2)
  }

  const data = lines.map((line) => line.parsedData)
  return JSON.stringify(data, null, 2)
}
