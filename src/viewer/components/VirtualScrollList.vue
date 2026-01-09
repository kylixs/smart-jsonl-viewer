<template>
  <div
    ref="scrollContainerRef"
    class="virtual-scroll-container"
    @scroll="handleScroll"
  >
    <!-- 虚拟撑开容器（用于撑开滚动条） -->
    <div class="virtual-spacer" :style="spacerStyle"></div>

    <!-- 实际渲染的内容区域 -->
    <div class="content-wrapper" :style="contentStyle">
      <slot
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
      >
        <!-- 默认插槽，父组件可以自定义渲染 -->
        <div class="virtual-item" :data-index="item.index">
          {{ item }}
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string | number }">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  VirtualScrollManager,
  type VirtualScrollConfig,
  type ScrollToOptions
} from '../utils/virtualScroll'

// Props
interface Props {
  // 数据源（过滤后的数据）
  items: T[]
  // 每行高度（像素）
  itemHeight?: number
  // 视窗行数
  viewportRows?: number
  // 缓冲区大小
  bufferSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 40,
  viewportRows: 200,
  bufferSize: 100
})

// Emits
const emit = defineEmits<{
  'viewport-change': [{ startIndex: number; endIndex: number }]
}>()

// Refs
const scrollContainerRef = ref<HTMLElement | null>(null)
const scrollManager = ref<VirtualScrollManager | null>(null)
const renderRange = ref({ start: 0, end: 0 })

// Computed - 可见项
const visibleItems = computed(() => {
  const { start, end } = renderRange.value
  return props.items.slice(start, end).map((item, idx) => ({
    ...item,
    index: start + idx
  }))
})

// Computed - 虚拟容器样式
const spacerStyle = computed(() => {
  if (!scrollManager.value) {
    return { height: '0px' }
  }
  return scrollManager.value.getContainerStyle()
})

// Computed - 内容区域样式
const contentStyle = computed(() => {
  if (!scrollManager.value) {
    return { transform: 'translateY(0px)', willChange: 'transform' }
  }
  return scrollManager.value.getContentStyle()
})

// 初始化虚拟滚动管理器
function initScrollManager() {
  if (!scrollContainerRef.value) {
    console.error('[VirtualScrollList] 容器未挂载')
    return
  }

  const config: VirtualScrollConfig = {
    itemHeight: props.itemHeight,
    viewportRows: props.viewportRows,
    bufferSize: props.bufferSize
  }

  scrollManager.value = new VirtualScrollManager(config)
  scrollManager.value.init(scrollContainerRef.value, props.items.length)

  // 初始化渲染范围
  updateRenderRange()

  if (import.meta.env.DEV) {
    console.log('[VirtualScrollList] 初始化完成:', {
      总数据量: props.items.length,
      视窗行数: props.viewportRows,
      缓冲区大小: props.bufferSize
    })
  }
}

// 更新渲染范围
function updateRenderRange() {
  if (!scrollManager.value) return

  const range = scrollManager.value.getRenderRange()
  renderRange.value = range

  // 发出视窗变化事件
  const viewport = scrollManager.value.getViewport()
  emit('viewport-change', viewport)
}

// 处理滚动事件
function handleScroll(event: Event) {
  if (!scrollManager.value) return

  const target = event.target as HTMLElement
  scrollManager.value.handleScroll(target.scrollTop)
  updateRenderRange()
}

// 处理窗口大小变化
function handleResize() {
  if (!scrollContainerRef.value || !scrollManager.value) return

  const containerHeight = scrollContainerRef.value.clientHeight
  const newViewportRows = Math.ceil(containerHeight / props.itemHeight)

  scrollManager.value.setViewportRows(newViewportRows)
  updateRenderRange()

  if (import.meta.env.DEV) {
    console.log('[VirtualScrollList] 窗口大小变化:', {
      容器高度: containerHeight,
      新视窗行数: newViewportRows
    })
  }
}

// 监听数据变化
watch(() => props.items.length, (newLength) => {
  if (!scrollManager.value) return

  scrollManager.value.setTotalCount(newLength)
  updateRenderRange()

  if (import.meta.env.DEV) {
    console.log('[VirtualScrollList] 数据量变化:', {
      新数据量: newLength
    })
  }
})

// 监听配置变化
watch(
  () => [props.itemHeight, props.viewportRows, props.bufferSize] as const,
  ([newItemHeight, newViewportRows, newBufferSize]) => {
    if (!scrollManager.value) return

    // 重新创建管理器（配置变化较少，直接重建更简单）
    scrollManager.value.destroy()
    initScrollManager()

    if (import.meta.env.DEV) {
      console.log('[VirtualScrollList] 配置变化:', {
        行高: newItemHeight,
        视窗行数: newViewportRows,
        缓冲区: newBufferSize
      })
    }
  }
)

// 生命周期
onMounted(() => {
  initScrollManager()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

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
  scrollToIndex(index: number, options?: ScrollToOptions) {
    scrollManager.value?.scrollToIndex(index, options)
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
   * 获取当前视窗范围
   */
  getViewport() {
    return scrollManager.value?.getViewport() ?? { startIndex: 0, endIndex: 0 }
  },

  /**
   * 获取总数据量
   */
  getTotalCount(): number {
    return scrollManager.value?.getTotalCount() ?? 0
  }
})
</script>

<style scoped>
.virtual-scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  /* 平滑滚动 */
  scroll-behavior: smooth;
}

/* 虚拟撑开容器 */
.virtual-spacer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  /* 用于撑开滚动条高度 */
}

/* 内容区域 */
.content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  /* GPU 加速 */
  will-change: transform;
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
  0% {
    background-color: transparent;
  }
  50% {
    background-color: #ffeb3b;
  }
  100% {
    background-color: transparent;
  }
}
</style>
