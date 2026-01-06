<template>
  <div id="app" :class="{ dark: store.isDark }">
    <header class="app-header">
      <h1 class="app-title">JSONL Viewer</h1>
      <div class="app-actions">
        <button class="action-btn" @click="goToHome" title="返回首页" v-if="store.totalLines > 0">
          🏠
        </button>
        <button class="action-btn" @click="toggleTheme" :title="themeTitle">
          {{ store.isDark ? '☀️' : '🌙' }}
        </button>
        <div class="theme-selector">
          <button class="action-btn theme-btn" @click.stop="toggleThemeMenu" title="选择主题配色">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C9.79 22 7.79 21.21 6.34 19.84C4.89 18.47 4 16.61 4 14.5C4 12.68 4.67 11.04 5.82 9.84C6.97 8.64 8.5 8 10.22 8C10.23 6.75 10.67 5.55 11.46 4.59C12.25 3.63 13.33 3 14.5 3C15.67 3 16.75 3.63 17.54 4.59C18.33 5.55 18.77 6.75 18.78 8C20.5 8 22.03 8.64 23.18 9.84C24.33 11.04 25 12.68 25 14.5C25 16.61 24.11 18.47 22.66 19.84C21.21 21.21 19.21 22 17 22H12Z" transform="translate(-2 -1)" fill="currentColor"/>
              <circle cx="8" cy="11" r="1.5" fill="white"/>
              <circle cx="12" cy="9" r="1.5" fill="white"/>
              <circle cx="16" cy="11" r="1.5" fill="white"/>
              <circle cx="10" cy="14" r="1.5" fill="white"/>
              <circle cx="14" cy="14" r="1.5" fill="white"/>
            </svg>
          </button>
          <div v-if="showThemeMenu" class="theme-menu" @click.stop>
            <div
              v-for="theme in store.availableThemes"
              :key="theme.id"
              class="theme-menu-item"
              :class="{ active: theme.id === store.currentThemeColor }"
              @click="selectTheme(theme.id)"
            >
              <span class="theme-color-preview" :style="{ background: `linear-gradient(135deg, ${theme.colors.gradientFrom} 0%, ${theme.colors.gradientTo} 100%)` }"></span>
              <span class="theme-name">{{ theme.name }}</span>
              <span v-if="theme.id === store.currentThemeColor" class="theme-check">✓</span>
            </div>
          </div>
        </div>
        <button class="action-btn" @click="handleExport" title="导出" v-if="store.totalLines > 0">
          💾
        </button>
      </div>
    </header>

    <SearchFilter v-if="store.totalLines > 0" />

    <main class="app-main">
      <!-- 加载中状态（自动加载模式） -->
      <div v-if="isAutoLoad && isLoading" class="loading-area">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h2>正在加载 JSONL 文件...</h2>
          <p>请稍候</p>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div v-else-if="store.totalLines === 0"
           class="upload-area"
           tabindex="0"
           @drop.prevent="handleDrop"
           @dragover.prevent
           @dragenter="isDragging = true"
           @dragleave="isDragging = false"
           @paste="handlePaste"
           :class="{ dragging: isDragging }">
        <div class="upload-content">
          <div class="upload-icon">📄</div>
          <h2>拖拽文件到此处</h2>
          <p>支持 .jsonl、.json、.ndjson 格式</p>
          <label class="upload-btn">
            <input type="file" @change="handleFileSelect" accept=".jsonl,.json,.ndjson,.txt" hidden />
            点击选择文件
          </label>
          <div class="divider">或</div>
          <p class="paste-hint">📋 按 Ctrl+V 粘贴内容</p>
        </div>
      </div>

      <!-- 粘贴内容对话框 -->
      <div v-if="showPasteDialog" class="paste-dialog-overlay" @click="showPasteDialog = false">
        <div class="paste-dialog" @click.stop>
          <div class="paste-dialog-header">
            <h3>粘贴 JSONL 内容</h3>
            <button class="paste-close-btn" @click="showPasteDialog = false">✕</button>
          </div>
          <textarea
            v-model="pasteContent"
            class="paste-textarea"
            placeholder="在此粘贴 JSONL 内容...&#10;每行一个 JSON 对象，例如：&#10;{&quot;name&quot;: &quot;Alice&quot;, &quot;age&quot;: 25}&#10;{&quot;name&quot;: &quot;Bob&quot;, &quot;age&quot;: 30}"
            @keydown.ctrl.enter="handlePasteSubmit"
            @keydown.meta.enter="handlePasteSubmit"
          ></textarea>
          <div class="paste-dialog-footer">
            <button class="paste-submit-btn" @click="handlePasteSubmit" :disabled="!pasteContent.trim()">
              确定
            </button>
            <button class="paste-cancel-btn" @click="showPasteDialog = false">
              取消
            </button>
          </div>
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

          <!-- 加载更多提示 -->
          <div v-if="store.hasMore" class="load-more">
            <div class="load-more-info">
              已显示 {{ store.displayLines.length }} / {{ store.filteredCount }} 行
            </div>
            <button class="load-more-btn" @click="store.loadMore()">
              加载更多 ({{ Math.min(store.batchSize, store.filteredCount - store.displayLines.length) }} 行)
            </button>
          </div>
        </div>
      </div>
    </main>

    <div v-if="error" class="error-toast">
      {{ error }}
    </div>

    <!-- 滚动按钮 -->
    <div v-if="store.totalLines > 0" class="scroll-buttons">
      <button v-if="!isAtTop" class="scroll-btn scroll-to-top" @click="scrollToTop" title="到顶部">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12L5.41 13.41L11 7.83V20H13V7.83L18.59 13.41L20 12L12 4Z" fill="currentColor"/>
        </svg>
      </button>
      <button v-if="!isAtBottom" class="scroll-btn scroll-to-bottom" @click="scrollToBottom" title="到末尾">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20L20 12L18.59 10.59L13 16.17V4H11V16.17L5.41 10.59L4 12L12 20Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useJsonlStore } from './stores/jsonlStore'
import SearchFilter from './components/SearchFilter.vue'
import JsonLineItem from './components/JsonLineItem.vue'
import { exportToJsonLines, exportToJson } from './utils/parser'

const store = useJsonlStore()
const isDragging = ref(false)
const error = ref('')
const showPasteDialog = ref(false)
const pasteContent = ref('')
const showThemeMenu = ref(false)

// 自动加载模式（从 URL 参数判断是否来自页面拦截）
const isAutoLoad = ref(false)
// 加载中状态
const isLoading = ref(false)

// 滚动按钮状态
const isAtTop = ref(true)
const isAtBottom = ref(false)

// 滚动配置：预留滚动的屏数（当内容很长时，先跳转到接近目标位置，然后再平滑滚动这么多屏）
const SMOOTH_SCROLL_VIEWPORTS = 10

const themeTitle = computed(() => {
  return store.isDark ? '切换到亮色主题' : '切换到暗色主题'
})

// 检测是否为自动加载模式（来自页面拦截）
const urlParams = new URLSearchParams(window.location.search)
isAutoLoad.value = urlParams.get('autoload') === 'true'

// 如果是自动加载模式，显示加载状态
if (isAutoLoad.value) {
  isLoading.value = true
}

// 立即加载并应用主题（在页面渲染前）
store.loadTheme()
store.loadThemeColor()
applyTheme()
applyThemeColors()

onMounted(() => {
  // 加载保存的显示行数配置
  store.loadMaxDisplayLines()

  // 监听来自 content script 的消息
  window.addEventListener('message', handleMessage)

  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
  // 初始化滚动状态
  handleScroll()

  // 监听全局点击事件，关闭主题菜单
  window.addEventListener('click', closeThemeMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleMessage(event: MessageEvent) {
  if (event.data.type === 'LOAD_JSONL') {
    try {
      store.loadText(event.data.data)
      // 加载成功后关闭加载状态
      isLoading.value = false
    } catch (err) {
      showError('无法解析文件内容')
      isLoading.value = false
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

function applyThemeColors() {
  const theme = store.currentTheme
  const root = document.documentElement

  root.style.setProperty('--theme-primary', theme.colors.primary)
  root.style.setProperty('--theme-primary-dark', theme.colors.primaryDark)
  root.style.setProperty('--theme-gradient-from', theme.colors.gradientFrom)
  root.style.setProperty('--theme-gradient-to', theme.colors.gradientTo)
  root.style.setProperty('--theme-shadow-color', theme.colors.shadowColor)
}

function setThemeColor(themeId: string) {
  store.setThemeColor(themeId)
  applyThemeColors()
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

function goToHome() {
  if (confirm('确定要返回首页吗？当前数据将被清空。')) {
    store.clear()
  }
}

function handlePasteSubmit() {
  const content = pasteContent.value.trim()
  if (!content) {
    return
  }

  try {
    store.loadText(content)
    showPasteDialog.value = false
    pasteContent.value = ''
  } catch (err) {
    showError('无法解析粘贴的内容：' + (err as Error).message)
  }
}

// 处理粘贴事件
function handlePaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text')
  if (text && text.trim()) {
    try {
      store.loadText(text)
    } catch (err) {
      showError('无法解析粘贴的内容：' + (err as Error).message)
    }
  }
}

// 主题菜单相关函数
function toggleThemeMenu() {
  showThemeMenu.value = !showThemeMenu.value
}

function selectTheme(themeId: string) {
  setThemeColor(themeId)
  showThemeMenu.value = false
}

function closeThemeMenu() {
  showThemeMenu.value = false
}

// 滚动相关函数
function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  // 判断是否在顶部（容差5px）
  isAtTop.value = scrollTop <= 5

  // 判断是否在底部（容差5px）
  isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 5

  // 自动加载更多：当距离底部不到 500px 且还有更多数据时
  const distanceToBottom = scrollHeight - scrollTop - clientHeight
  if (distanceToBottom < 500 && store.hasMore) {
    store.loadMore()
  }
}

function scrollToTop() {
  const currentScroll = window.scrollY || document.documentElement.scrollTop
  const viewportHeight = window.innerHeight
  const threshold = viewportHeight * (SMOOTH_SCROLL_VIEWPORTS + 2)

  if (currentScroll > threshold) {
    // 距离太远，先快速跳转到接近顶部的位置，预留指定屏数进行平滑滚动
    window.scrollTo({
      top: viewportHeight * SMOOTH_SCROLL_VIEWPORTS,
      behavior: 'instant'
    })
    // 短暂延迟后再平滑滚动到顶部
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }, 50)
  } else {
    // 距离较近，直接平滑滚动
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

function scrollToBottom() {
  const currentScroll = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const viewportHeight = window.innerHeight
  const threshold = viewportHeight * (SMOOTH_SCROLL_VIEWPORTS + 2)
  const distanceToBottom = scrollHeight - currentScroll - viewportHeight

  if (distanceToBottom > threshold) {
    // 距离太远，先快速跳转到接近底部的位置，预留指定屏数进行平滑滚动
    const jumpTarget = scrollHeight - viewportHeight * SMOOTH_SCROLL_VIEWPORTS
    window.scrollTo({
      top: jumpTarget,
      behavior: 'instant'
    })
    // 短暂延迟后再平滑滚动到底部
    setTimeout(() => {
      window.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      })
    }, 50)
  } else {
    // 距离较近，直接平滑滚动
    window.scrollTo({
      top: scrollHeight,
      behavior: 'smooth'
    })
  }
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
  background: linear-gradient(135deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%);
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

.theme-selector {
  display: flex;
  align-items: center;
  position: relative;
}

.theme-btn {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn svg {
  width: 20px;
  height: 20px;
}

.theme-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.theme-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.theme-menu-item:last-child {
  border-bottom: none;
}

.theme-menu-item:hover {
  background: #f5f5f5;
}

.theme-menu-item.active {
  background: #f0f7ff;
}

.theme-color-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.theme-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.theme-check {
  color: var(--theme-primary);
  font-size: 16px;
  font-weight: bold;
}

.theme-select {
  padding: 6px 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  color: #333;
  font-weight: 500;
  transition: background 0.2s;
}

.theme-select:hover {
  background: white;
}

.theme-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
}

.app-main {
  min-height: calc(100vh - 80px);
}

/* 加载中区域 */
.loading-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  margin: 40px;
}

.loading-content {
  text-align: center;
  padding: 60px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--theme-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #333;
}

.loading-content p {
  font-size: 14px;
  color: #666;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  margin: 40px;
  border: 3px dashed #ddd;
  border-radius: 12px;
  transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.upload-area:focus {
  outline: none;
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 3%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 10%, transparent);
}

.upload-area.dragging {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 5%, transparent);
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
  background: linear-gradient(135deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--theme-shadow-color);
}

.divider {
  margin: 24px 0;
  color: #999;
  font-size: 14px;
  font-weight: 500;
}

.paste-btn {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.paste-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 206, 162, 0.4);
}

.paste-hint {
  font-size: 15px;
  color: #666;
  margin: 8px 0 0 0;
  padding: 12px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
  display: inline-block;
  font-weight: 500;
  transition: all 0.3s;
}

.upload-area:focus .paste-hint {
  color: var(--theme-primary);
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 8%, white);
}

/* 粘贴对话框 */
.paste-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.paste-dialog {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.paste-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.paste-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.paste-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.paste-close-btn:hover {
  background: #f0f0f0;
  color: #666;
}

.paste-textarea {
  flex: 1;
  margin: 24px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.paste-textarea:focus {
  border-color: var(--theme-primary);
}

.paste-textarea::placeholder {
  color: #999;
}

.paste-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.paste-submit-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.paste-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--theme-shadow-color);
}

.paste-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paste-cancel-btn {
  padding: 10px 24px;
  background: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.paste-cancel-btn:hover {
  background: #e0e0e0;
  border-color: #ccc;
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
#app.dark .loading-content h2 {
  color: #ddd;
}

#app.dark .loading-content p {
  color: #999;
}

#app.dark .loading-spinner {
  border-color: #444;
  border-top-color: var(--theme-primary);
}

#app.dark .upload-area {
  border-color: #444;
}

#app.dark .upload-area:focus {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 5%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 15%, transparent);
}

#app.dark .upload-area.dragging {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
}

#app.dark .upload-content h2 {
  color: #ddd;
}

#app.dark .upload-content p {
  color: #999;
}

#app.dark .paste-hint {
  background: #2a2a2a;
  border-color: #444;
  color: #999;
}

#app.dark .upload-area:focus .paste-hint {
  color: var(--theme-primary);
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 10%, #2a2a2a);
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

/* 粘贴对话框暗色主题 */
#app.dark .paste-dialog {
  background: #2a2a2a;
}

#app.dark .paste-dialog-header {
  border-bottom-color: #444;
}

#app.dark .paste-dialog-header h3 {
  color: #ddd;
}

#app.dark .paste-close-btn {
  color: #666;
}

#app.dark .paste-close-btn:hover {
  background: #3a3a3a;
  color: #999;
}

#app.dark .paste-textarea {
  background: #1e1e1e;
  border-color: #444;
  color: #ddd;
}

#app.dark .paste-textarea:focus {
  border-color: var(--theme-primary);
}

#app.dark .paste-textarea::placeholder {
  color: #666;
}

#app.dark .paste-dialog-footer {
  border-top-color: #444;
}

#app.dark .paste-cancel-btn {
  background: #3a3a3a;
  color: #ddd;
  border-color: #555;
}

#app.dark .paste-cancel-btn:hover {
  background: #444;
  border-color: #666;
}

/* 滚动按钮 */
.scroll-buttons {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 999;
}

.scroll-btn {
  padding: 10px;
  background: linear-gradient(135deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px var(--theme-shadow-color);
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInSlide 0.3s ease-out;
}

.scroll-btn svg {
  width: 20px;
  height: 20px;
}

.scroll-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--theme-shadow-color) 133%, transparent);
}

.scroll-btn:active {
  transform: translateY(0);
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 暗色主题下的滚动按钮 */
#app.dark .scroll-btn {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8c 100%);
  box-shadow: 0 4px 12px rgba(85, 104, 211, 0.4);
}

#app.dark .scroll-btn:hover {
  box-shadow: 0 6px 16px rgba(85, 104, 211, 0.5);
}

/* 暗色主题下的主题菜单 */
#app.dark .theme-menu {
  background: #2a2a2a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

#app.dark .theme-menu-item {
  color: #ddd;
  border-bottom-color: #3a3a3a;
}

#app.dark .theme-menu-item:hover {
  background: #3a3a3a;
}

#app.dark .theme-menu-item.active {
  background: #2a3a4a;
}

/* 加载更多按钮 */
.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  margin: 20px;
  border-top: 2px solid #e0e0e0;
}

.load-more-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.load-more-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--theme-shadow-color);
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--theme-shadow-color);
}

.load-more-btn:active {
  transform: translateY(0);
}

/* 暗色主题下的加载更多 */
#app.dark .load-more {
  border-top-color: #444;
}

#app.dark .load-more-info {
  color: #999;
}
</style>
