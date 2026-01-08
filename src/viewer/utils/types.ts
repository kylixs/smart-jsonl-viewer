// JSON Line 节点
export interface JsonLineNode {
  id: string
  lineNumber: number
  rawContent: string
  parsedData: any
  isExpanded: boolean
  decodedStrings: Map<string, DecodedString>
  matchedPath?: string // JSONPath 匹配时的路径
  decodedText: string // 解码后的文本缓存（用于搜索和显示），可能引用 rawContent
}

// JSON 节点
export interface JsonNode {
  key: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  isExpanded: boolean
  children?: JsonNode[]
  depth: number
  isDecodable: boolean
  decodedValue?: any
}

// 解码结果
export type DecodedResult =
  | { type: 'primitive'; value: any }
  | { type: 'string'; value: string; displayValue?: string }
  | {
      type: 'json'
      original: string
      decoded: DecodedResult
      displayMode: 'original' | 'decoded'
    }

// 解码字符串
export interface DecodedString {
  original: string
  decoded: any
  displayMode: 'original' | 'decoded'
}

// 过滤模式
export type FilterMode = 'line' | 'node'

// 搜索模式
export type SearchMode = 'fuzzy' | 'exact' | 'jsonpath'

// 搜索选项
export interface SearchOptions {
  keyword: string
  mode: FilterMode
  searchMode: SearchMode
  autoDecodeEnabled: boolean
}
