/**
 * 动态高度虚拟滚动核心实现
 * 支持可变高度的虚拟滚动，每个数据项的实际高度可以动态变化（如展开/折叠）
 */

export interface VirtualScrollConfig {
  // 视窗高度（像素）- 可动态调整
  viewportHeight: number
  // 缓冲区大小（像素）- 前后各保留多少像素
  bufferSize: number
  // 每项的默认估计高度（用于初始计算，后续会被实际高度覆盖）
  defaultItemHeight: number
}

export interface VirtualScrollState {
  // 总数据行数
  totalCount: number
  // 滚动位置（像素）
  scrollTop: number
  // 当前视窗的数据索引范围（基于 scrollTop 和 viewportHeight 计算得出）
  startIndex: number
  endIndex: number
  // 实际渲染的数据索引范围（包含缓冲区）
  renderStartIndex: number
  renderEndIndex: number
  // 虚拟容器总高度（用于滚动条）- 所有项的实际高度之和
  totalHeight: number
  // 内容区域的 Y 偏移量（用于定位可见内容）- 等于 renderStartIndex 的起始位置
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
 * 动态高度虚拟滚动管理器
 *
 * 核心概念：
 * 1. Data: 数据源数组，每个 item 可以有可变高度
 * 2. Height Cache: 存储每个 item 的实际高度（初始为 defaultItemHeight，渲染后更新为实际高度）
 * 3. Position Cache: 预计算每个 item 的起始位置（基于累积高度）
 * 4. Scroll: 当前 scrollTop 像素位置
 * 5. Viewport: 可视区域高度
 * 6. Render: 基于滚动位置计算需要渲染的 item 范围
 *
 * 计算公式：
 * - itemPosition[i] = sum(heightCache[0..i-1])  # item i 的起始位置
 * - totalHeight = sum(heightCache[0..n-1])      # 总高度
 * - startIndex = 第一个 position >= scrollTop 的 item
 * - endIndex = 最后一个 position <= scrollTop + viewportHeight 的 item
 * - offsetY = itemPosition[renderStartIndex]    # 内容区域偏移量
 */
export class VirtualScrollManager {
  private config: VirtualScrollConfig
  private state: VirtualScrollState
  private container: HTMLElement | null = null
  private isDestroyed = false
  private scrollRAF: number | null = null

  // 高度缓存：itemIndex -> 实际高度（像素）
  private heightCache: Map<number, number> = new Map()
  // 位置缓存：itemIndex -> 起始位置（像素）
  private positionCache: Map<number, number> = new Map()

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
    const oldCount = this.state.totalCount
    this.state.totalCount = count

    // 如果数据量减少，清除超出范围的高度缓存
    if (count < oldCount) {
      for (let i = count; i < oldCount; i++) {
        this.heightCache.delete(i)
        this.positionCache.delete(i)
      }
    }

    this.rebuildPositionCache()
    this.updateViewport()
  }

  /**
   * 动态调整视窗高度（像素）
   */
  setViewportHeight(height: number) {
    this.config.viewportHeight = height
    this.updateViewport()
  }

  /**
   * 更新指定索引项的高度（当展开/折叠时调用）
   */
  updateItemHeight(index: number, height: number) {
    if (index < 0 || index >= this.state.totalCount) return

    const oldHeight = this.heightCache.get(index) || this.config.defaultItemHeight
    const heightDelta = height - oldHeight

    // 更新高度缓存
    this.heightCache.set(index, height)

    // 如果高度变化，需要更新后续所有项的位置缓存
    if (heightDelta !== 0) {
      this.rebuildPositionCache(index + 1) // 从变化项的下一项开始重建

      // 更新总高度
      this.state.totalHeight += heightDelta

      if (import.meta.env.DEV) {
        console.log(`[VirtualScroll] Item ${index} 高度变化: ${oldHeight}px -> ${height}px, 总高度: ${this.state.totalHeight}px`)
      }
    }

    // 更新视窗
    this.updateViewport()
  }

  /**
   * 重建位置缓存（从指定索引开始）
   */
  private rebuildPositionCache(fromIndex: number = 0) {
    let currentPosition = 0

    // 计算重建点的起始位置
    if (fromIndex > 0) {
      const prevPosition = this.positionCache.get(fromIndex - 1)
      if (prevPosition !== undefined) {
        currentPosition = prevPosition + (this.heightCache.get(fromIndex - 1) || this.config.defaultItemHeight)
      }
    }

    // 重建从 fromIndex 开始的位置缓存
    for (let i = fromIndex; i < this.state.totalCount; i++) {
      this.positionCache.set(i, currentPosition)
      currentPosition += this.heightCache.get(i) || this.config.defaultItemHeight
    }

    // 更新总高度
    this.state.totalHeight = currentPosition
  }

  /**
   * 处理滚动事件（带 RAF 防抖优化）
   */
  handleScroll(scrollTop: number) {
    if (this.isDestroyed) return

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
   * 更新视窗范围（基于动态高度）
   */
  private updateViewport() {
    const { viewportHeight, bufferSize } = this.config
    const { scrollTop, totalCount } = this.state

    // 如果没有数据，重置到初始状态
    if (totalCount === 0) {
      this.state.startIndex = 0
      this.state.endIndex = 0
      this.state.renderStartIndex = 0
      this.state.renderEndIndex = 0
      this.state.offsetY = 0
      return
    }

    // 使用二分查找找到第一个位置 >= scrollTop 的 item
    let startIndex = this.findItemIndexByPosition(scrollTop)
    if (startIndex === -1) startIndex = totalCount - 1

    // 找到最后一个位置 <= scrollTop + viewportHeight 的 item
    let endIndex = this.findLastVisibleItemIndex(scrollTop + viewportHeight)
    if (endIndex === -1) endIndex = totalCount - 1

    // 确保 startIndex 和 endIndex 有效
    startIndex = Math.max(0, startIndex)
    endIndex = Math.min(totalCount - 1, endIndex)
    endIndex = Math.max(startIndex, endIndex)

    // 计算包含缓冲区的渲染范围（转换为像素范围后再转回索引）
    let renderStartIndex = this.findItemIndexByPosition(scrollTop - bufferSize)
    if (renderStartIndex === -1) renderStartIndex = 0

    let renderEndIndex = this.findLastVisibleItemIndex(scrollTop + viewportHeight + bufferSize)
    if (renderEndIndex === -1) renderEndIndex = totalCount - 1

    // 确保渲染范围有效
    renderStartIndex = Math.max(0, renderStartIndex)
    renderEndIndex = Math.min(totalCount - 1, renderEndIndex)
    renderEndIndex = Math.max(renderStartIndex, renderEndIndex)

    // 计算偏移量（renderStartIndex 的起始位置）
    const offsetY = this.positionCache.get(renderStartIndex) || 0

    this.state.startIndex = startIndex
    this.state.endIndex = endIndex
    this.state.renderStartIndex = renderStartIndex
    this.state.renderEndIndex = renderEndIndex
    this.state.offsetY = offsetY

    if (import.meta.env.DEV) {
      console.log('[VirtualScroll] 视窗更新:', {
        总数据量: totalCount,
        滚动位置: `${scrollTop}px`,
        可见区域: `${startIndex} - ${endIndex} (${endIndex - startIndex + 1} 行)`,
        渲染区域: `${renderStartIndex} - ${renderEndIndex} (${renderEndIndex - renderStartIndex + 1} 行)`,
        偏移量: `${offsetY}px`,
        总高度: `${this.state.totalHeight}px`
      })
    }
  }

  /**
   * 根据滚动位置查找对应的 item 索引（二分查找）
   * 返回第一个 position >= targetPosition 的 item 索引
   */
  private findItemIndexByPosition(targetPosition: number): number {
    if (this.state.totalCount === 0) return -1

    let left = 0
    let right = this.state.totalCount - 1
    let result = this.state.totalCount - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const position = this.positionCache.get(mid) || 0

      if (position >= targetPosition) {
        result = mid
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    return result
  }

  /**
   * 查找最后一个可见的 item 索引
   * 返回最后一个 position < endPosition 的 item 索引
   */
  private findLastVisibleItemIndex(endPosition: number): number {
    if (this.state.totalCount === 0) return -1

    let left = 0
    let right = this.state.totalCount - 1
    let result = 0

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const position = this.positionCache.get(mid) || 0

      if (position < endPosition) {
        result = mid
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return result
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

    // 获取目标项的位置
    const targetPosition = this.positionCache.get(index) ?? index * this.config.defaultItemHeight
    const itemHeight = this.heightCache.get(index) ?? this.config.defaultItemHeight

    let scrollTop: number

    switch (align) {
      case 'start':
        scrollTop = targetPosition
        break
      case 'center':
        scrollTop = targetPosition - (this.config.viewportHeight / 2) + (itemHeight / 2)
        break
      case 'end':
        scrollTop = targetPosition - this.config.viewportHeight + itemHeight
        break
    }

    // 边界检查
    scrollTop = Math.max(0, Math.min(scrollTop, this.state.totalHeight - this.config.viewportHeight))

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

    if (import.meta.env.DEV) {
      console.log('[VirtualScroll] 已销毁')
    }
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
    defaultItemHeight: 40,  // 每项默认 40px
    viewportHeight: 800,    // 默认视窗高度 800px (相当于 20 行)
    bufferSize: 400         // 前后各保留 400px 缓冲区
  }
}
