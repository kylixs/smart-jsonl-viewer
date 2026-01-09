/**
 * 窗口式虚拟滚动引擎
 *
 * 核心思路：
 * 1. 不计算所有项的高度，只维护当前渲染窗口
 * 2. 窗口内的项都真实渲染，自动测量实际高度
 * 3. 滚动到顶部/底部附近时动态加载更多项
 * 4. 通过调整偏移量保持视觉位置稳定
 */

export interface WindowedScrollConfig {
  // 初始窗口大小（项数）
  initialWindowSize: number
  // 触发加载的阈值（像素）
  loadThreshold: number
  // 每次加载的批次大小（项数）
  batchSize: number
  // 最大窗口大小（项数，防止窗口无限增长）
  maxWindowSize: number
}

export interface RenderWindow {
  // 当前渲染范围的起始索引（数据源中的索引）
  startIndex: number
  // 当前渲染范围的结束索引（数据源中的索引）
  endIndex: number
}

/**
 * 窗口式虚拟滚动管理器
 */
export class WindowedVirtualScrollManager {
  private config: WindowedScrollConfig
  private container: HTMLElement | null = null
  private contentWrapper: HTMLElement | null = null
  private totalCount: number = 0

  // 当前渲染窗口
  private renderWindow: RenderWindow = {
    startIndex: 0,
    endIndex: 0
  }

  // 顶部填充高度（模拟前面未渲染的内容）
  private topPadding: number = 0

  // 底部填充高度（模拟后面未渲染的内容）
  private bottomPadding: number = 0

  // 是否正在加载中（防止重复触发）
  private isLoadingPrev: boolean = false
  private isLoadingNext: boolean = false

  // 是否正在执行编程式跳转（防止触发自动加载）
  private isProgrammaticScroll: boolean = false

  // 编程式滚动的清除定时器
  private programmaticScrollTimer: number | null = null

  // 是否需要用户交互才能触发下一次自动加载
  private requireUserInteraction: boolean = false

  // 滚动停止检测定时器
  private scrollStopTimer: number | null = null
  // 滚动停止延迟（毫秒）- 滚动停止后才清除交互标志
  private readonly SCROLL_STOP_DELAY: number = 300

  // 上次加载的时间戳（用于防抖）
  private lastLoadTime: number = 0
  // 防抖间隔（毫秒）- 防止加载过快
  private readonly DEBOUNCE_INTERVAL: number = 300

  constructor(config: Partial<WindowedScrollConfig> = {}) {
    this.config = {
      initialWindowSize: config.initialWindowSize ?? 50,
      loadThreshold: config.loadThreshold ?? 500,
      batchSize: config.batchSize ?? 20,
      maxWindowSize: config.maxWindowSize ?? 200
    }
  }

  /**
   * 初始化
   */
  init(container: HTMLElement, contentWrapper: HTMLElement, totalCount: number) {
    this.container = container
    this.contentWrapper = contentWrapper
    this.totalCount = totalCount

    // 初始化渲染窗口
    this.renderWindow = {
      startIndex: 0,
      endIndex: Math.min(this.config.initialWindowSize, totalCount)
    }

    // 初始化填充
    this.topPadding = 0
    this.bottomPadding = 0

    // 绑定滚动事件
    container.addEventListener('scroll', this.handleScroll)

    if (import.meta.env.DEV) {
      console.log('[WindowedVirtualScroll] 初始化:', {
        totalCount,
        initialWindow: this.renderWindow,
        config: this.config
      })
    }

    // 初始化后立即检查是否需要加载更多
    // 使用 setTimeout 确保 DOM 已经渲染完成
    setTimeout(() => {
      this.checkAndLoadMore()
    }, 100)
  }

  /**
   * 处理滚动事件
   */
  private handleScroll = () => {
    // 检测是否为用户主动滚动（不是加载中，也不是编程式滚动）
    if (!this.isLoadingPrev && !this.isLoadingNext && !this.isProgrammaticScroll) {
      // 这是用户主动滚动，启动滚动停止检测器
      // 只有滚动停止后才清除"需要用户交互"标志
      if (this.requireUserInteraction) {
        // 清除之前的定时器
        if (this.scrollStopTimer !== null) {
          window.clearTimeout(this.scrollStopTimer)
        }

        // 设置新的定时器：滚动停止 300ms 后清除标志
        this.scrollStopTimer = window.setTimeout(() => {
          this.requireUserInteraction = false
          this.scrollStopTimer = null
          if (import.meta.env.DEV) {
            console.log('[WindowedVirtualScroll] 滚动已停止，清除交互标志')
          }
        }, this.SCROLL_STOP_DELAY)
      }
    }

    this.checkAndLoadMore()
  }

  /**
   * 清除所有自动滚动任务，并设置交互标志
   * 在插入内容、调整 scrollOffset 后调用
   */
  private cancelAutoScrollTasks() {
    // 清除滚动停止定时器
    if (this.scrollStopTimer !== null) {
      window.clearTimeout(this.scrollStopTimer)
      this.scrollStopTimer = null
    }

    // 设置交互标志，防止立即触发新的加载
    this.requireUserInteraction = true

    if (import.meta.env.DEV) {
      console.log('[WindowedVirtualScroll] 已清除所有自动滚动任务，设置交互标志')
    }
  }

  /**
   * 设置编程式滚动标志，并在延迟后自动清除
   * @param delay 延迟时间（毫秒），默认 500ms
   */
  private setProgrammaticScroll(delay: number = 500) {
    // 清除之前的定时器
    if (this.programmaticScrollTimer !== null) {
      clearTimeout(this.programmaticScrollTimer)
    }

    // 设置标志
    this.isProgrammaticScroll = true

    // 延迟清除标志
    this.programmaticScrollTimer = window.setTimeout(() => {
      this.isProgrammaticScroll = false
      this.programmaticScrollTimer = null

      if (import.meta.env.DEV) {
        console.log('[WindowedVirtualScroll] 编程式滚动标志已清除')
      }
    }, delay)
  }

  /**
   * 检查并加载更多数据
   */
  private checkAndLoadMore() {
    if (!this.container || !this.contentWrapper) return

    // 如果正在执行编程式跳转，跳过自动加载检查
    if (this.isProgrammaticScroll) {
      return
    }

    // 如果需要用户交互才能触发加载，跳过
    if (this.requireUserInteraction) {
      if (import.meta.env.DEV) {
        console.log('[WindowedVirtualScroll] 需要用户交互，跳过自动加载')
      }
      return
    }

    // 防抖：检查距离上次加载的时间间隔
    const now = Date.now()
    if (now - this.lastLoadTime < this.DEBOUNCE_INTERVAL) {
      if (import.meta.env.DEV) {
        console.log('[WindowedVirtualScroll] 防抖跳过，距离上次加载时间过短:', now - this.lastLoadTime, 'ms')
      }
      return
    }

    const scrollTop = this.container.scrollTop
    const scrollHeight = this.container.scrollHeight
    const clientHeight = this.container.clientHeight
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight)

    if (import.meta.env.DEV) {
      console.log('[WindowedVirtualScroll] 检查是否需要加载:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        distanceToBottom,
        loadThreshold: this.config.loadThreshold,
        currentWindow: this.renderWindow,
        totalCount: this.totalCount,
        '是否到达底部?': distanceToBottom < this.config.loadThreshold,
        '还有更多数据?': this.renderWindow.endIndex < this.totalCount,
        '是否正在加载?': this.isLoadingNext,
        '能否触发加载?': distanceToBottom < this.config.loadThreshold && this.renderWindow.endIndex < this.totalCount && !this.isLoadingNext
      })
    }

    // 接近顶部 - 加载前面的项
    if (scrollTop < this.config.loadThreshold && this.renderWindow.startIndex > 0 && !this.isLoadingPrev) {
      this.loadPrevious()
    }

    // 接近底部 - 加载后面的项
    if (distanceToBottom < this.config.loadThreshold && this.renderWindow.endIndex < this.totalCount && !this.isLoadingNext) {
      if (import.meta.env.DEV) {
        console.log('[WindowedVirtualScroll] ✅ 触发向下加载:', {
          distanceToBottom,
          threshold: this.config.loadThreshold,
          endIndex: this.renderWindow.endIndex,
          totalCount: this.totalCount
        })
      }
      this.loadNext()
    }
  }

  /**
   * 加载前面的项（使用禁用滚动条方法锁定视觉位置）
   */
  private loadPrevious() {
    if (this.isLoadingPrev || !this.container || !this.contentWrapper) return

    // 更新加载时间戳
    this.lastLoadTime = Date.now()
    this.isLoadingPrev = true

    // 计算新的起始索引
    const newStartIndex = Math.max(0, this.renderWindow.startIndex - this.config.batchSize)
    const addedCount = this.renderWindow.startIndex - newStartIndex

    if (addedCount === 0) {
      this.isLoadingPrev = false
      return
    }

    // 【新方法】保存当前滚动位置和视口状态
    const oldScrollTop = this.container.scrollTop
    const oldScrollHeight = this.container.scrollHeight

    // 【新方法】禁用滚动条，防止浏览器自动调整滚动位置
    const oldOverflow = this.container.style.overflow
    this.container.style.overflow = 'hidden'

    if (import.meta.env.DEV) {
      console.log('[WindowedVirtualScroll] ===== 加载前面的项 开始 (禁用滚动条方法) =====')
      console.log('[WindowedVirtualScroll] oldStartIndex:', this.renderWindow.startIndex)
      console.log('[WindowedVirtualScroll] newStartIndex:', newStartIndex)
      console.log('[WindowedVirtualScroll] addedCount:', addedCount)
      console.log('[WindowedVirtualScroll] oldScrollTop:', oldScrollTop)
      console.log('[WindowedVirtualScroll] oldScrollHeight:', oldScrollHeight)
    }

    // 更新窗口 - 先只添加顶部，不移除底部
    this.renderWindow.startIndex = newStartIndex

    // 触发重新渲染（新项会被添加到顶部）
    this.onWindowChange()

    // 使用双重 RAF 确保 Vue 渲染完成
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!this.container || !this.contentWrapper) {
          this.isLoadingPrev = false
          return
        }

        // 【新方法】计算新增内容的高度（新 scrollHeight - 旧 scrollHeight）
        const newScrollHeight = this.container.scrollHeight
        const addedHeight = newScrollHeight - oldScrollHeight

        // 【新方法】调整 scrollTop，保持视觉位置不变
        // 由于在顶部插入了内容，需要将 scrollTop 增加 addedHeight
        const newScrollTop = oldScrollTop + addedHeight

        if (import.meta.env.DEV) {
          console.log('[WindowedVirtualScroll] 计算位置调整:')
          console.log('[WindowedVirtualScroll] - newScrollHeight:', newScrollHeight)
          console.log('[WindowedVirtualScroll] - addedHeight:', addedHeight)
          console.log('[WindowedVirtualScroll] - oldScrollTop:', oldScrollTop)
          console.log('[WindowedVirtualScroll] - newScrollTop:', newScrollTop)
        }

        // 调整滚动位置
        this.container.scrollTop = newScrollTop

        // 【新方法】恢复滚动条
        this.container.style.overflow = oldOverflow

        // 检查窗口大小，如果超过最大值，从底部移除一些项
        const currentWindowSize = this.renderWindow.endIndex - this.renderWindow.startIndex
        if (currentWindowSize > this.config.maxWindowSize) {
          const overflow = currentWindowSize - this.config.maxWindowSize
          this.renderWindow.endIndex -= overflow

          if (import.meta.env.DEV) {
            console.log('[WindowedVirtualScroll] 窗口溢出，从底部移除:', overflow)
          }

          // 再次触发渲染，移除底部项
          // 注意：此时不需要调整scrollTop，因为移除的是底部内容
          this.onWindowChange()
        }

        if (import.meta.env.DEV) {
          console.log('[WindowedVirtualScroll] 实际 scrollTop:', this.container.scrollTop)
          console.log('[WindowedVirtualScroll] ===== 加载前面的项 完成 =====')
        }

        this.isLoadingPrev = false

        // 清除所有自动滚动任务，防止连续自动加载
        this.cancelAutoScrollTasks()
      })
    })
  }

  /**
   * 加载后面的项
   */
  private loadNext() {
    if (this.isLoadingNext || !this.container || !this.contentWrapper) return

    // 更新加载时间戳
    this.lastLoadTime = Date.now()
    this.isLoadingNext = true

    // 计算新的结束索引
    const newEndIndex = Math.min(this.totalCount, this.renderWindow.endIndex + this.config.batchSize)
    const addedCount = newEndIndex - this.renderWindow.endIndex

    if (addedCount === 0) {
      this.isLoadingNext = false
      return
    }

    // 更新窗口
    const oldEndIndex = this.renderWindow.endIndex
    this.renderWindow.endIndex = newEndIndex

    // 检查窗口大小，如果超过最大值，从顶部移除一些项
    const currentWindowSize = this.renderWindow.endIndex - this.renderWindow.startIndex
    if (currentWindowSize > this.config.maxWindowSize) {
      const overflow = currentWindowSize - this.config.maxWindowSize
      this.renderWindow.startIndex += overflow

      // 如果从顶部移除了项，需要调整滚动位置
      requestAnimationFrame(() => {
        if (!this.container || !this.contentWrapper) return

        // 减去顶部padding，因为那些项已经不在DOM中了
        this.topPadding = 0

        this.isLoadingNext = false

        // 清除所有自动滚动任务，防止连续自动加载
        this.cancelAutoScrollTasks()
      })
    } else {
      this.isLoadingNext = false

      // 清除所有自动滚动任务，防止连续自动加载
      this.cancelAutoScrollTasks()
    }

    if (import.meta.env.DEV) {
      console.log('[WindowedVirtualScroll] 加载后面的项:', {
        oldEndIndex,
        newEndIndex,
        addedCount,
        window: this.renderWindow
      })
    }

    // 触发重新渲染
    this.onWindowChange()
  }

  /**
   * 窗口变化回调（由外部设置）
   */
  private onWindowChange: () => void = () => {}

  /**
   * 设置窗口变化回调
   */
  setWindowChangeCallback(callback: () => void) {
    this.onWindowChange = callback
  }

  /**
   * 获取当前渲染窗口
   */
  getRenderWindow(): RenderWindow {
    return { ...this.renderWindow }
  }

  /**
   * 获取顶部填充样式
   */
  getTopPaddingStyle(): { height: string } {
    return {
      height: `${this.topPadding}px`
    }
  }

  /**
   * 获取底部填充样式
   */
  getBottomPaddingStyle(): { height: string } {
    return {
      height: `${this.bottomPadding}px`
    }
  }

  /**
   * 更新总数据量
   */
  updateTotalCount(count: number) {
    this.totalCount = count

    // 调整窗口范围
    if (this.renderWindow.endIndex > count) {
      this.renderWindow.endIndex = count
    }

    // 如果窗口太小，尝试扩展
    const currentWindowSize = this.renderWindow.endIndex - this.renderWindow.startIndex
    if (currentWindowSize < this.config.initialWindowSize && this.renderWindow.endIndex < count) {
      this.renderWindow.endIndex = Math.min(count, this.renderWindow.startIndex + this.config.initialWindowSize)
    }
  }

  /**
   * 滚动到指定索引
   */
  scrollToIndex(index: number, smooth: boolean = false) {
    if (!this.container) return

    // 设置编程式滚动标志
    this.setProgrammaticScroll(800)

    // 如果索引在当前窗口内，直接滚动到该元素
    if (index >= this.renderWindow.startIndex && index < this.renderWindow.endIndex) {
      const relativeIndex = index - this.renderWindow.startIndex
      const child = this.contentWrapper?.children[relativeIndex] as HTMLElement

      if (child) {
        child.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'start'
        })
      }
    } else {
      // 如果索引不在当前窗口，重置窗口到该位置
      this.renderWindow.startIndex = Math.max(0, index - Math.floor(this.config.initialWindowSize / 2))
      this.renderWindow.endIndex = Math.min(
        this.totalCount,
        this.renderWindow.startIndex + this.config.initialWindowSize
      )

      this.onWindowChange()

      // 等待渲染后滚动到顶部
      requestAnimationFrame(() => {
        if (this.container) {
          this.container.scrollTop = 0
        }
      })
    }
  }

  /**
   * 滚动到顶部（直接跳到第一个窗口）
   */
  scrollToTop(_smooth: boolean = false) {
    if (!this.container) return

    if (import.meta.env.DEV) {
      console.log('[WindowedVirtualScroll] scrollToTop: 直接跳到第一个窗口')
    }

    // 设置编程式滚动标志，延迟 800ms 清除
    this.setProgrammaticScroll(800)

    // 直接设置窗口到开始位置
    this.renderWindow.startIndex = 0
    this.renderWindow.endIndex = Math.min(this.totalCount, this.config.initialWindowSize)

    // 触发重新渲染
    this.onWindowChange()

    // 等待渲染后滚动到顶部
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.container) {
          this.container.scrollTop = 0

          if (import.meta.env.DEV) {
            console.log('[WindowedVirtualScroll] scrollToTop 完成，窗口:', this.renderWindow)
          }
        }
      })
    })
  }

  /**
   * 滚动到底部（直接跳到最后一个窗口）
   */
  scrollToBottom(_smooth: boolean = false) {
    if (!this.container) return

    if (import.meta.env.DEV) {
      console.log('[WindowedVirtualScroll] scrollToBottom: 直接跳到最后一个窗口')
    }

    // 设置编程式滚动标志，延迟 800ms 清除（确保所有滚动事件都处理完）
    this.setProgrammaticScroll(800)

    // 直接设置窗口到结束位置
    this.renderWindow.endIndex = this.totalCount
    this.renderWindow.startIndex = Math.max(0, this.totalCount - this.config.initialWindowSize)

    // 触发重新渲染
    this.onWindowChange()

    // 等待渲染后滚动到底部
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.container) {
          // 计算正确的底部位置：scrollHeight - clientHeight
          const maxScrollTop = this.container.scrollHeight - this.container.clientHeight
          this.container.scrollTop = maxScrollTop

          if (import.meta.env.DEV) {
            console.log('[WindowedVirtualScroll] scrollToBottom 完成，窗口:', this.renderWindow)
            console.log('[WindowedVirtualScroll] scrollTop:', this.container.scrollTop)
            console.log('[WindowedVirtualScroll] scrollHeight:', this.container.scrollHeight)
            console.log('[WindowedVirtualScroll] clientHeight:', this.container.clientHeight)
            console.log('[WindowedVirtualScroll] maxScrollTop:', maxScrollTop)
          }
        }
      })
    })
  }

  /**
   * 判断是否在顶部
   */
  isAtTop(): boolean {
    if (!this.container) return false

    // 检查滚动位置是否在顶部
    return this.container.scrollTop <= 5
  }

  /**
   * 判断是否在底部
   */
  isAtBottom(): boolean {
    if (!this.container) return false

    const scrollTop = this.container.scrollTop
    const scrollHeight = this.container.scrollHeight
    const clientHeight = this.container.clientHeight

    return scrollTop + clientHeight >= scrollHeight - 5
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.container) {
      this.container.removeEventListener('scroll', this.handleScroll)
    }

    // 清除编程式滚动定时器
    if (this.programmaticScrollTimer !== null) {
      clearTimeout(this.programmaticScrollTimer)
      this.programmaticScrollTimer = null
    }

    // 清除滚动停止定时器
    if (this.scrollStopTimer !== null) {
      window.clearTimeout(this.scrollStopTimer)
      this.scrollStopTimer = null
    }

    this.container = null
    this.contentWrapper = null
  }
}

/**
 * 创建默认配置
 */
export function createDefaultWindowedConfig(): WindowedScrollConfig {
  return {
    initialWindowSize: 50,    // 初始显示50项
    loadThreshold: 500,       // 距离边界500px时加载
    batchSize: 20,            // 每次加载20项
    maxWindowSize: 200        // 最大窗口200项
  }
}
