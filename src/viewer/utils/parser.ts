import type { JsonLineNode } from './types'
import { extractDecodedText } from './decoder'

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
        decodedStrings: new Map(),
        decodedText: extractDecodedText(parsedData)
      })
    } catch (error) {
      console.warn(`Failed to parse line ${index + 1}:`, error)
      // 跳过无效的 JSON 行
    }
  })

  return result
}

/**
 * 增量解析 JSONL（首屏快速显示，后台继续解析）
 * 注意：当前禁用了后台加载，一次性解析全部数据
 */
export function parseJsonLinesIncremental(
  text: string,
  _initialBatchSize: number = 100,  // 保留参数以兼容调用方，但不使用
  onProgress?: (lines: JsonLineNode[], isComplete: boolean) => void
): JsonLineNode[] {
  const funcStartTime = performance.now()
  console.log(`[${new Date().toISOString()}] parseJsonLinesIncremental 开始（一次性加载模式）`)

  const splitStartTime = performance.now()
  const allLines = text.split('\n').filter((line) => line.trim())
  const splitTime = performance.now() - splitStartTime
  console.log(`[${new Date().toISOString()}] 文本切分完成: ${allLines.length} 行, 耗时 ${splitTime.toFixed(2)}ms`)

  const result: JsonLineNode[] = []

  // 一次性解析所有行
  const parseStartTime = performance.now()
  console.log(`[${new Date().toISOString()}] 开始一次性解析 ${allLines.length} 行`)

  for (let i = 0; i < allLines.length; i++) {
    try {
      const parsedData = JSON.parse(allLines[i])
      result.push({
        id: `line-${i}`,
        lineNumber: i + 1,
        rawContent: allLines[i],
        parsedData,
        isExpanded: false,
        decodedStrings: new Map(),
        decodedText: extractDecodedText(parsedData)
      })
    } catch (error) {
      console.warn(`Failed to parse line ${i + 1}:`, error)
    }
  }

  const parseTime = performance.now() - parseStartTime
  console.log(`[${new Date().toISOString()}] 解析完成: ${result.length} 行, 耗时 ${parseTime.toFixed(2)}ms`)

  // 回调全部数据，isComplete=true
  if (onProgress) {
    const callbackStartTime = performance.now()
    onProgress([...result], true)
    const callbackTime = performance.now() - callbackStartTime
    console.log(`[${new Date().toISOString()}] 进度回调完成, 耗时 ${callbackTime.toFixed(2)}ms`)
  }

  const funcTime = performance.now() - funcStartTime
  console.log(`[${new Date().toISOString()}] parseJsonLinesIncremental 完成, 总耗时 ${funcTime.toFixed(2)}ms`)

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
      decodedStrings: new Map(),
      decodedText: extractDecodedText(parsedData)
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
 * 自动检测并增量解析文本（首屏快速，后台继续）
 */
export function parseTextIncremental(
  text: string,
  onProgress?: (lines: JsonLineNode[], isComplete: boolean) => void
): {
  type: 'jsonl' | 'json' | 'invalid'
  data: JsonLineNode[] | null
} {
  const funcStartTime = performance.now()
  console.log(`[${new Date().toISOString()}] parseTextIncremental 开始, 文本长度: ${text.length}`)

  if (!text.trim()) {
    console.log(`[${new Date().toISOString()}] parseTextIncremental 结束: 空文本`)
    return { type: 'invalid', data: null }
  }

  // 先检测是否为 JSONL
  const detectStartTime = performance.now()
  const isJSONL = isJsonLines(text)
  const detectTime = performance.now() - detectStartTime
  console.log(`[${new Date().toISOString()}] 格式检测完成: isJsonLines=${isJSONL}, 耗时 ${detectTime.toFixed(2)}ms`)

  if (isJSONL) {
    const parseStartTime = performance.now()
    const data = parseJsonLinesIncremental(text, 100, onProgress)
    const parseTime = performance.now() - parseStartTime
    const totalTime = performance.now() - funcStartTime
    console.log(`[${new Date().toISOString()}] parseTextIncremental 完成: type=jsonl, 同步解析耗时 ${parseTime.toFixed(2)}ms, 总耗时 ${totalTime.toFixed(2)}ms`)
    return {
      type: 'jsonl',
      data
    }
  }

  // 检测是否为普通 JSON
  const isJSON = isValidJson(text)
  console.log(`[${new Date().toISOString()}] 格式检测: isValidJson=${isJSON}`)

  if (isJSON) {
    const parseStartTime = performance.now()
    const parsed = parseJson(text)
    const parseTime = performance.now() - parseStartTime
    console.log(`[${new Date().toISOString()}] JSON 解析完成, 耗时 ${parseTime.toFixed(2)}ms`)

    const data = parsed ? [parsed] : null
    if (onProgress && data) {
      const callbackStartTime = performance.now()
      onProgress(data, true)
      const callbackTime = performance.now() - callbackStartTime
      console.log(`[${new Date().toISOString()}] JSON 进度回调完成, 耗时 ${callbackTime.toFixed(2)}ms`)
    }

    const totalTime = performance.now() - funcStartTime
    console.log(`[${new Date().toISOString()}] parseTextIncremental 完成: type=json, 总耗时 ${totalTime.toFixed(2)}ms`)
    return {
      type: 'json',
      data
    }
  }

  const totalTime = performance.now() - funcStartTime
  console.log(`[${new Date().toISOString()}] parseTextIncremental 结束: type=invalid, 总耗时 ${totalTime.toFixed(2)}ms`)
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
