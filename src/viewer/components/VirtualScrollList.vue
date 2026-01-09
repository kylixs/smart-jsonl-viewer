<template>
  <div
    ref="scrollContainerRef"
    class="virtual-scroll-container"
  >
    <!-- 实际渲染的内容区域 -->
    <div ref="contentWrapperRef" class="content-wrapper">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="virtual-item-wrapper"
      >
        <slot :item="item" :index="item.index">
          <!-- 默认插槽，父组件可以自定义渲染 -->
          <div class="virtual-item">
            {{ item }}
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string | number }">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  WindowedVirtualScrollManager
} from '../utils/windowedVirtualScroll'

console.log('[VirtualScrollList] script setup - 组件定义执行')

// Props
interface Props {
  // 数据源（过滤后的数据）
  items: T[]
  // 初始窗口大小（项数）
  initialWindowSize?: number
  // 触发加载的阈值（像素）
  loadThreshold?: number
  // 每次加载的批次大小（项数）
  batchSize?: number
  // 最大窗口大小（项数）
  maxWindowSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialWindowSize: 100,
  loadThreshold: 200,              // 降低到200px，更容易触发
  batchSize: 50,
  maxWindowSize: 100               // 限制窗口大小，防止DOM无限累积
})

// Emits
const emit = defineEmits<{
  'window-change': [{ startIndex: number; endIndex: number }]
  'scroll': []
}>()

// Refs
const scrollContainerRef = ref<HTMLElement | null>(null)
const contentWrapperRef = ref<HTMLElement | null>(null)
const scrollManager = ref<WindowedVirtualScrollManager | null>(null)
const renderWindow = ref({ startIndex: 0, endIndex: 0 })

// Computed - 可见项
const visibleItems = computed(() => {
  const { startIndex, endIndex } = renderWindow.value

  if (import.meta.env.DEV) {
    console.log('[VirtualScrollList] 计算可见项:', {
      items总长度: props.items.length,
      renderWindow: { startIndex, endIndex },
      切片数量: endIndex - startIndex
    })
  }

  return props.items.slice(startIndex, endIndex).map((item, idx) => ({
    ...item,
    index: startIndex + idx
  }))
})

// 初始化虚拟滚动管理器
function initScrollManager() {
  if (!scrollContainerRef.value || !contentWrapperRef.value) {
    console.error('[VirtualScrollList] 容器未挂载')
    return
  }

  const config = {
    initialWindowSize: props.initialWindowSize,
    loadThreshold: props.loadThreshold,
    batchSize: props.batchSize,
    maxWindowSize: props.maxWindowSize
  }

  scrollManager.value = new WindowedVirtualScrollManager(config)
  scrollManager.value.init(
    scrollContainerRef.value,
    contentWrapperRef.value,
    props.items.length
  )

  // 设置窗口变化回调
  scrollManager.value.setWindowChangeCallback(() => {
    updateRenderWindow()
  })

  // 初始化渲染窗口
  updateRenderWindow()

  // 监听滚动事件，通知父组件
  if (scrollContainerRef.value) {
    scrollContainerRef.value.addEventListener('scroll', () => {
      emit('scroll')
    })
  }

  if (import.meta.env.DEV) {
    console.log('[VirtualScrollList] 初始化完成:', {
      总数据量: props.items.length,
      初始窗口大小: props.initialWindowSize,
      加载阈值: props.loadThreshold,
      批次大小: props.batchSize
    })
  }
}

// 更新渲染窗口
function updateRenderWindow() {
  if (!scrollManager.value) return

  const window = scrollManager.value.getRenderWindow()

  if (import.meta.env.DEV) {
    console.log('[VirtualScrollList] updateRenderWindow - 获取到 window:', window)
  }

  renderWindow.value = window

  // 发出窗口变化事件
  emit('window-change', window)

  if (import.meta.env.DEV) {
    console.log('[VirtualScrollList] updateRenderWindow - renderWindow 已更新为:', renderWindow.value)
  }
}

// 监听 items 变化
watch(
  () => props.items.length,
  (newLength) => {
    if (!scrollManager.value) return

    if (import.meta.env.DEV) {
      console.log('[VirtualScrollList] items 数量变化:', newLength)
    }

    scrollManager.value.updateTotalCount(newLength)
    updateRenderWindow()
  }
)

// 监听配置变化
watch(
  () => [props.initialWindowSize, props.loadThreshold, props.batchSize, props.maxWindowSize] as const,
  () => {
    if (!scrollManager.value) return

    // 配置变化时重新初始化
    scrollManager.value.destroy()
    initScrollManager()

    if (import.meta.env.DEV) {
      console.log('[VirtualScrollList] 配置变化，重新初始化')
    }
  }
)

// 生命周期
onMounted(() => {
  console.log('[VirtualScrollList] onMounted - 组件已挂载')
  console.log('[VirtualScrollList] 此时 items.length:', props.items.length)

  initScrollManager()
})

onUnmounted(() => {
  if (scrollManager.value) {
    scrollManager.value.destroy()
    scrollManager.value = null
  }
})

// 暴露公共方法给父组件
defineExpose({
  /**
   * 滚动到指定索引
   */
  scrollToIndex(index: number, smooth = false) {
    scrollManager.value?.scrollToIndex(index, smooth)
  },

  /**
   * 滚动到顶部
   */
  scrollToTop(smooth = false) {
    scrollManager.value?.scrollToTop(smooth)
  },

  /**
   * 滚动到底部
   */
  scrollToBottom(smooth = false) {
    scrollManager.value?.scrollToBottom(smooth)
  },

  /**
   * 判断是否在底部
   */
  isAtBottom(): boolean {
    return scrollManager.value?.isAtBottom() ?? false
  },

  /**
   * 获取滚动引擎（供外部高级使用）
   */
  getScrollEngine() {
    return scrollManager.value
  },

  /**
   * 获取当前渲染窗口
   */
  getRenderWindow() {
    return scrollManager.value?.getRenderWindow() ?? { startIndex: 0, endIndex: 0 }
  },

  /**
   * 获取总数据量
   */
  getTotalCount(): number {
    return props.items.length
  }
})
</script>

<style scoped>
.virtual-scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: scroll;  /* 改为 scroll 强制显示滚动条 */
  overflow-x: hidden;
  /* 平滑滚动 */
  scroll-behavior: smooth;
}

/* 内容区域 */
.content-wrapper {
  width: 100%;
  /* 添加底部 padding，确保展开的最后一项能完全显示 */
  /* 设置为 800px，足以容纳最高的展开项（约 760px） */
  padding-bottom: 100px;
}

/* 虚拟项包装器 */
.virtual-item-wrapper {
  width: 100%;
}

/* 默认项样式 */
.virtual-item {
  min-height: 40px;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

/* 高亮闪烁动画（用于 scrollToIndex highlight: true） */
:deep(.highlight-flash) {
  animation: highlight-pulse 1s ease-in-out;
}

@keyframes highlight-pulse {
  0%,
  100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(255, 193, 7, 0.3);
  }
}
</style>
