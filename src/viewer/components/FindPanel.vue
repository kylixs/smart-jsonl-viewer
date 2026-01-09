<template>
  <div class="find-panel" v-show="visible">
    <div class="find-input-group">
      <!-- 查找输入框 -->
      <input
        ref="findInputRef"
        v-model="findKeyword"
        type="text"
        placeholder="查找..."
        @keydown.enter="handleFindNext"
        @keydown.shift.enter.prevent="handleFindPrevious"
        @keydown.escape="handleClose"
      />

      <!-- 查找选项 -->
      <div class="find-options">
        <button
          :class="{ active: caseSensitive }"
          @click="caseSensitive = !caseSensitive"
          title="区分大小写 (Alt+C)"
        >
          Aa
        </button>
        <button
          :class="{ active: wholeWord }"
          @click="wholeWord = !wholeWord"
          title="全字匹配 (Alt+W)"
        >
          [ab]
        </button>
        <button
          :class="{ active: useRegex }"
          @click="useRegex = !useRegex"
          title="正则表达式 (Alt+R)"
        >
          .*
        </button>
      </div>

      <!-- 查找结果统计 -->
      <div class="find-status">
        <span v-if="status.total > 0">
          {{ status.current }} / {{ status.total }}
        </span>
        <span v-else-if="findKeyword && status.total === 0">
          无结果
        </span>
      </div>

      <!-- 导航按钮 -->
      <div class="find-navigation">
        <button
          @click="handleFindPrevious"
          :disabled="status.total === 0"
          title="上一个 (Shift+Enter)"
        >
          ↑
        </button>
        <button
          @click="handleFindNext"
          :disabled="status.total === 0"
          title="下一个 (Enter)"
        >
          ↓
        </button>
      </div>

      <!-- 关闭按钮 -->
      <button class="close-btn" @click="handleClose" title="关闭 (Escape)">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { FindOptions } from '../utils/findEngine'

// Props
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'find': [keyword: string, options: FindOptions]
  'find-next': []
  'find-previous': []
  'close': []
}>()

// Refs
const findInputRef = ref<HTMLInputElement | null>(null)
const findKeyword = ref('')
const caseSensitive = ref(false)
const wholeWord = ref(false)
const useRegex = ref(false)

// 查找状态（由父组件更新）
const status = ref({
  total: 0,
  current: 0
})

// 防抖计时器
let debounceTimer: number | undefined

// 监听输入变化，实时查找（带防抖）
watch([findKeyword, caseSensitive, wholeWord, useRegex], () => {
  // 清除之前的计时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // 300ms 防抖
  debounceTimer = window.setTimeout(() => {
    performFind()
  }, 300)
})

// 面板打开时聚焦输入框
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      findInputRef.value?.focus()
      findInputRef.value?.select()
    })
  } else {
    // 面板关闭时清理状态
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = undefined
    }
  }
})

// 执行查找
function performFind() {
  if (!findKeyword.value.trim()) {
    status.value = { total: 0, current: 0 }
    return
  }

  emit('find', findKeyword.value, {
    caseSensitive: caseSensitive.value,
    wholeWord: wholeWord.value,
    regex: useRegex.value
  })
}

// 查找下一个
function handleFindNext() {
  if (status.value.total > 0) {
    emit('find-next')
  }
}

// 查找上一个
function handleFindPrevious() {
  if (status.value.total > 0) {
    emit('find-previous')
  }
}

// 关闭面板
function handleClose() {
  emit('close')
}

// 暴露给父组件的方法
defineExpose({
  /**
   * 更新查找状态
   */
  updateStatus(newStatus: { total: number; current: number }) {
    status.value = newStatus
  },

  /**
   * 获取查找关键字
   */
  getKeyword(): string {
    return findKeyword.value
  },

  /**
   * 设置查找关键字
   */
  setKeyword(keyword: string) {
    findKeyword.value = keyword
  },

  /**
   * 清空输入
   */
  clear() {
    findKeyword.value = ''
    status.value = { total: 0, current: 0 }
  }
})
</script>

<style scoped>
.find-panel {
  position: fixed;
  top: 16px;
  right: 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 1000;
  min-width: 420px;
}

.find-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.find-input-group input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.find-input-group input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.find-options {
  display: flex;
  gap: 4px;
}

.find-options button {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-family: monospace;
  transition: all 0.2s;
  min-width: 32px;
}

.find-options button:hover {
  background: #f0f0f0;
}

.find-options button.active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.find-status {
  font-size: 12px;
  color: #666;
  min-width: 60px;
  text-align: center;
  white-space: nowrap;
}

.find-navigation {
  display: flex;
  gap: 2px;
}

.find-navigation button {
  padding: 4px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.find-navigation button:hover:not(:disabled) {
  background: #f0f0f0;
}

.find-navigation button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-btn {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

/* 暗色主题 */
:root.dark .find-panel {
  background: #2a2a2a;
  border-color: #444;
}

:root.dark .find-input-group input {
  background: #1e1e1e;
  border-color: #555;
  color: #ddd;
}

:root.dark .find-input-group input:focus {
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

:root.dark .find-options button,
:root.dark .find-navigation button,
:root.dark .close-btn {
  background: #333;
  border-color: #555;
  color: #ddd;
}

:root.dark .find-options button:hover,
:root.dark .find-navigation button:hover:not(:disabled),
:root.dark .close-btn:hover {
  background: #444;
}

:root.dark .find-options button.active {
  background: #4a9eff;
  color: #fff;
  border-color: #4a9eff;
}

:root.dark .find-status {
  color: #999;
}
</style>
