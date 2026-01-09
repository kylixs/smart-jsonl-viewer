<template>
  <div class="virtual-scroll-container">
    <!-- 控制面板 -->
    <div class="controls">
      <button @click="toggleTailMode">
        {{ tailMode ? '🔴 停止 Tail -f' : '▶️ 启动 Tail -f' }}
      </button>
      <button @click="scrollToTop">⬆️ 回到顶部</button>
      <button @click="scrollToBottom">⬇️ 滚动到底部</button>
      <span class="info">
        总行数: {{ totalLines }} |
        渲染: {{ renderRange.start }} - {{ renderRange.end }} |
        可见: {{ visibleRange.start }} - {{ visibleRange.end }}
      </span>
    </div>

    <!-- 虚拟滚动区域 -->
    <div
      ref="scrollContainer"
      class="scroll-container"
      @scroll="handleScroll"
    >
      <!-- 虚拟撑开容器（用于滚动条） -->
      <div class="virtual-spacer" :style="spacerStyle"></div>

      <!-- 实际渲染的内容（带偏移定位） -->
      <div class="content-wrapper" :style="contentStyle">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="virtual-item"
          :class="{ highlighted: item.highlighted }"
        >
          <span class="line-number">{{ item.lineNumber }}</span>
          <span class="line-content">{{ item.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { VirtualScrollManager, createDefaultConfig, calculateViewportHeight } from '../utils/virtualScroll'

interface Props {
  // 所有数据（只传索引范围，避免传递大数据）
  items: Array<{ id: string; lineNumber: number; content: string; highlighted?: boolean }>
  // 每行高度
  itemHeight?: number
  // Tail -f 模式下的最大行数
  maxTailLines?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 40,
  maxTailLines: 10000
})

const emit = defineEmits<{
  // 请求加载数据范围
  'load-range': [start: number, end: number]
  // Tail 模式溢出，请求移除旧数据
  'remove-old-data': [count: number]
}>()

// 虚拟滚动管理器
const scrollManager = ref<VirtualScrollManager | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

// 状态
const tailMode = ref(false)
const renderRange = ref({ start: 0, end: 0 })
const visibleRange = ref({ start: 0, end: 0 })

// 总行数
const totalLines = computed(() => props.items.length)

// 当前应该渲染的数据
const visibleItems = computed(() => {
  const { start, end } = renderRange.value
  return props.items.slice(start, end)
})

// 虚拟撑开容器样式
const spacerStyle = computed(() => {
  return scrollManager.value?.getContainerStyle() || { height: '0px' }
})

// 内容定位样式
const contentStyle = computed(() => {
  return scrollManager.value?.getContentStyle() || { transform: 'translateY(0px)' }
})

// 初始化
onMounted(() => {
  if (!scrollContainer.value) return

  // 创建配置
  const config = createDefaultConfig()
  config.itemHeight = props.itemHeight
  config.maxTailLines = props.maxTailLines

  // 计算视窗高度（根据容器实际高度）
  const containerHeight = scrollContainer.value.clientHeight
  config.viewportHeight = calculateViewportHeight(containerHeight, config.itemHeight)

  // 创建管理器
  const manager = new VirtualScrollManager(config)
  manager.init(scrollContainer.value, totalLines.value)

  // 设置溢出回调
  manager.onTailOverflow = (count) => {
    emit('remove-old-data', count)
  }

  scrollManager.value = manager

  // 初始更新
  updateRenderRange()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  scrollManager.value?.destroy()
  window.removeEventListener('resize', handleResize)
})

// 监听数据变化
watch(() => props.items.length, (newLength) => {
  scrollManager.value?.setTotalCount(newLength)
  updateRenderRange()
})

// 处理滚动
function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  scrollManager.value?.handleScroll(target.scrollTop)
  updateRenderRange()
}

// 更新渲染范围
function updateRenderRange() {
  if (!scrollManager.value) return

  const range = scrollManager.value.getRenderRange()
  const state = scrollManager.value.getState()

  renderRange.value = range
  visibleRange.value = {
    start: state.startIndex,
    end: state.endIndex
  }

  // 通知外部加载数据
  emit('load-range', range.start, range.end)
}

// 窗口大小变化
function handleResize() {
  if (!scrollContainer.value || !scrollManager.value) return

  const containerHeight = scrollContainer.value.clientHeight
  const viewportHeight = calculateViewportHeight(containerHeight, props.itemHeight)

  scrollManager.value.setViewportHeight(viewportHeight)
  updateRenderRange()
}

// 切换 Tail -f 模式
function toggleTailMode() {
  if (!scrollManager.value) return

  tailMode.value = !tailMode.value

  if (tailMode.value) {
    scrollManager.value.enableTailMode()
  } else {
    scrollManager.value.disableTailMode()
  }
}

// 滚动到顶部
function scrollToTop() {
  scrollManager.value?.scrollToIndex(0, 'smooth')
}

// 滚动到底部
function scrollToBottom() {
  scrollManager.value?.scrollToBottom('smooth')
}

// 暴露给父组件的方法
defineExpose({
  scrollToIndex: (index: number) => scrollManager.value?.scrollToIndex(index),
  scrollToBottom: () => scrollManager.value?.scrollToBottom(),
  enableTailMode: () => {
    tailMode.value = true
    scrollManager.value?.enableTailMode()
  },
  disableTailMode: () => {
    tailMode.value = false
    scrollManager.value?.disableTailMode()
  },
  appendData: (items: any[]) => scrollManager.value?.appendData(items)
})
</script>

<style scoped>
.virtual-scroll-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.controls {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
  flex-shrink: 0;
}

.controls button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.controls button:hover {
  background: #e8e8e8;
}

.controls .info {
  margin-left: auto;
  font-size: 13px;
  color: #666;
  line-height: 28px;
}

.scroll-container {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.virtual-spacer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

.content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.virtual-item {
  display: flex;
  height: 40px;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background 0.2s;
}

.virtual-item:hover {
  background: #f9f9f9;
}

.virtual-item.highlighted {
  background: #fff3cd;
}

.line-number {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 12px;
  color: #999;
  min-width: 60px;
  text-align: right;
  margin-right: 16px;
  flex-shrink: 0;
}

.line-content {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 暗色主题 */
:root.dark .virtual-scroll-container {
  background: #1e1e1e;
}

:root.dark .controls {
  background: #252525;
  border-bottom-color: #333;
}

:root.dark .controls button {
  background: #2a2a2a;
  border-color: #444;
  color: #ddd;
}

:root.dark .controls button:hover {
  background: #333;
}

:root.dark .controls .info {
  color: #999;
}

:root.dark .virtual-item {
  border-bottom-color: #333;
}

:root.dark .virtual-item:hover {
  background: #2a2a2a;
}

:root.dark .line-content {
  color: #ddd;
}
</style>
