<template>
  <div class="json-line-item" :class="{ expanded: line.isExpanded }">
    <div class="line-row">
      <!-- 行号（最左侧） -->
      <span class="line-number">{{ line.lineNumber }}</span>
      <!-- 展开箭头（仅在折叠时显示） -->
      <span v-if="!line.isExpanded" class="expand-icon" @click="toggleExpand">▶</span>
      <!-- JSON 内容（展开前后都在同一行） -->
      <div class="line-content" @click="toggleExpand">
        <JsonTree
          :data="line.parsedData"
          :depth="0"
          :max-depth="line.isExpanded ? store.expandDepth : 0"
          :inline="!line.isExpanded"
          :preview-max-length="200"
        />
      </div>
      <!-- 匹配路径（如果有） -->
      <div v-if="line.isExpanded && line.matchedPath" class="matched-path">
        <span class="path-icon">📍</span>
        <span class="path-text">{{ line.matchedPath }}</span>
      </div>
      <!-- 复制按钮 -->
      <button
        class="copy-line-btn"
        @click.stop="copyLine"
        :title="copySuccess ? '已复制!' : copyError || '复制整行内容'"
        :class="{ error: copyError }"
      >
        {{ copySuccess ? '✓' : copyError ? '✗' : '📋' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { JsonLineNode } from '../utils/types'
import JsonTree from './JsonTree.vue'
import { useJsonlStore } from '../stores/jsonlStore'
import { decodeObject } from '../utils/decoder'
import { stripAnsi } from '../utils/ansi'
import { copyToClipboard } from '../utils/clipboard'

interface Props {
  line: JsonLineNode
}

const props = defineProps<Props>()
const store = useJsonlStore()
const copySuccess = ref(false)
const copyError = ref('')

// 预览内容（仅在折叠时显示）
// const linePreview = computed(() => {
//   const raw = props.line.rawContent
//   const maxLength = 200
//
//   if (raw.length <= maxLength) {
//     return raw
//   }
//
//   return raw.substring(0, maxLength) + '...'
// })

function toggleExpand() {
  store.toggleLineExpand(props.line.id)
  // 用户展开/折叠表示正在查看结果，触发保存搜索历史
  store.confirmAndSaveSearch()
}

async function copyLine() {
  try {
    // 解码整行数据
    const decoded = decodeObject(props.line.parsedData)
    let textToCopy = JSON.stringify(decoded, null, 2)

    // 移除 ANSI 代码
    textToCopy = stripAnsi(textToCopy)

    // 使用增强的复制函数
    const result = await copyToClipboard(textToCopy)

    if (result.success) {
      copySuccess.value = true
      copyError.value = ''
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    } else {
      copyError.value = result.error || '复制失败'
      setTimeout(() => {
        copyError.value = ''
      }, 3000)
    }
  } catch (err) {
    console.error('Failed to copy:', err)
    copyError.value = '复制失败，请重试'
    setTimeout(() => {
      copyError.value = ''
    }, 3000)
  }
}
</script>

<style scoped>
.json-line-item {
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.json-line-item:hover {
  background: #f9f9f9;
}

.line-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  position: relative;
}

.line-number {
  font-family: var(--viewer-font-family);
  font-size: calc(var(--viewer-font-size) * 0.9);
  color: #999;
  min-width: 50px;
  text-align: right;
  font-weight: 500;
  flex-shrink: 0;
  line-height: 1.5;
}

.expand-icon {
  color: #666;
  font-size: 12px;
  width: 16px;
  text-align: center;
  transition: transform 0.2s;
  flex-shrink: 0;
  cursor: pointer;
  line-height: 1.5;
  margin-top: 1px;
}

.expand-icon:hover {
  color: #333;
}

.line-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

.matched-path {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  margin-left: auto;
  background: #f5f5f5;
  border-left: 2px solid #ddd;
  border-radius: 3px;
  font-family: var(--viewer-font-family);
  font-size: calc(var(--viewer-font-size) * 0.85);
  opacity: 0.85;
  flex-shrink: 0;
  align-self: center;
}

.path-icon {
  font-size: 11px;
  opacity: 0.6;
}

.path-text {
  color: #888;
  font-weight: 400;
}

.expanded .expand-icon {
  transform: rotate(0deg);
}

.copy-line-btn {
  padding: 4px 10px;
  font-size: 12px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
  flex-shrink: 0;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.json-line-item:hover .copy-line-btn {
  opacity: 1;
}

.copy-line-btn:hover {
  background: #e0e0e0;
}

.copy-line-btn.error {
  background: #ffebee;
  border-color: #ef5350;
  color: #c62828;
}

/* 暗色主题 */
:root.dark .json-line-item {
  border-bottom-color: #333;
}

:root.dark .json-line-item:hover {
  background: #2a2a2a;
}

:root.dark .line-number {
  color: #666;
}

:root.dark .expand-icon {
  color: #999;
}

:root.dark .expand-icon:hover {
  color: #ddd;
}

:root.dark .line-content {
  color: #ddd;
}

:root.dark .copy-line-btn {
  background: #333;
  border-color: #555;
  color: #ddd;
}

:root.dark .copy-line-btn:hover {
  background: #444;
}

:root.dark .copy-line-btn.error {
  background: #4a2626;
  border-color: #d32f2f;
  color: #ef5350;
}

:root.dark .matched-path {
  background: #2a2a2a;
  border-left-color: #444;
}

:root.dark .path-text {
  color: #666;
}
</style>
