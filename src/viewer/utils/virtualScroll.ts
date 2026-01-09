/**
 * 虚拟滚动核心实现
 * 只渲染可见区域 + 缓冲区的内容，自动释放超出范围的 DOM
 */

export interface VirtualScrollConfig {
  // 每行的估计高度（像素）
  itemHeight: number
  // 视窗高度（行数）- 可动态调整
  viewportRows: number
  // 缓冲区大小（前后各保留多少行）
  bufferSize: number
}

export interface VirtualScrollState {
  // 总数据行数
  totalCount: number
  // 滚动位置（像素）
  scrollTop: number
  // 当前视窗的起始索引
  startIndex: number
  // 当前视窗的结束索引（不含）
  endIndex: number
  // 实际渲染的起始索引（包含缓冲区）
  renderStartIndex: number
  // 实际渲染的结束索引（包含缓冲区）
  renderEndIndex: number
  // 虚拟容器总高度（用于滚动条）
  totalHeight: number
  // 偏移量（用于定位可见区域）
  offsetY: number
}

export interface ScrollToOptions {
  // 对齐方式
  align?: 'start' | 'center' | 'end'
  // 平滑滚动
  smooth?: boolean
  // 高亮行
  highlight?: boolean
}

/**
 * 虚拟滚动管理器
 */
export class VirtualScrollManager {
  private config: VirtualScrollConfig
  private state: VirtualScrollState
  private container: HTMLElement | null = null
  private isDestroyed = false
  private scrollRAF: number | null = null

  constructor(config: VirtualScrollConfig) {
    this.config = config
    this.state = {
      totalCount: 0,
      scrollTop: 0,
      startIndex: 0,
      endIndex: 0,
      renderStartIndex: 0,
      renderEndIndex: 0,
      totalHeight: 0,
      offsetY: 0
    }
  }

  /**
   * 初始化虚拟滚动容器
   */
  init(container: HTMLElement, totalCount: number) {
    this.container = container
    this.setTotalCount(totalCount)
    this.updateViewport()
  }

  /**
   * 设置总数据量
   */
  setTotalCount(count: number) {
    this.state.totalCount = count
    this.state.totalHeight = count * this.config.itemHeight
    this.updateViewport()
  }

  /**
   * 动态调整视窗高度（行数）
   */
  setViewportRows(rows: number) {
    this.config.viewportRows = rows
    this.updateViewport()
  }

  /**
   * 处理滚动事件（带 RAF 防抖优化）
   */
  handleScroll(scrollTop: number) {
    // 取消之前的 RAF
    if (this.scrollRAF) {
      cancelAnimationFrame(this.scrollRAF)
    }

    // 使用 RAF 防抖
    this.scrollRAF = requestAnimationFrame(() => {
      this.state.scrollTop = scrollTop
      this.updateViewport()
      this.scrollRAF = null
    })
  }

  /**
   * 更新视窗范围
   */
  private updateViewport() {
    const { itemHeight, viewportRows, bufferSize } = this.config
    const { scrollTop, totalCount } = this.state

    // 计算可见区域的起始和结束索引
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + viewportRows,
      totalCount
    )

    // 计算包含缓冲区的渲染范围
    const renderStartIndex = Math.max(0, startIndex - bufferSize)
    const renderEndIndex = Math.min(totalCount, endIndex + bufferSize)

    // 计算偏移量（用于定位）
    const offsetY = renderStartIndex * itemHeight

    this.state.startIndex = startIndex
    this.state.endIndex = endIndex
    this.state.renderStartIndex = renderStartIndex
    this.state.renderEndIndex = renderEndIndex
    this.state.offsetY = offsetY

    if (import.meta.env.DEV) {
      console.log('[VirtualScroll] 视窗更新:', {
        可见区域: `${startIndex} - ${endIndex} (${endIndex - startIndex} 行)`,
        渲染区域: `${renderStartIndex} - ${renderEndIndex} (${renderEndIndex - renderStartIndex} 行)`,
        偏移量: `${offsetY}px`
      })
    }
  }

  /**
   * 获取当前应该渲染的数据索引范围
   */
  getRenderRange(): { start: number; end: number } {
    return {
      start: this.state.renderStartIndex,
      end: this.state.renderEndIndex
    }
  }

  /**
   * 获取可见视窗范围
   */
  getViewport(): { startIndex: number; endIndex: number } {
    return {
      startIndex: this.state.startIndex,
      endIndex: this.state.endIndex
    }
  }

  /**
   * 获取虚拟容器的样式（用于撑开滚动条）
   */
  getContainerStyle(): { height: string } {
    return {
      height: `${this.state.totalHeight}px`
    }
  }

  /**
   * 获取内容区域的样式（用于定位可见内容）
   */
  getContentStyle(): { transform: string; willChange: string } {
    return {
      transform: `translateY(${this.state.offsetY}px)`,
      willChange: 'transform'
    }
  }

  /**
   * 滚动到指定索引
   */
  scrollToIndex(index: number, options: ScrollToOptions = {}) {
    const { align = 'start', smooth = false, highlight = false } = options
    const { itemHeight, viewportRows } = this.config

    let scrollTop: number

    switch (align) {
      case 'start':
        scrollTop = index * itemHeight
        break
      case 'center':
        scrollTop = (index - Math.floor(viewportRows / 2)) * itemHeight
        break
      case 'end':
        scrollTop = (index - viewportRows + 1) * itemHeight
        break
    }

    // 边界检查
    scrollTop = Math.max(0, Math.min(scrollTop, this.state.totalHeight - viewportRows * itemHeight))

    // 执行滚动
    if (this.container) {
      this.container.scrollTo({
        top: scrollTop,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }

    // 立即更新状态
    this.handleScroll(scrollTop)

    // 高亮行（如果需要）
    if (highlight) {
      this.highlightRow(index)
    }
  }

  /**
   * 滚动到底部
   */
  scrollToBottom(smooth: boolean = false) {
    const lastIndex = this.state.totalCount - 1
    this.scrollToIndex(lastIndex, {
      align: 'end',
      smooth
    })
  }

  /**
   * 滚动到顶部
   */
  scrollToTop(smooth: boolean = false) {
    this.scrollToIndex(0, {
      align: 'start',
      smooth
    })
  }

  /**
   * 判断是否在底部
   */
  isAtBottom(): boolean {
    const { scrollTop, totalHeight } = this.state
    const containerHeight = this.container?.clientHeight || 0

    // 允许 5px 的误差
    return scrollTop + containerHeight >= totalHeight - 5
  }

  /**
   * 高亮指定行（短暂闪烁效果）
   */
  private highlightRow(index: number) {
    // 等待 DOM 更新后再高亮
    setTimeout(() => {
      const rowElement = document.querySelector(`[data-index="${index}"]`)
      if (rowElement) {
        rowElement.classList.add('highlight-flash')
        setTimeout(() => {
          rowElement.classList.remove('highlight-flash')
        }, 1000)
      }
    }, 100)
  }

  /**
   * 获取总数据量
   */
  getTotalCount(): number {
    return this.state.totalCount
  }

  /**
   * 获取当前状态快照（用于调试）
   */
  getState(): Readonly<VirtualScrollState> {
    return { ...this.state }
  }

  /**
   * 销毁
   */
  destroy() {
    // 取消未完成的 RAF
    if (this.scrollRAF) {
      cancelAnimationFrame(this.scrollRAF)
      this.scrollRAF = null
    }

    this.isDestroyed = true
    this.container = null
    console.log('[VirtualScroll] 已销毁')
  }
}

/**
 * 计算视窗高度（根据容器高度和行高）
 */
export function calculateViewportRows(
  containerHeight: number,
  itemHeight: number
): number {
  return Math.ceil(containerHeight / itemHeight)
}

/**
 * 创建虚拟滚动管理器的默认配置
 */
export function createDefaultConfig(): VirtualScrollConfig {
  return {
    itemHeight: 40,       // 每行 40px
    viewportRows: 200,    // 默认显示 200 行
    bufferSize: 100       // 前后各保留 100 行
  }
}
