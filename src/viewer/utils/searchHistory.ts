/**
 * 搜索历史管理工具
 * 为每种搜索模式分别保存最近的搜索记录
 */

import type { SearchMode } from './types'

const STORAGE_KEY_PREFIX = 'jsonline-viewer-search-history'
const MAX_HISTORY_SIZE = 10

/**
 * 获取指定搜索模式的历史记录
 */
export function getSearchHistory(mode: SearchMode): string[] {
  const key = `${STORAGE_KEY_PREFIX}-${mode}`
  try {
    const stored = localStorage.getItem(key)
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
 * @param mode 搜索模式
 * @param query 搜索关键词
 */
export function addSearchHistory(mode: SearchMode, query: string): void {
  if (!query || !query.trim()) return

  const trimmedQuery = query.trim()
  const key = `${STORAGE_KEY_PREFIX}-${mode}`

  try {
    let history = getSearchHistory(mode)

    // 移除重复项（如果存在）
    history = history.filter(item => item !== trimmedQuery)

    // 添加到开头
    history.unshift(trimmedQuery)

    // 限制数量
    if (history.length > MAX_HISTORY_SIZE) {
      history = history.slice(0, MAX_HISTORY_SIZE)
    }

    localStorage.setItem(key, JSON.stringify(history))
  } catch (err) {
    console.error('Failed to save search history:', err)
  }
}

/**
 * 清空指定模式的搜索历史
 */
export function clearSearchHistory(mode: SearchMode): void {
  const key = `${STORAGE_KEY_PREFIX}-${mode}`
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error('Failed to clear search history:', err)
  }
}

/**
 * 删除指定的历史记录
 */
export function removeSearchHistoryItem(mode: SearchMode, query: string): void {
  const key = `${STORAGE_KEY_PREFIX}-${mode}`

  try {
    let history = getSearchHistory(mode)
    history = history.filter(item => item !== query)
    localStorage.setItem(key, JSON.stringify(history))
  } catch (err) {
    console.error('Failed to remove search history item:', err)
  }
}
