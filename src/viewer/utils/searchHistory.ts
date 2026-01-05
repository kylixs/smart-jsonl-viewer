/**
 * 搜索历史管理工具
 * 统一存储所有搜索记录，包含完整的搜索上下文
 */

import type { SearchMode, FilterMode } from './types'

const STORAGE_KEY = 'jsonline-viewer-search-history'
const MAX_HISTORY_SIZE = 10

/**
 * 搜索历史记录项
 */
export interface SearchHistoryItem {
  keyword: string         // 搜索关键词
  searchMode: SearchMode  // 搜索模式（模糊/完全/JSONPath）
  filterMode: FilterMode  // 过滤范围（按行/按节点）
  timestamp: number       // 时间戳
}

/**
 * 获取所有搜索历史
 */
export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const history = JSON.parse(stored)
    return Array.isArray(history) ? history : []
  } catch (err) {
    console.error('Failed to load search history:', err)
    return []
  }
}

/**
 * 添加搜索记录
 * @param keyword 搜索关键词
 * @param searchMode 搜索模式
 * @param filterMode 过滤范围
 */
export function addSearchHistory(
  keyword: string,
  searchMode: SearchMode,
  filterMode: FilterMode
): void {
  if (!keyword || !keyword.trim()) return

  const trimmedKeyword = keyword.trim()

  try {
    let history = getSearchHistory()

    // 检查是否存在完全相同的记录（keyword + searchMode + filterMode）
    const existingIndex = history.findIndex(
      item =>
        item.keyword === trimmedKeyword &&
        item.searchMode === searchMode &&
        item.filterMode === filterMode
    )

    // 如果存在，移除旧记录
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1)
    }

    // 添加到开头
    history.unshift({
      keyword: trimmedKeyword,
      searchMode,
      filterMode,
      timestamp: Date.now()
    })

    // 限制数量
    if (history.length > MAX_HISTORY_SIZE) {
      history = history.slice(0, MAX_HISTORY_SIZE)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (err) {
    console.error('Failed to save search history:', err)
  }
}

/**
 * 清空所有搜索历史
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear search history:', err)
  }
}

/**
 * 删除指定的历史记录
 */
export function removeSearchHistoryItem(item: SearchHistoryItem): void {
  try {
    let history = getSearchHistory()
    history = history.filter(
      h =>
        !(
          h.keyword === item.keyword &&
          h.searchMode === item.searchMode &&
          h.filterMode === item.filterMode
        )
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (err) {
    console.error('Failed to remove search history item:', err)
  }
}
