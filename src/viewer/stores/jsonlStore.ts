import { defineStore } from 'pinia'
import type { JsonLineNode, FilterMode, SearchMode } from '../utils/types'
import { parseTextIncremental } from '../utils/parser'
import { filterJsonLines } from '../utils/filter'
import { addSearchHistory } from '../utils/searchHistory'
import type { Theme } from '../utils/themes'
import { themes, getThemeById } from '../utils/themes'

interface JsonlState {
  // 原始数据
  allLines: JsonLineNode[]
  // 过滤后的数据
  filteredLines: JsonLineNode[]
  // 搜索关键字
  searchKeyword: string
  // 过滤模式
  filterMode: FilterMode
  // 搜索模式
  searchMode: SearchMode
  // 是否搜索解码后的内容
  searchDecoded: boolean
  // 文件类型
  fileType: 'jsonl' | 'json' | 'invalid' | null
  // 主题（明暗模式）
  theme: 'light' | 'dark'
  // 主题配色
  currentThemeColor: string
  // 全局展开/折叠状态
  globalExpanded: boolean
  // 展开深度（0 = 全部折叠，-1 = 全部展开，1-10 = 展开到指定深度）
  expandDepth: number
  // 最大显示行数（-1 = 不限制，其他正整数 = 限制显示行数）
  maxDisplayLines: number
  // 当前可见行数（用于分页加载优化）
  visibleCount: number
  // 每次加载的批次大小
  batchSize: number
  // 后台加载状态
  isBackgroundLoading: boolean
  // 已加载的行数
  loadedCount: number
  // 总行数（预估）
  totalCount: number
}

export const useJsonlStore = defineStore('jsonl', {
  state: (): JsonlState => ({
    allLines: [],
    filteredLines: [],
    searchKeyword: '',
    filterMode: 'line',
    searchMode: 'fuzzy',
    searchDecoded: true,
    fileType: null,
    theme: 'light',
    currentThemeColor: 'blue',
    globalExpanded: true,
    expandDepth: -1,
    maxDisplayLines: 10,
    visibleCount: 100, // 初始显示 100 行
    batchSize: 50, // 每次加载 50 行
    isBackgroundLoading: false,
    loadedCount: 0,
    totalCount: 0,
  }),

  getters: {
    // 当前显示的行（分页优化，只渲染可见部分）
    displayLines: (state) => state.filteredLines.slice(0, state.visibleCount),

    // 总行数
    totalLines: (state) => state.allLines.length,

    // 过滤后的行数
    filteredCount: (state) => state.filteredLines.length,

    // 是否还有更多数据可以加载
    hasMore: (state) => state.visibleCount < state.filteredLines.length,

    // 是否有搜索
    hasSearch: (state) => state.searchKeyword.trim() !== '',

    // 是否为暗色主题
    isDark: (state) => state.theme === 'dark',

    // 当前主题配色对象
    currentTheme: (state): Theme => getThemeById(state.currentThemeColor),

    // 所有可用主题
    availableThemes: () => themes
  },

  actions: {
    /**
     * 加载文本内容（使用增量解析，首屏快速，后台继续）
     */
    loadText(text: string) {
      const funcStartTime = performance.now()
      console.log(`[${new Date().toISOString()}] ========== loadText 开始 ==========`)
      console.log(`[${new Date().toISOString()}] 文本长度: ${text.length} 字符`)

      // 估算总行数（用于进度显示）
      const estimateStartTime = performance.now()
      const estimatedLines = text.split('\n').filter(line => line.trim()).length
      const estimateTime = performance.now() - estimateStartTime
      console.log(`[${new Date().toISOString()}] 估算行数: ${estimatedLines}, 耗时 ${estimateTime.toFixed(2)}ms`)

      this.totalCount = estimatedLines
      this.loadedCount = 0
      this.isBackgroundLoading = true

      // 使用增量解析，处理进度回调
      const parseStartTime = performance.now()
      const result = parseTextIncremental(text, (lines, isComplete) => {
        const callbackStartTime = performance.now()
        console.log(`[${new Date().toISOString()}] ===== Store 进度回调 =====`)
        console.log(`[${new Date().toISOString()}] lines=${lines.length}, isComplete=${isComplete}`)

        // 更新已加载行数
        this.loadedCount = lines.length

        // 更新数据（后台解析的批次数据）
        const updateStartTime = performance.now()
        this.allLines = lines
        this.allLines.forEach((line) => {
          line.isExpanded = true
        })
        const updateTime = performance.now() - updateStartTime
        console.log(`[${new Date().toISOString()}] allLines 更新完成, 耗时 ${updateTime.toFixed(2)}ms`)

        const filterStartTime = performance.now()
        // 后台加载时不重置 visibleCount，避免页面闪烁
        this.applyFilter(false)
        const filterTime = performance.now() - filterStartTime
        console.log(`[${new Date().toISOString()}] applyFilter 完成, 耗时 ${filterTime.toFixed(2)}ms`)

        // 加载完成
        if (isComplete) {
          this.isBackgroundLoading = false
          this.loadedCount = this.totalCount

          // 自动扩展可见行数，显示所有已加载的数据
          this.visibleCount = this.filteredLines.length
          console.log(`[${new Date().toISOString()}] 自动扩展 visibleCount 到 ${this.visibleCount}`)

          const callbackTime = performance.now() - callbackStartTime
          console.log(`[${new Date().toISOString()}] ===== 后台加载完成 ===== 回调总耗时 ${callbackTime.toFixed(2)}ms`)
        } else {
          const callbackTime = performance.now() - callbackStartTime
          console.log(`[${new Date().toISOString()}] 进度回调完成, 耗时 ${callbackTime.toFixed(2)}ms`)
        }
      })

      const parseTime = performance.now() - parseStartTime
      console.log(`[${new Date().toISOString()}] parseTextIncremental 返回: type=${result.type}, data=${result.data ? result.data.length : null} 行, 耗时 ${parseTime.toFixed(2)}ms`)

      if (result.data) {
        // 首次同步返回的数据（前100行），立即显示
        const initStartTime = performance.now()
        this.allLines = result.data
        this.fileType = result.type
        this.allLines.forEach((line) => {
          line.isExpanded = true
        })
        const initTime = performance.now() - initStartTime
        console.log(`[${new Date().toISOString()}] allLines 初始化完成, 耗时 ${initTime.toFixed(2)}ms`)

        const filterStartTime = performance.now()
        this.applyFilter()
        const filterTime = performance.now() - filterStartTime
        console.log(`[${new Date().toISOString()}] applyFilter 完成, 耗时 ${filterTime.toFixed(2)}ms`)

        const funcTime = performance.now() - funcStartTime
        console.log(`[${new Date().toISOString()}] 首批数据已加载: ${this.allLines.length} 行`)
        console.log(`[${new Date().toISOString()}] ========== loadText 同步部分完成 ========== 总耗时 ${funcTime.toFixed(2)}ms`)
      } else {
        console.error(`[${new Date().toISOString()}] 解析失败: result.data 为 null`)
        this.allLines = []
        this.filteredLines = []
        this.fileType = null
        this.isBackgroundLoading = false
        throw new Error('Invalid JSON or JSONL format')
      }
    },

    /**
     * 加载 JSON Lines
     */
    loadJsonLines(lines: JsonLineNode[]) {
      this.allLines = lines
      this.fileType = 'jsonl'
      // 默认全部展开
      this.allLines.forEach((line) => {
        line.isExpanded = true
      })
      this.applyFilter()
    },

    /**
     * 设置搜索关键字
     */
    setSearchKeyword(keyword: string) {
      this.searchKeyword = keyword
      this.applyFilter()
      // 如果有搜索关键字，自动显示所有搜索结果
      if (keyword.trim()) {
        this.loadAll()
        console.log(`[${new Date().toISOString()}] 搜索模式: 自动显示所有结果 (${this.filteredLines.length} 行)`)
      }
    },

    /**
     * 设置过滤模式
     */
    setFilterMode(mode: FilterMode) {
      this.filterMode = mode
      this.applyFilter()
      // 如果有搜索关键字，自动显示所有搜索结果
      if (this.searchKeyword.trim()) {
        this.loadAll()
      }
    },

    /**
     * 设置搜索模式
     */
    setSearchMode(mode: SearchMode) {
      this.searchMode = mode
      this.applyFilter()
      // 如果有搜索关键字，自动显示所有搜索结果
      if (this.searchKeyword.trim()) {
        this.loadAll()
      }
    },

    /**
     * 切换是否搜索解码内容
     */
    toggleSearchDecoded() {
      this.searchDecoded = !this.searchDecoded
      this.applyFilter()
      // 如果有搜索关键字，自动显示所有搜索结果
      if (this.searchKeyword.trim()) {
        this.loadAll()
      }
    },

    /**
     * 应用过滤
     */
    applyFilter(resetVisible: boolean = true) {
      if (!this.searchKeyword.trim()) {
        this.filteredLines = this.allLines
      } else {
        this.filteredLines = filterJsonLines(
          this.allLines,
          this.searchKeyword,
          this.filterMode,
          this.searchMode,
          this.searchDecoded
        )
      }
      // 重置可见行数（避免渲染过多行）
      if (resetVisible) {
        this.resetVisibleCount()
      }
    },

    /**
     * 切换单行的展开状态
     */
    toggleLineExpand(lineId: string) {
      const line = this.allLines.find((l) => l.id === lineId)
      if (line) {
        line.isExpanded = !line.isExpanded
      }
    },

    /**
     * 全部展开
     */
    expandAll() {
      this.allLines.forEach((line) => {
        line.isExpanded = true
      })
      this.globalExpanded = true
      this.expandDepth = -1
    },

    /**
     * 全部折叠
     */
    collapseAll() {
      this.allLines.forEach((line) => {
        line.isExpanded = false
      })
      this.globalExpanded = false
      this.expandDepth = 0
    },

    /**
     * 设置展开深度
     */
    setExpandDepth(depth: number) {
      this.expandDepth = depth

      if (depth === 0) {
        // 全部折叠
        this.collapseAll()
      } else if (depth === -1) {
        // 全部展开
        this.expandAll()
      } else {
        // 展开到指定深度
        this.allLines.forEach((line) => {
          line.isExpanded = true
        })
        this.globalExpanded = true
      }
    },

    /**
     * 切换主题
     * 自动保存到 localStorage，页面刷新后保持
     */
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      // 保存到 localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('jsonl-viewer-theme', this.theme)
      }
    },

    /**
     * 从 localStorage 加载主题
     * 在应用初始化时调用，恢复上次保存的主题设置
     */
    loadTheme() {
      if (typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem('jsonl-viewer-theme')
        if (savedTheme === 'dark' || savedTheme === 'light') {
          this.theme = savedTheme
        }
      }
    },

    /**
     * 设置主题配色
     */
    setThemeColor(themeId: string) {
      this.currentThemeColor = themeId
      // 保存到 localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('jsonl-viewer-theme-color', themeId)
      }
    },

    /**
     * 从 localStorage 加载主题配色
     */
    loadThemeColor() {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('jsonl-viewer-theme-color')
        if (saved) {
          this.currentThemeColor = saved
        }
      }
    },

    /**
     * 设置最大显示行数
     */
    setMaxDisplayLines(lines: number) {
      this.maxDisplayLines = lines
      // 保存到 localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('jsonl-viewer-max-display-lines', String(lines))
      }
    },

    /**
     * 从 localStorage 加载最大显示行数
     */
    loadMaxDisplayLines() {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('jsonl-viewer-max-display-lines')
        if (saved) {
          const lines = parseInt(saved, 10)
          if (!isNaN(lines) && lines >= -1) {
            this.maxDisplayLines = lines
          }
        }
      }
    },

    /**
     * 清空数据
     */
    clear() {
      this.allLines = []
      this.filteredLines = []
      this.searchKeyword = ''
      this.fileType = null
    },

    /**
     * 确认并保存当前搜索到历史记录
     * 当用户有实际使用搜索结果的行为时调用
     */
    confirmAndSaveSearch() {
      const keyword = this.searchKeyword.trim()
      if (keyword) {
        addSearchHistory(keyword, this.searchMode, this.filterMode)
      }
    },

    /**
     * 加载更多行（分页加载优化）
     */
    loadMore() {
      this.visibleCount = Math.min(
        this.visibleCount + this.batchSize,
        this.filteredLines.length
      )
    },

    /**
     * 加载所有行（搜索时使用）
     */
    loadAll() {
      this.visibleCount = this.filteredLines.length
    },

    /**
     * 重置可见行数到初始值
     */
    resetVisibleCount() {
      this.visibleCount = 100
    }
  }
})
