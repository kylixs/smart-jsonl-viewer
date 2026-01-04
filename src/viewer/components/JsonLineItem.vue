<template>
  <div class="json-line-item" :class="{ expanded: line.isExpanded }">
    <div class="line-header">
      <div class="line-info" @click="toggleExpand">
        <span class="line-number">{{ line.lineNumber }}</span>
        <span class="expand-icon">{{ line.isExpanded ? '▼' : '▶' }}</span>
        <span class="line-preview">
          {{ linePreview }}
        </span>
      </div>
      <button
        class="copy-line-btn"
        @click.stop="copyLine"
        :title="copySuccess ? '已复制!' : copyError || '复制整行内容'"
        :class="{ error: copyError }"
      >
        {{ copySuccess ? '✓' : copyError ? '✗' : '📋' }}
      </button>
    </div>

    <div v-if="line.isExpanded" class="line-content">
      <div v-if="line.matchedPath" class="matched-path">
        <span class="path-icon">📍</span>
        <span class="path-text">{{ line.matchedPath }}</span>
      </div>
      <JsonTree :data="line.parsedData" :depth="0" :max-depth="store.expandDepth" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

const linePreview = computed(() => {
  const raw = props.line.rawContent
  const maxLength = 100

  if (raw.length <= maxLength) {
    return raw
  }

  return raw.substring(0, maxLength) + '...'
})

function toggleExpand() {
  store.toggleLineExpand(props.line.id)
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

.line-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}

.line-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  flex: 1;
}

.line-number {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  color: #999;
  min-width: 40px;
  text-align: right;
  font-weight: 500;
}

.expand-icon {
  color: #666;
  font-size: 12px;
  width: 16px;
  text-align: center;
  transition: transform 0.2s;
}

.line-preview {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-content {
  padding: 16px 24px;
  background: #fafafa;
  width: 100%;
  box-sizing: border-box;
}

.matched-path {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-left: 2px solid #ddd;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 11px;
  opacity: 0.8;
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

:root.dark .line-preview {
  color: #ddd;
}

:root.dark .line-content {
  background: #1e1e1e;
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
