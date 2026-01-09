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
  // 是否启用自动解码
  autoDecodeEnabled: boolean
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
  // JSON 缩进字符数
  indentSize: number
  // 字体
  fontFamily: string
  // 字体大小（像素）
  fontSize: number
  // 后台加载状态
  isBackgroundLoading: boolean
  // 已加载行数
  loadedCount: number
  // 总行数
  totalCount: number
  // 上次过滤参数（用于优化，避免重复过滤）
  lastFilterParams: {
    keyword: string
    filterMode: FilterMode
    searchMode: SearchMode
    autoDecodeEnabled: boolean
  } | null
  // 当前渲染任务ID（用于取消旧的渲染任务）
  currentRenderTaskId: number
}

export const useJsonlStore = defineStore('jsonl', {
  state: (): JsonlState => ({
    allLines: [],
    filteredLines: [],
    searchKeyword: '',
    filterMode: 'line',
    searchMode: 'fuzzy',
    autoDecodeEnabled: true,
    fileType: null,
    theme: 'light',
    currentThemeColor: 'forest',
    globalExpanded: true,
    expandDepth: -1,
    maxDisplayLines: 10,
    indentSize: 2,
    fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
    fontSize: 13,
    isBackgroundLoading: false,
    loadedCount: 0,
    totalCount: 0,
    lastFilterParams: null,
    currentRenderTaskId: 0,
  }),

  getters: {
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
     * 加载文本内容（一次性加载全部数据）
     */
    loadText(text: string) {
      const funcStartTime = performance.now()
      console.log(`[${new Date().toISOString()}] ========== loadText 开始 ==========`)
      console.log(`[${new Date().toISOString()}] 文本长度: ${text.length} 字符`)
      console.log(`[${new Date().toISOString()}] 当前 allLines 长度: ${this.allLines.length}`)
      console.log(`[${new Date().toISOString()}] 当前 filteredLines 长度: ${this.filteredLines.length}`)
      console.log(`[${new Date().toISOString()}] 文本前100字符: ${text.substring(0, 100)}`)
      console.log(`[${new Date().toISOString()}] 文本最后100字符: ${text.substring(Math.max(0, text.length - 100))}`)

      // 重置过滤参数，确保新数据会触发过滤
      this.lastFilterParams = null

      // 使用一次性解析（不再有后台加载）
      const parseStartTime = performance.now()
      const result = parseTextIncremental(text, (lines, isComplete) => {
        console.log(`[${new Date().toISOString()}] 解析完成回调: lines=${lines.length}, isComplete=${isComplete}`)
      })

      const parseTime = performance.now() - parseStartTime
      console.log(`[${new Date().toISOString()}] parseTextIncremental 返回: type=${result.type}, data=${result.data ? result.data.length : null} 行, 耗时 ${parseTime.toFixed(2)}ms`)

      if (result.data) {
        // 一次性加载所有数据
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
        console.log(`[${new Date().toISOString()}] 数据已加载: ${this.allLines.length} 行`)
        console.log(`[${new Date().toISOString()}] ========== loadText 完成 ========== 总耗时 ${funcTime.toFixed(2)}ms`)
      } else {
        console.error(`[${new Date().toISOString()}] 解析失败: result.data 为 null`)
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
      console.log(`[${new Date().toISOString()}] ===== 加载新数据，清理旧数据 =====`)

      // 取消当前渲染任务
      this.currentRenderTaskId++

      // 彻底清空旧数据（帮助垃圾回收）
      if (this.allLines.length > 0) {
        this.allLines.length = 0
        this.allLines = []
      }
      if (this.filteredLines.length > 0) {
        this.filteredLines.length = 0
        this.filteredLines = []
      }

      // 加载新数据
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
      const funcStartTime = performance.now()
      console.log(`[${new Date().toISOString()}] ===== setSearchKeyword 开始 =====`)
      console.log(`[${new Date().toISOString()}] 关键字: "${keyword}"`)

      this.searchKeyword = keyword

      const filterStartTime = performance.now()
      this.applyFilter()
      const filterTime = performance.now() - filterStartTime
      console.log(`[${new Date().toISOString()}] applyFilter 完成: ${this.filteredLines.length} 行, 耗时 ${filterTime.toFixed(2)}ms`)

      const funcTime = performance.now() - funcStartTime
      console.log(`[${new Date().toISOString()}] ===== setSearchKeyword 完成 ===== 总耗时 ${funcTime.toFixed(2)}ms`)
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
     * 切换自动解码
     */
    toggleAutoDecodeEnabled() {
      this.autoDecodeEnabled = !this.autoDecodeEnabled
      this.applyFilter()
    },

    /**
     * 应用过滤
     * @returns {boolean} 是否真的执行了过滤（false表示跳过）
     */
    applyFilter(): boolean {
      const funcStartTime = performance.now()
      const hasSearch = !!this.searchKeyword.trim()

      // 构建当前过滤参数
      const currentParams = {
        keyword: this.searchKeyword.trim(),
        filterMode: this.filterMode,
        searchMode: this.searchMode,
        autoDecodeEnabled: this.autoDecodeEnabled
      }

      // 检查参数是否与上次相同，如果相同则跳过过滤
      if (this.lastFilterParams &&
          this.lastFilterParams.keyword === currentParams.keyword &&
          this.lastFilterParams.filterMode === currentParams.filterMode &&
          this.lastFilterParams.searchMode === currentParams.searchMode &&
          this.lastFilterParams.autoDecodeEnabled === currentParams.autoDecodeEnabled) {
        console.log(`[${new Date().toISOString()}] applyFilter 跳过: 过滤参数未改变`)
        return false // 跳过过滤
      }

      // 优化：当上次和本次关键字都为空时，修改其他参数不需要重新过滤
      if (!hasSearch && this.lastFilterParams && !this.lastFilterParams.keyword) {
        console.log(`[${new Date().toISOString()}] applyFilter 跳过: 关键字为空，其他参数变化不影响结果`)
        // 更新参数记录，但不重新过滤
        this.lastFilterParams = currentParams
        return false
      }

      console.log(`[${new Date().toISOString()}] applyFilter 开始: hasSearch=${hasSearch}, allLines=${this.allLines.length}`)

      // 彻底清空旧的 filteredLines，帮助垃圾回收
      if (this.filteredLines.length > 0) {
        // 先清空数组内容
        this.filteredLines.length = 0
        // 然后重新赋值（更彻底地释放引用）
        this.filteredLines = []
      }

      if (!hasSearch) {
        this.filteredLines = [...this.allLines]
        console.log(`[${new Date().toISOString()}] 无搜索，直接使用全部数据 (${this.allLines.length} 行)`)
      } else {
        const filterStartTime = performance.now()
        this.filteredLines = filterJsonLines(
          this.allLines,
          this.searchKeyword,
          this.filterMode,
          this.searchMode,
          this.autoDecodeEnabled
        )
        const filterTime = performance.now() - filterStartTime
        console.log(`[${new Date().toISOString()}] filterJsonLines 完成: ${this.filteredLines.length}/${this.allLines.length} 行匹配, 耗时 ${filterTime.toFixed(2)}ms`)
      }

      // 记录本次过滤参数
      this.lastFilterParams = currentParams

      const funcTime = performance.now() - funcStartTime
      console.log(`[${new Date().toISOString()}] applyFilter 完成, 总耗时 ${funcTime.toFixed(2)}ms`)
      return true // 执行了过滤
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
      this.lastFilterParams = null // 重置过滤参数
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
     * 清理所有数据，释放内存
     * 在页面卸载或重新加载文件时调用
     */
    cleanup() {
      console.log(`[${new Date().toISOString()}] ===== 清理 Store 数据，释放内存 =====`)

      // 取消当前渲染任务
      this.currentRenderTaskId++

      // 彻底清空所有数据数组（帮助垃圾回收）
      if (this.allLines.length > 0) {
        this.allLines.length = 0
        this.allLines = []
      }
      if (this.filteredLines.length > 0) {
        this.filteredLines.length = 0
        this.filteredLines = []
      }

      // 重置计数器
      this.loadedCount = 0
      this.totalCount = 0

      // 重置搜索相关
      this.searchKeyword = ''
      this.lastFilterParams = null

      // 重置状态
      this.isBackgroundLoading = false

      console.log(`[${new Date().toISOString()}] Store 数据清理完成`)
    }
  }
})
