/**
 * 查找定位引擎
 * 负责在过滤后的数据中查找匹配项，支持上/下一个导航
 * 注意：查找不改变数据，只生成索引数组，影响滚动位置和高亮显示
 */

import type { JsonLineNode } from './filterEngine'
import type { VirtualScrollManager } from './virtualScroll'

export interface FindOptions {
  caseSensitive: boolean
  wholeWord: boolean
  regex: boolean
}

export interface FindResult {
  total: number
  current: number
  duration: number
}

export interface FindStatus {
  total: number
  current: number
  keyword: string
}

/**
 * 查找引擎类
 */
export class FindEngine {
  private findMatches: number[] = []        // 匹配的索引数组
  private currentMatchIndex: number = -1   // 当前查找位置
  private findKeyword: string = ''
  private scrollManager: VirtualScrollManager | null = null

  /**
   * 设置虚拟滚动管理器（用于自动滚动到匹配项）
   */
  setScrollManager(manager: VirtualScrollManager): void {
    this.scrollManager = manager
  }

  /**
   * 执行查找
   * @param data 要查找的数据（通常是过滤后的 filteredLines）
   * @param keyword 查找关键字
   * @param options 查找选项
   */
  find(
    data: JsonLineNode[],
    keyword: string,
    options: FindOptions
  ): FindResult {
    const startTime = performance.now()

    // 清空旧的查找结果
    this.findMatches = []
    this.currentMatchIndex = -1
    this.findKeyword = keyword

    if (!keyword.trim()) {
      return {
        total: 0,
        current: 0,
        duration: 0
      }
    }

    // 遍历查找匹配项
    data.forEach((line, index) => {
      if (this.matchLine(line, keyword, options)) {
        this.findMatches.push(index)
      }
    })

    // 如果有结果，定位到第一个
    if (this.findMatches.length > 0) {
      this.currentMatchIndex = 0
      this.scrollToCurrentMatch()
    }

    const endTime = performance.now()

    const result: FindResult = {
      total: this.findMatches.length,
      current: this.currentMatchIndex >= 0 ? this.currentMatchIndex + 1 : 0,
      duration: endTime - startTime
    }

    if (import.meta.env.DEV) {
      console.log('[FindEngine] 查找完成:', result)
    }

    return result
  }

  /**
   * 匹配单行
   */
  private matchLine(
    line: JsonLineNode,
    keyword: string,
    options: FindOptions
  ): boolean {
    let content = line.rawContent
    let search = keyword

    // 大小写
    if (!options.caseSensitive) {
      content = content.toLowerCase()
      search = search.toLowerCase()
    }

    // 正则模式
    if (options.regex) {
      try {
        const flags = options.caseSensitive ? 'g' : 'gi'
        const regex = new RegExp(search, flags)
        return regex.test(content)
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[FindEngine] 正则表达式错误:', err)
        }
        return false
      }
    }

    // 全字匹配
    if (options.wholeWord) {
      const regex = new RegExp(
        `\\b${this.escapeRegex(search)}\\b`,
        options.caseSensitive ? '' : 'i'
      )
      return regex.test(content)
    }

    // 普通匹配
    return content.includes(search)
  }

  /**
   * 下一个匹配
   */
  findNext(): void {
    if (this.findMatches.length === 0) {
      return
    }

    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.findMatches.length
    this.scrollToCurrentMatch()

    if (import.meta.env.DEV) {
      console.log('[FindEngine] 下一个:', {
        当前: this.currentMatchIndex + 1,
        总数: this.findMatches.length
      })
    }
  }

  /**
   * 上一个匹配
   */
  findPrevious(): void {
    if (this.findMatches.length === 0) {
      return
    }

    this.currentMatchIndex = this.currentMatchIndex - 1
    if (this.currentMatchIndex < 0) {
      this.currentMatchIndex = this.findMatches.length - 1
    }

    this.scrollToCurrentMatch()

    if (import.meta.env.DEV) {
      console.log('[FindEngine] 上一个:', {
        当前: this.currentMatchIndex + 1,
        总数: this.findMatches.length
      })
    }
  }

  /**
   * 滚动到当前匹配项
   */
  private scrollToCurrentMatch(): void {
    if (
      !this.scrollManager ||
      this.currentMatchIndex < 0 ||
      this.currentMatchIndex >= this.findMatches.length
    ) {
      return
    }

    const matchIndex = this.findMatches[this.currentMatchIndex]

    // 滚动到匹配项，并居中显示
    this.scrollManager.scrollToIndex(matchIndex, {
      align: 'center',
      smooth: true,
      highlight: true
    })
  }

  /**
   * 获取查找状态
   */
  getFindStatus(): FindStatus {
    return {
      total: this.findMatches.length,
      current: this.currentMatchIndex >= 0 ? this.currentMatchIndex + 1 : 0,
      keyword: this.findKeyword
    }
  }

  /**
   * 判断某行是否为当前查找匹配项
   */
  isCurrentMatch(index: number): boolean {
    if (this.currentMatchIndex < 0) {
      return false
    }
    return this.findMatches[this.currentMatchIndex] === index
  }

  /**
   * 判断某行是否为查找匹配项（但不是当前项）
   */
  isMatch(index: number): boolean {
    return this.findMatches.includes(index)
  }

  /**
   * 清空查找
   */
  clearFind(): void {
    this.findMatches = []
    this.currentMatchIndex = -1
    this.findKeyword = ''

    if (import.meta.env.DEV) {
      console.log('[FindEngine] 查找已清空')
    }
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 获取所有匹配索引
   */
  getMatches(): number[] {
    return [...this.findMatches]
  }

  /**
   * 获取当前匹配索引
   */
  getCurrentMatchIndex(): number {
    return this.currentMatchIndex
  }

  /**
   * 获取匹配总数
   */
  getMatchCount(): number {
    return this.findMatches.length
  }
}

/**
 * 创建查找引擎实例
 */
export function createFindEngine(): FindEngine {
  return new FindEngine()
}
