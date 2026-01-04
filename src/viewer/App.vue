<template>
  <div id="app" :class="{ dark: store.isDark }">
    <header class="app-header">
      <h1 class="app-title">JSONL Viewer</h1>
      <div class="app-actions">
        <button class="action-btn" @click="toggleTheme" :title="themeTitle">
          {{ store.isDark ? '☀️' : '🌙' }}
        </button>
        <button class="action-btn" @click="handleExport" title="导出" v-if="store.totalLines > 0">
          💾
        </button>
      </div>
    </header>

    <SearchFilter v-if="store.totalLines > 0" />

    <main class="app-main">
      <!-- 文件上传区域 -->
      <div v-if="store.totalLines === 0" class="upload-area"
           @drop.prevent="handleDrop"
           @dragover.prevent
           @dragenter="isDragging = true"
           @dragleave="isDragging = false"
           :class="{ dragging: isDragging }">
        <div class="upload-content">
          <div class="upload-icon">📄</div>
          <h2>拖拽文件到此处</h2>
          <p>支持 .jsonl、.json、.ndjson 格式</p>
          <label class="upload-btn">
            <input type="file" @change="handleFileSelect" accept=".jsonl,.json,.ndjson,.txt" hidden />
            或点击选择文件
          </label>
        </div>
      </div>

      <!-- JSON Lines 显示区域 -->
      <div v-else class="jsonl-content">
        <div v-if="store.filteredCount === 0 && store.hasSearch" class="no-results">
          <p>😕 没有找到匹配的结果</p>
          <p class="hint">尝试使用其他关键字或切换过滤模式</p>
        </div>
        <div v-else class="lines-list">
          <JsonLineItem
            v-for="line in store.displayLines"
            :key="line.id"
            :line="line"
          />
        </div>
      </div>
    </main>

    <div v-if="error" class="error-toast">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useJsonlStore } from './stores/jsonlStore'
import SearchFilter from './components/SearchFilter.vue'
import JsonLineItem from './components/JsonLineItem.vue'
import { exportToJsonLines, exportToJson } from './utils/parser'

const store = useJsonlStore()
const isDragging = ref(false)
const error = ref('')

const themeTitle = computed(() => {
  return store.isDark ? '切换到亮色主题' : '切换到暗色主题'
})

// 立即加载并应用主题（在页面渲染前）
store.loadTheme()
applyTheme()

onMounted(() => {
  // 加载保存的显示行数配置
  store.loadMaxDisplayLines()

  // 监听来自 content script 的消息
  window.addEventListener('message', handleMessage)
})

function handleMessage(event: MessageEvent) {
  if (event.data.type === 'LOAD_JSONL') {
    try {
      store.loadText(event.data.data)
    } catch (err) {
      showError('无法解析文件内容')
    }
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    loadFile(files[0])
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    loadFile(input.files[0])
  }
}

async function loadFile(file: File) {
  try {
    const text = await file.text()
    store.loadText(text)
  } catch (err) {
    showError('文件读取失败：' + (err as Error).message)
  }
}

function toggleTheme() {
  store.toggleTheme()
  applyTheme()
}

function applyTheme() {
  if (store.isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function handleExport() {
  const lines = store.filteredCount > 0 ? store.filteredLines : store.allLines

  let content: string
  let filename: string

  if (store.fileType === 'jsonl') {
    content = exportToJsonLines(lines)
    filename = 'export.jsonl'
  } else {
    content = exportToJson(lines)
    filename = 'export.json'
  }

  // 下载文件
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function showError(message: string) {
  error.value = message
  setTimeout(() => {
    error.value = ''
  }, 3000)
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
}

#app {
  min-height: 100vh;
  background: #fff;
  color: #333;
  transition: background 0.3s, color 0.3s;
}

#app.dark {
  background: #1e1e1e;
  color: #ddd;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 24px;
  font-weight: 600;
}

.app-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.depth-control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
}

.depth-label {
  font-size: 13px;
  color: white;
  font-weight: 500;
}

.depth-select {
  padding: 4px 8px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  font-weight: 500;
  transition: background 0.2s;
}

.depth-select:hover {
  background: white;
}

.depth-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
}

.action-btn {
  padding: 8px 16px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  color: white;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0);
}

.app-main {
  min-height: calc(100vh - 80px);
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  margin: 40px;
  border: 3px dashed #ddd;
  border-radius: 12px;
  transition: border-color 0.3s, background 0.3s;
}

.upload-area.dragging {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-content {
  text-align: center;
  padding: 60px;
}

.upload-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.upload-content h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #333;
}

.upload-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.upload-btn {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.jsonl-content {
  background: #fff;
  padding: 0;
}

.lines-list {
  max-width: 100%;
  width: 100%;
  overflow-x: auto;
}

.no-results {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.no-results p {
  font-size: 18px;
  margin-bottom: 8px;
}

.no-results .hint {
  font-size: 14px;
  color: #bbb;
}

.error-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  background: #f44336;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 暗色主题 */
#app.dark .upload-area {
  border-color: #444;
}

#app.dark .upload-area.dragging {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

#app.dark .upload-content h2 {
  color: #ddd;
}

#app.dark .upload-content p {
  color: #999;
}

#app.dark .jsonl-content {
  background: #1e1e1e;
}

#app.dark .no-results {
  color: #666;
}

#app.dark .no-results .hint {
  color: #555;
}
</style>
