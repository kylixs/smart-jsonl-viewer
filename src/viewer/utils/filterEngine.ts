/**
 * 数据过滤引擎
 * 负责根据不同模式筛选数据，支持模糊、精确、正则、JSONPath 匹配
 */

export interface FilterOptions {
  keyword: string
  mode: 'fuzzy' | 'exact' | 'regex' | 'jsonpath'
  caseSensitive: boolean
  jsonPath?: string
}

export interface FilterResult {
  total: number
  matched: number
  duration: number
}

export interface JsonLineNode {
  id: string | number
  lineNumber: number
  rawContent: string
  parsedData: any
  [key: string]: any
}

/**
 * 过滤引擎类
 */
export class FilterEngine {
  private allData: JsonLineNode[] = []
  private filteredData: JsonLineNode[] = []

  /**
   * 设置原始数据
   */
  setAllData(data: JsonLineNode[]): void {
    this.allData = data
    this.filteredData = data
  }

  /**
   * 应用过滤
   */
  applyFilter(options: FilterOptions): FilterResult {
    const startTime = performance.now()

    // 清空旧的过滤结果
    this.filteredData = []

    if (!options.keyword.trim()) {
      // 无关键字，显示全部
      this.filteredData = this.allData
    } else {
      // 执行过滤
      this.filteredData = this.filterLines(this.allData, options)
    }

    const endTime = performance.now()

    const result: FilterResult = {
      total: this.allData.length,
      matched: this.filteredData.length,
      duration: endTime - startTime
    }

    if (import.meta.env.DEV) {
      console.log('[FilterEngine] 过滤完成:', result)
    }

    return result
  }

  /**
   * 过滤数据行
   */
  private filterLines(
    lines: JsonLineNode[],
    options: FilterOptions
  ): JsonLineNode[] {
    const { keyword, mode, caseSensitive, jsonPath } = options

    return lines.filter(line => {
      try {
        switch (mode) {
          case 'fuzzy':
            return this.fuzzyMatch(line, keyword, caseSensitive)

          case 'exact':
            return this.exactMatch(line, keyword, caseSensitive)

          case 'regex':
            return this.regexMatch(line, keyword, caseSensitive)

          case 'jsonpath':
            return this.jsonPathMatch(line, keyword, jsonPath!, caseSensitive)

          default:
            return false
        }
      } catch (err) {
        // 过滤过程出错，保留该行（避免数据丢失）
        if (import.meta.env.DEV) {
          console.warn('[FilterEngine] 过滤行出错:', err, line)
        }
        return false
      }
    })
  }

  /**
   * 模糊匹配
   */
  private fuzzyMatch(
    line: JsonLineNode,
    keyword: string,
    caseSensitive: boolean
  ): boolean {
    const content = caseSensitive ? line.rawContent : line.rawContent.toLowerCase()
    const search = caseSensitive ? keyword : keyword.toLowerCase()

    return content.includes(search)
  }

  /**
   * 精确匹配
   */
  private exactMatch(
    line: JsonLineNode,
    keyword: string,
    caseSensitive: boolean
  ): boolean {
    const content = caseSensitive ? line.rawContent : line.rawContent.toLowerCase()
    const search = caseSensitive ? keyword : keyword.toLowerCase()

    return content === search
  }

  /**
   * 正则匹配
   */
  private regexMatch(
    line: JsonLineNode,
    pattern: string,
    caseSensitive: boolean
  ): boolean {
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(pattern, flags)
      return regex.test(line.rawContent)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[FilterEngine] 正则表达式错误:', err)
      }
      return false
    }
  }

  /**
   * JSONPath 匹配
   */
  private jsonPathMatch(
    line: JsonLineNode,
    keyword: string,
    jsonPath: string,
    caseSensitive: boolean
  ): boolean {
    try {
      // 使用 JSONPath 提取值
      const value = this.extractByPath(line.parsedData, jsonPath)

      if (value === undefined || value === null) {
        return false
      }

      const valueStr = String(value)
      const content = caseSensitive ? valueStr : valueStr.toLowerCase()
      const search = caseSensitive ? keyword : keyword.toLowerCase()

      return content.includes(search)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[FilterEngine] JSONPath 匹配错误:', err)
      }
      return false
    }
  }

  /**
   * 提取 JSON 路径的值
   * 支持简单的点号路径，例如: "user.name" 或 "data.items.0.title"
   */
  private extractByPath(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object') {
      return undefined
    }

    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }

      if (typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return undefined
      }
    }

    return current
  }

  /**
   * 获取过滤结果
   */
  getFilteredData(): JsonLineNode[] {
    return this.filteredData
  }

  /**
   * 清空过滤
   */
  clearFilter(): void {
    this.filteredData = this.allData

    if (import.meta.env.DEV) {
      console.log('[FilterEngine] 过滤已清空')
    }
  }

  /**
   * 获取原始数据数量
   */
  getTotalCount(): number {
    return this.allData.length
  }

  /**
   * 获取过滤后数据数量
   */
  getFilteredCount(): number {
    return this.filteredData.length
  }
}

/**
 * 创建过滤引擎实例
 */
export function createFilterEngine(): FilterEngine {
  return new FilterEngine()
}
