/**
 * 键盘导航管理器
 * 负责处理键盘快捷键，支持滚动导航、查找快捷键等
 */

import type { VirtualScrollManager } from './virtualScroll'
import type { FindEngine } from './findEngine'

export interface KeyboardShortcuts {
  [key: string]: () => void
}

export interface KeyboardNavigatorConfig {
  // 是否启用键盘导航
  enabled: boolean
  // 自定义快捷键映射
  customShortcuts?: KeyboardShortcuts
}

/**
 * 键盘导航器类
 */
export class KeyboardNavigator {
  private scrollManager: VirtualScrollManager | null = null
  private findEngine: FindEngine | null = null
  private shortcuts: KeyboardShortcuts = {}
  private enabled: boolean = true
  private boundHandler: ((event: KeyboardEvent) => void) | null = null

  // 回调函数（由外部提供）
  private onOpenFindPanel: (() => void) | null = null
  private onCloseFindPanel: (() => void) | null = null
  private onToggleExpand: (() => void) | null = null
  private onGotoLine: (() => void) | null = null

  constructor(config?: KeyboardNavigatorConfig) {
    this.enabled = config?.enabled ?? true
    this.initDefaultShortcuts()

    // 合并自定义快捷键
    if (config?.customShortcuts) {
      Object.assign(this.shortcuts, config.customShortcuts)
    }
  }

  /**
   * 设置虚拟滚动管理器
   */
  setScrollManager(manager: VirtualScrollManager): void {
    this.scrollManager = manager
  }

  /**
   * 设置查找引擎
   */
  setFindEngine(engine: FindEngine): void {
    this.findEngine = engine
  }

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks: {
    onOpenFindPanel?: () => void
    onCloseFindPanel?: () => void
    onToggleExpand?: () => void
    onGotoLine?: () => void
  }): void {
    this.onOpenFindPanel = callbacks.onOpenFindPanel || null
    this.onCloseFindPanel = callbacks.onCloseFindPanel || null
    this.onToggleExpand = callbacks.onToggleExpand || null
    this.onGotoLine = callbacks.onGotoLine || null
  }

  /**
   * 初始化默认快捷键
   */
  private initDefaultShortcuts(): void {
    this.shortcuts = {
      // 行级导航
      'ArrowUp': () => this.moveLine(-1),
      'ArrowDown': () => this.moveLine(1),

      // 页级导航
      'PageUp': () => this.movePage(-1),
      'PageDown': () => this.movePage(1),

      // 边界导航
      'Home': () => this.moveToStart(),
      'End': () => this.moveToEnd(),

      // 查找导航
      'F3': () => this.findNext(),
      'Shift+F3': () => this.findPrevious(),
      'Meta+F': () => this.openFindPanel(),  // Mac: Cmd+F
      'Control+F': () => this.openFindPanel(), // Windows/Linux: Ctrl+F
      'Escape': () => this.closeFindPanel(),

      // 展开/折叠（可选）
      'Space': () => this.toggleExpand(),

      // 快捷跳转
      'Meta+G': () => this.gotoLine(),  // Mac: Cmd+G
      'Control+G': () => this.gotoLine() // Windows/Linux: Ctrl+G
    }
  }

  /**
   * 移动行
   */
  private moveLine(delta: number): void {
    if (!this.scrollManager) return

    const viewport = this.scrollManager.getViewport()
    const currentIndex = Math.floor((viewport.startIndex + viewport.endIndex) / 2)
    const newIndex = currentIndex + delta

    const totalCount = this.scrollManager.getTotalCount()
    if (newIndex >= 0 && newIndex < totalCount) {
      this.scrollManager.scrollToIndex(newIndex, {
        align: 'center',
        smooth: true,
        highlight: true
      })
    }
  }

  /**
   * 翻页
   */
  private movePage(direction: number): void {
    if (!this.scrollManager) return

    const viewport = this.scrollManager.getViewport()
    const pageSize = viewport.endIndex - viewport.startIndex
    const totalCount = this.scrollManager.getTotalCount()

    let newStartIndex: number

    if (direction < 0) {
      // Page Up：向上翻页，保留 1 行重叠
      newStartIndex = viewport.startIndex - pageSize
      newStartIndex = Math.max(0, newStartIndex + 1)
    } else {
      // Page Down：向下翻页，保留 1 行重叠
      newStartIndex = viewport.endIndex - 1
      newStartIndex = Math.min(newStartIndex, totalCount - pageSize)
    }

    this.scrollManager.scrollToIndex(newStartIndex, {
      align: 'start',
      smooth: true
    })

    if (import.meta.env.DEV) {
      console.log('[KeyboardNavigator] 翻页:', {
        方向: direction < 0 ? 'Page Up' : 'Page Down',
        旧范围: `${viewport.startIndex} - ${viewport.endIndex}`,
        新起始: newStartIndex
      })
    }
  }

  /**
   * 移动到开始
   */
  private moveToStart(): void {
    if (!this.scrollManager) return

    this.scrollManager.scrollToIndex(0, {
      align: 'start',
      smooth: true
    })
  }

  /**
   * 移动到结束
   */
  private moveToEnd(): void {
    if (!this.scrollManager) return

    const lastIndex = this.scrollManager.getTotalCount() - 1
    this.scrollManager.scrollToIndex(lastIndex, {
      align: 'end',
      smooth: true
    })
  }

  /**
   * 查找下一个
   */
  private findNext(): void {
    if (!this.findEngine) return

    this.findEngine.findNext()
  }

  /**
   * 查找上一个
   */
  private findPrevious(): void {
    if (!this.findEngine) return

    this.findEngine.findPrevious()
  }

  /**
   * 打开查找面板
   */
  private openFindPanel(): void {
    if (this.onOpenFindPanel) {
      this.onOpenFindPanel()
    }
  }

  /**
   * 关闭查找面板
   */
  private closeFindPanel(): void {
    if (this.onCloseFindPanel) {
      this.onCloseFindPanel()
    }
  }

  /**
   * 切换展开/折叠
   */
  private toggleExpand(): void {
    if (this.onToggleExpand) {
      this.onToggleExpand()
    }
  }

  /**
   * 跳转到指定行
   */
  private gotoLine(): void {
    if (this.onGotoLine) {
      this.onGotoLine()
    }
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return

    // 如果焦点在输入框，不处理快捷键（除了 Escape）
    const target = event.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

    if (isInput && event.key !== 'Escape') {
      return
    }

    // 构建快捷键字符串
    const keyParts: string[] = []
    if (event.ctrlKey) keyParts.push('Control')
    if (event.shiftKey) keyParts.push('Shift')
    if (event.altKey) keyParts.push('Alt')
    if (event.metaKey) keyParts.push('Meta')
    keyParts.push(event.key)

    const key = keyParts.join('+')

    // 查找并执行对应的操作
    const handler = this.shortcuts[key]
    if (handler) {
      event.preventDefault()
      handler()

      if (import.meta.env.DEV) {
        console.log('[KeyboardNavigator] 快捷键触发:', key)
      }
    }
  }

  /**
   * 绑定键盘事件
   */
  bind(): void {
    if (this.boundHandler) {
      console.warn('[KeyboardNavigator] 已绑定，跳过')
      return
    }

    this.boundHandler = this.handleKeyDown.bind(this)
    document.addEventListener('keydown', this.boundHandler)

    if (import.meta.env.DEV) {
      console.log('[KeyboardNavigator] 键盘导航已绑定')
    }
  }

  /**
   * 解绑键盘事件
   */
  unbind(): void {
    if (this.boundHandler) {
      document.removeEventListener('keydown', this.boundHandler)
      this.boundHandler = null

      if (import.meta.env.DEV) {
        console.log('[KeyboardNavigator] 键盘导航已解绑')
      }
    }
  }

  /**
   * 启用键盘导航
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用键盘导航
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 添加自定义快捷键
   */
  addShortcut(key: string, handler: () => void): void {
    this.shortcuts[key] = handler
  }

  /**
   * 移除自定义快捷键
   */
  removeShortcut(key: string): void {
    delete this.shortcuts[key]
  }

  /**
   * 获取所有快捷键
   */
  getShortcuts(): KeyboardShortcuts {
    return { ...this.shortcuts }
  }
}

/**
 * 创建键盘导航器实例
 */
export function createKeyboardNavigator(
  config?: KeyboardNavigatorConfig
): KeyboardNavigator {
  return new KeyboardNavigator(config)
}
