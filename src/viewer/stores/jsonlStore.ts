import { defineStore } from 'pinia'
import type { JsonLineNode, FilterMode, SearchMode } from '../utils/types'
import { parseText } from '../utils/parser'
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
    maxDisplayLines: 10
  }),

  getters: {
    // 当前显示的行
    displayLines: (state) => state.filteredLines,

    // 总行数
    totalLines: (state) => state.allLines.length,

    // 过滤后的行数
    filteredCount: (state) => state.filteredLines.length,

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
     * 加载文本内容
     */
    loadText(text: string) {
      const result = parseText(text)

      if (result.data) {
        this.allLines = result.data
        this.fileType = result.type
        // 默认全部展开
        this.allLines.forEach((line) => {
          line.isExpanded = true
        })
        this.applyFilter()
      } else {
        this.allLines = []
        this.filteredLines = []
        this.fileType = null
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
    },

    /**
     * 设置过滤模式
     */
    setFilterMode(mode: FilterMode) {
      this.filterMode = mode
      this.applyFilter()
    },

    /**
     * 设置搜索模式
     */
    setSearchMode(mode: SearchMode) {
      this.searchMode = mode
      this.applyFilter()
    },

    /**
     * 切换是否搜索解码内容
     */
    toggleSearchDecoded() {
      this.searchDecoded = !this.searchDecoded
      this.applyFilter()
    },

    /**
     * 应用过滤
     */
    applyFilter() {
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
    }
  }
})
