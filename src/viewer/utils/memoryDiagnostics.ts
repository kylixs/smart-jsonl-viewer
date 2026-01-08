/**
 * 内存诊断工具
 * 用于开发环境分析内存使用情况
 */

// 扩展 Performance 类型以支持 memory API（非标准）
interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

declare global {
  interface Performance {
    memory?: PerformanceMemory
  }
}

export interface MemorySnapshot {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  componentCount?: number
  dataSize?: {
    allLines: number
    filteredLines: number
    visibleCount: number
  }
}

export class MemoryDiagnostics {
  private snapshots: MemorySnapshot[] = []
  private intervalId?: number

  /**
   * 获取当前内存使用情况
   */
  getCurrentMemory(): MemorySnapshot | null {
    if (!performance.memory) {
      console.warn('[MemoryDiagnostics] performance.memory not available')
      return null
    }

    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory

    return {
      timestamp: Date.now(),
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit
    }
  }

  /**
   * 记录快照
   */
  takeSnapshot(label?: string): MemorySnapshot | null {
    const snapshot = this.getCurrentMemory()
    if (!snapshot) return null

    this.snapshots.push(snapshot)

    const usedMB = (snapshot.usedJSHeapSize / 1024 / 1024).toFixed(2)
    const totalMB = (snapshot.totalJSHeapSize / 1024 / 1024).toFixed(2)
    const limitMB = (snapshot.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
    const usage = ((snapshot.usedJSHeapSize / snapshot.totalJSHeapSize) * 100).toFixed(1)

    console.log(`[Memory${label ? ` - ${label}` : ''}]`, {
      used: `${usedMB} MB`,
      total: `${totalMB} MB`,
      limit: `${limitMB} MB`,
      usage: `${usage}%`
    })

    return snapshot
  }

  /**
   * 比较两个快照
   */
  compareSnapshots(before: MemorySnapshot, after: MemorySnapshot) {
    const diffBytes = after.usedJSHeapSize - before.usedJSHeapSize
    const diffMB = (diffBytes / 1024 / 1024).toFixed(2)
    const diffPercent = ((diffBytes / before.usedJSHeapSize) * 100).toFixed(1)

    console.log('[Memory] Comparison:', {
      before: `${(before.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      after: `${(after.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      diff: `${diffMB} MB (${diffPercent}%)`,
      trend: diffBytes > 0 ? '⬆️ 增长' : '⬇️ 减少'
    })

    return {
      diffBytes,
      diffMB: parseFloat(diffMB),
      diffPercent: parseFloat(diffPercent)
    }
  }

  /**
   * 开始监控（定时记录）
   */
  startMonitoring(intervalMs: number = 10000) {
    if (this.intervalId) {
      console.warn('[MemoryDiagnostics] Already monitoring')
      return
    }

    console.log(`[MemoryDiagnostics] Starting monitoring (interval: ${intervalMs}ms)`)

    this.intervalId = window.setInterval(() => {
      const snapshot = this.takeSnapshot('Monitor')

      if (snapshot && snapshot.usedJSHeapSize > snapshot.totalJSHeapSize * 0.9) {
        console.warn('[Memory] ⚠️ WARNING: Memory usage is very high!')
        console.warn('[Memory] Consider:')
        console.warn('  1. Close decoder popup')
        console.warn('  2. Clear search/filters')
        console.warn('  3. Reload the page')
      }
    }, intervalMs)
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
      console.log('[MemoryDiagnostics] Monitoring stopped')
    }
  }

  /**
   * 获取所有快照
   */
  getSnapshots() {
    return this.snapshots
  }

  /**
   * 清除快照历史
   */
  clearSnapshots() {
    this.snapshots = []
  }

  /**
   * 检查 DOM 节点数量
   */
  getDOMStats() {
    const stats = {
      totalElements: document.querySelectorAll('*').length,
      jsonLineItems: document.querySelectorAll('.json-line-item').length,
      treeNodes: document.querySelectorAll('.tree-node').length,
      decoderModals: document.querySelectorAll('.decoder-modal').length
    }

    console.log('[Memory] DOM Stats:', stats)
    return stats
  }

  /**
   * 估算数据大小
   */
  estimateDataSize(data: any): number {
    const jsonString = JSON.stringify(data)
    return new Blob([jsonString]).size
  }

  /**
   * 分析 Store 数据大小
   */
  analyzeStoreSize(store: any) {
    const sizes = {
      allLines: this.estimateDataSize(store.allLines),
      filteredLines: this.estimateDataSize(store.filteredLines),
      searchKeyword: store.searchKeyword.length,
      visibleCount: store.visibleCount
    }

    console.log('[Memory] Store Data Sizes:', {
      allLines: `${(sizes.allLines / 1024 / 1024).toFixed(2)} MB (${store.allLines.length} items)`,
      filteredLines: `${(sizes.filteredLines / 1024 / 1024).toFixed(2)} MB (${store.filteredLines.length} items)`,
      visibleCount: store.visibleCount,
      ratio: `${((sizes.filteredLines / sizes.allLines) * 100).toFixed(1)}%`
    })

    return sizes
  }

  /**
   * 强制建议垃圾回收（仅在支持时）
   */
  suggestGC() {
    if ('gc' in window) {
      console.log('[Memory] Triggering GC...')
      ;(window as any).gc()
      setTimeout(() => {
        this.takeSnapshot('After GC')
      }, 1000)
    } else {
      console.warn('[Memory] GC not available. Start Chrome with --js-flags="--expose-gc"')
    }
  }

  /**
   * 生成内存报告
   */
  generateReport() {
    const current = this.getCurrentMemory()
    if (!current) {
      console.error('[Memory] Cannot generate report: performance.memory not available')
      return
    }

    const usedMB = (current.usedJSHeapSize / 1024 / 1024).toFixed(2)
    const totalMB = (current.totalJSHeapSize / 1024 / 1024).toFixed(2)
    const limitMB = (current.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
    const usage = ((current.usedJSHeapSize / current.totalJSHeapSize) * 100).toFixed(1)

    const dom = this.getDOMStats()

    const report = {
      timestamp: new Date().toISOString(),
      memory: {
        used: `${usedMB} MB`,
        total: `${totalMB} MB`,
        limit: `${limitMB} MB`,
        usage: `${usage}%`,
        status: current.usedJSHeapSize > current.totalJSHeapSize * 0.9 ? '⚠️ HIGH' : '✅ OK'
      },
      dom: {
        totalElements: dom.totalElements,
        jsonLineItems: dom.jsonLineItems,
        treeNodes: dom.treeNodes,
        decoderModals: dom.decoderModals
      },
      snapshots: this.snapshots.length
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('           MEMORY REPORT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Memory:', report.memory)
    console.log('DOM:', report.dom)
    console.log('Snapshots:', report.snapshots)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return report
  }
}

// 创建全局实例
export const memoryDiagnostics = new MemoryDiagnostics()

// 在开发环境下暴露到 window
if (typeof window !== 'undefined') {
  ;(window as any).__memoryDiagnostics = memoryDiagnostics
}
