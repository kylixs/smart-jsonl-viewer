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
 */
export function parseJsonLinesIncremental(
  text: string,
  initialBatchSize: number = 100,
  onProgress?: (lines: JsonLineNode[], isComplete: boolean) => void
): JsonLineNode[] {
  const funcStartTime = performance.now()
  console.log(`[${new Date().toISOString()}] parseJsonLinesIncremental 开始`)

  const splitStartTime = performance.now()
  const allLines = text.split('\n').filter((line) => line.trim())
  const splitTime = performance.now() - splitStartTime
  console.log(`[${new Date().toISOString()}] 文本切分完成: ${allLines.length} 行, 耗时 ${splitTime.toFixed(2)}ms`)

  const result: JsonLineNode[] = []

  // 首先解析前 N 行，快速返回
  const firstBatch = Math.min(initialBatchSize, allLines.length)
  const firstBatchStartTime = performance.now()
  console.log(`[${new Date().toISOString()}] 开始解析首批 ${firstBatch} 行`)

  for (let i = 0; i < firstBatch; i++) {
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

  const firstBatchTime = performance.now() - firstBatchStartTime
  console.log(`[${new Date().toISOString()}] 首批解析完成: ${result.length} 行, 耗时 ${firstBatchTime.toFixed(2)}ms`)

  // 回调首批数据
  if (onProgress) {
    const callbackStartTime = performance.now()
    onProgress([...result], allLines.length <= firstBatch)
    const callbackTime = performance.now() - callbackStartTime
    console.log(`[${new Date().toISOString()}] 首批进度回调完成, 耗时 ${callbackTime.toFixed(2)}ms`)
  }

  const funcTime = performance.now() - funcStartTime
  console.log(`[${new Date().toISOString()}] parseJsonLinesIncremental 同步部分完成, 总耗时 ${funcTime.toFixed(2)}ms`)

  // 后台异步解析剩余行
  if (allLines.length > firstBatch) {
    console.log(`[${new Date().toISOString()}] 启动后台解析: 剩余 ${allLines.length - firstBatch} 行`)
    const backgroundStartTime = performance.now()

    const parseRemaining = (startIndex: number) => {
      const batchStartTime = performance.now()
      const batchSize = 500 // 每批解析500行
      const endIndex = Math.min(startIndex + batchSize, allLines.length)

      console.log(`[${new Date().toISOString()}] 后台批次开始: 行 ${startIndex}-${endIndex}`)

      for (let i = startIndex; i < endIndex; i++) {
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

      const batchTime = performance.now() - batchStartTime
      console.log(`[${new Date().toISOString()}] 后台批次完成: 解析 ${endIndex - startIndex} 行, 耗时 ${batchTime.toFixed(2)}ms`)

      // 通知进度
      if (onProgress) {
        const callbackStartTime = performance.now()
        const isComplete = endIndex >= allLines.length
        onProgress([...result], isComplete)
        const callbackTime = performance.now() - callbackStartTime
        console.log(`[${new Date().toISOString()}] 进度回调完成: ${result.length}/${allLines.length} 行, isComplete=${isComplete}, 耗时 ${callbackTime.toFixed(2)}ms`)

        if (isComplete) {
          const totalBackgroundTime = performance.now() - backgroundStartTime
          console.log(`[${new Date().toISOString()}] 后台解析全部完成, 后台总耗时 ${totalBackgroundTime.toFixed(2)}ms`)
        }
      }

      // 继续解析下一批
      if (endIndex < allLines.length) {
        // 使用 requestIdleCallback 或 setTimeout
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => parseRemaining(endIndex))
        } else {
          setTimeout(() => parseRemaining(endIndex), 0)
        }
      }
    }

    // 启动后台解析
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => parseRemaining(firstBatch))
    } else {
      setTimeout(() => parseRemaining(firstBatch), 0)
    }
  } else {
    console.log(`[${new Date().toISOString()}] 无需后台解析 (总行数 <= ${initialBatchSize})`)
  }

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
