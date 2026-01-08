<template>
  <div id="app" :class="{ dark: store.isDark }"
       @drop.prevent="handleGlobalDrop"
       @dragover.prevent="handleGlobalDragOver"
       @dragleave="handleGlobalDragLeave">
    <header class="app-header">
      <div class="app-title-section">
        <svg class="app-icon" width="40" height="40" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
          <text x="32" y="64" font-family="Arial, sans-serif" font-size="70" font-weight="bold" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="5" text-anchor="middle" dominant-baseline="middle">{</text>
          <text x="64" y="64" font-family="Georgia, serif" font-size="44" font-weight="normal" font-style="italic" fill="white" fill-opacity="0.95" stroke="rgba(0,0,0,0.12)" stroke-width="3" text-anchor="middle" dominant-baseline="middle">L</text>
          <text x="96" y="64" font-family="Arial, sans-serif" font-size="70" font-weight="bold" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="5" text-anchor="middle" dominant-baseline="middle">}</text>
        </svg>
        <h1 class="app-title">Smart JSONL Viewer</h1>
        <span v-if="currentFileName" class="current-file-name">{{ currentFileName }}</span>
      </div>
      <div class="app-actions">
        <button class="action-btn" @click="goToHome" :title="t('app.home')" v-if="store.totalLines > 0">
          🏠
        </button>
        <button class="action-btn" @click="toggleHelpDialog" :title="t('app.help')">
          ℹ️
        </button>
        <button class="action-btn" @click="toggleTheme" :title="themeTitle">
          {{ store.isDark ? '☀️' : '🌙' }}
        </button>
        <button class="action-btn settings-btn" @click.stop="toggleSettingsPanel" :title="t('app.settings')">
          ⚙️
        </button>
        <button class="action-btn" @click="handleExport" :title="t('app.export')" v-if="store.totalLines > 0">
          📥
        </button>
      </div>
    </header>

    <SearchFilter v-if="store.totalLines > 0" />

    <!-- 设置对话框 -->
    <div v-if="showSettingsPanel" class="settings-dialog-overlay" @click="showSettingsPanel = false">
      <div class="settings-dialog" @click.stop>
        <div class="settings-header">
          <h2>{{ t('settings.title') }}</h2>
          <button class="settings-close" @click="showSettingsPanel = false" :title="t('settings.close')">✕</button>
        </div>
        <div class="settings-content">
          <!-- 语言选择 -->
          <div class="setting-group">
            <label class="setting-group-label">{{ t('settings.language') }}:</label>
            <select v-model="currentLocale" @change="handleLanguageChange" class="setting-select">
              <option v-for="locale in availableLocales" :key="locale.code" :value="locale.code">
                {{ locale.flag }} {{ locale.name }}
              </option>
            </select>
          </div>

          <!-- 主题模式 -->
          <div class="setting-group">
            <label class="setting-group-label">{{ t('settings.themeMode') }}:</label>
            <div class="setting-toggle-group">
              <button
                class="setting-toggle-btn"
                :class="{ active: !store.isDark }"
                @click="store.isDark && toggleTheme()"
              >
                ☀️ {{ t('theme.lightMode') }}
              </button>
              <button
                class="setting-toggle-btn"
                :class="{ active: store.isDark }"
                @click="!store.isDark && toggleTheme()"
              >
                🌙 {{ t('theme.darkMode') }}
              </button>
            </div>
          </div>

          <!-- 主题配色 -->
          <div class="setting-group">
            <label class="setting-group-label">{{ t('settings.themeColor') }}:</label>
            <div class="color-picker-grid">
              <div
                v-for="theme in store.availableThemes"
                :key="theme.id"
                class="color-option"
                :class="{ active: theme.id === store.currentThemeColor }"
                @click="selectThemeColor(theme.id)"
                :title="t(theme.nameKey)"
              >
                <div class="color-preview" :style="{ background: `linear-gradient(135deg, ${theme.colors.gradientFrom} 0%, ${theme.colors.gradientTo} 100%)` }"></div>
                <span v-if="theme.id === store.currentThemeColor" class="color-check">✓</span>
              </div>
            </div>
          </div>

          <!-- 预览行数 -->
          <div class="setting-group">
            <label class="setting-group-label">{{ t('settings.maxLines') }}:</label>
            <select v-model="selectedMaxLines" @change="handleMaxLinesChange" class="setting-select">
              <option :value="-1">{{ t('settings.unlimited') }}</option>
              <option :value="5">5 {{ t('settings.lines') }}</option>
              <option :value="10">10 {{ t('settings.lines') }}</option>
              <option :value="20">20 {{ t('settings.lines') }}</option>
              <option :value="30">30 {{ t('settings.lines') }}</option>
              <option :value="50">50 {{ t('settings.lines') }}</option>
              <option :value="100">100 {{ t('settings.lines') }}</option>
            </select>
          </div>

          <!-- 缩进字符数 -->
          <div class="setting-group">
            <label class="setting-group-label">{{ t('settings.indentSize') }}:</label>
            <select v-model="selectedIndentSize" @change="handleIndentSizeChange" class="setting-select">
              <option :value="2">2 {{ t('settings.spaces') }}</option>
              <option :value="4">4 {{ t('settings.spaces') }}</option>
              <option :value="8">8 {{ t('settings.spaces') }}</option>
            </select>
          </div>

          <!-- 字体 -->
          <div class="setting-group">
            <label class="setting-group-label">{{ t('settings.fontFamily') }}:</label>
            <select v-model="selectedFontFamily" @change="handleFontFamilyChange" class="setting-select">
              <option value="Monaco, Menlo, Consolas, 'Courier New', monospace">Monaco / Menlo</option>
              <option value="'Fira Code', 'Cascadia Code', 'Courier New', monospace">Fira Code / Cascadia</option>
              <option value="'Source Code Pro', monospace">Source Code Pro</option>
              <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
              <option value="Arial, Helvetica, sans-serif">Arial / Helvetica</option>
              <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
            </select>
          </div>

          <!-- 字体大小 -->
          <div class="setting-group">
            <label class="setting-group-label">{{ t('settings.fontSize') }}:</label>
            <select v-model="selectedFontSize" @change="handleFontSizeChange" class="setting-select">
              <option :value="11">11 {{ t('settings.px') }}</option>
              <option :value="12">12 {{ t('settings.px') }}</option>
              <option :value="13">13 {{ t('settings.px') }}</option>
              <option :value="14">14 {{ t('settings.px') }}</option>
              <option :value="15">15 {{ t('settings.px') }}</option>
              <option :value="16">16 {{ t('settings.px') }}</option>
              <option :value="18">18 {{ t('settings.px') }}</option>
              <option :value="20">20 {{ t('settings.px') }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

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

      <!-- 拖拽覆盖层（列表页面） -->
      <div v-if="isDragging && store.totalLines > 0" class="drag-overlay-global">
        <div class="drag-overlay-content">
          <div class="drag-overlay-icon">📁</div>
          <h2>拖拽文件到此处</h2>
          <p>将加载新文件</p>
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

    <!-- 帮助对话框 -->
    <div v-if="showHelpDialog" class="help-dialog-overlay" @click="showHelpDialog = false">
      <div class="help-dialog" @click.stop>
        <div class="help-header">
          <h2>{{ t('help.title') }}</h2>
          <button class="help-close" @click="showHelpDialog = false">✕</button>
        </div>
        <div class="help-content">
          <section class="help-section">
            <h3>{{ t('help.fileLoading.title') }}</h3>
            <ul>
              <li>{{ t('help.fileLoading.feature1') }}</li>
              <li>{{ t('help.fileLoading.feature2') }}</li>
              <li>{{ t('help.fileLoading.feature3') }}</li>
              <li>{{ t('help.fileLoading.feature4') }}</li>
            </ul>
          </section>

          <section class="help-section">
            <h3>{{ t('help.searchFilter.title') }}</h3>
            <ul>
              <li>{{ t('help.searchFilter.feature1') }}</li>
              <li>{{ t('help.searchFilter.feature2') }}</li>
              <li>{{ t('help.searchFilter.feature3') }}</li>
              <li>{{ t('help.searchFilter.feature4') }}</li>
              <li>{{ t('help.searchFilter.feature5') }}</li>
            </ul>
          </section>

          <section class="help-section">
            <h3>{{ t('help.smartDecoding.title') }}</h3>
            <ul>
              <li>{{ t('help.smartDecoding.feature1') }}</li>
              <li>{{ t('help.smartDecoding.feature2') }}</li>
              <li>{{ t('help.smartDecoding.feature3') }}</li>
              <li>{{ t('help.smartDecoding.feature4') }}</li>
            </ul>
          </section>

          <section class="help-section">
            <h3>{{ t('help.themesSettings.title') }}</h3>
            <ul>
              <li>{{ t('help.themesSettings.feature1') }}</li>
              <li>{{ t('help.themesSettings.feature2') }}</li>
              <li>{{ t('help.themesSettings.feature3') }}</li>
              <li>{{ t('help.themesSettings.feature4') }}</li>
            </ul>
          </section>

          <section class="help-section">
            <h3>{{ t('help.moreFeatures.title') }}</h3>
            <ul>
              <li>{{ t('help.moreFeatures.feature1') }}</li>
              <li>{{ t('help.moreFeatures.feature2') }}</li>
              <li>{{ t('help.moreFeatures.feature3') }}</li>
            </ul>
          </section>

          <section class="help-section">
            <h3>{{ t('help.moreInfo.title') }}</h3>
            <p>
              {{ t('help.moreInfo.content') }}
              <br>
              <a href="https://github.com/kylixs/smart-jsonl-viewer" target="_blank" rel="noopener noreferrer" class="github-link">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: text-bottom; margin-right: 4px;">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                {{ t('help.moreInfo.github') }}
              </a>
            </p>
          </section>
        </div>
      </div>
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

    <!-- 后台加载/渲染进度条（底部悬浮，半透明） -->
    <div v-if="store.isBackgroundLoading || store.isRendering" class="loading-progress">
      <div class="loading-progress-content">
        <span class="loading-progress-text">{{ progressText }}</span>
        <span class="loading-progress-count">{{ progressCount }}</span>
        <div class="loading-progress-bar">
          <div class="loading-progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJsonlStore } from './stores/jsonlStore'
import SearchFilter from './components/SearchFilter.vue'
import JsonLineItem from './components/JsonLineItem.vue'
import { exportToJsonLines, exportToJson } from './utils/parser'
import { getSettings, saveSettings } from './utils/settings'
import { availableLocales, setLocale, getLocale } from './i18n'

const { t } = useI18n()

const store = useJsonlStore()
const isDragging = ref(false)
const error = ref('')
const showPasteDialog = ref(false)
const pasteContent = ref('')
const showSettingsPanel = ref(false)
const showHelpDialog = ref(false)
const selectedMaxLines = ref(10)
const selectedIndentSize = ref(2)
const selectedFontFamily = ref('Monaco, Menlo, Consolas, "Courier New", monospace')
const selectedFontSize = ref(13)
const currentLocale = ref(getLocale())

// 当前文件信息
const currentFileName = ref('')
const currentFileSize = ref(0)

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
  return store.isDark ? t('theme.light') : t('theme.dark')
})

// 进度相关计算属性
const progressText = computed(() => {
  if (store.isBackgroundLoading) {
    return '正在加载...'
  } else if (store.isRendering) {
    return '正在渲染...'
  }
  return ''
})

const progressCount = computed(() => {
  if (store.isBackgroundLoading) {
    return `${store.loadedCount} / ${store.totalCount} 行`
  } else if (store.isRendering) {
    return `${store.renderedCount} / ${store.filteredCount} 行`
  }
  return ''
})

const progressPercentage = computed(() => {
  if (store.isBackgroundLoading) {
    if (store.totalCount === 0) return 0
    return Math.floor((store.loadedCount / store.totalCount) * 100)
  } else if (store.isRendering) {
    if (store.filteredCount === 0) return 0
    return Math.floor((store.renderedCount / store.filteredCount) * 100)
  }
  return 0
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
  // 加载设置
  const settings = getSettings()
  selectedMaxLines.value = settings.maxDisplayLines
  selectedIndentSize.value = settings.indentSize
  selectedFontFamily.value = settings.fontFamily
  selectedFontSize.value = settings.fontSize

  // 应用设置到 store
  store.setMaxDisplayLines(settings.maxDisplayLines)

  // 应用字体设置
  applyFontSettings()

  // 从 URL 参数恢复文件名显示
  const urlParams = new URLSearchParams(window.location.search)
  const fileName = urlParams.get('file')
  const fileSize = urlParams.get('size')
  if (fileName) {
    currentFileName.value = fileName
    if (fileSize) {
      currentFileSize.value = parseInt(fileSize)
    }
    document.title = `${fileName} - JSONL Viewer`
  }

  // 监听来自 content script 的消息
  window.addEventListener('message', handleMessage)

  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
  // 初始化滚动状态
  handleScroll()
})

onBeforeUnmount(() => {
  // 清理事件监听器
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('message', handleMessage)

  // 清空 Store 数据，释放内存
  store.cleanup()
})

function handleMessage(event: MessageEvent) {
  if (event.data.type === 'LOAD_JSONL') {
    const msgStartTime = performance.now()
    console.log(`[${new Date().toISOString()}] ########## handleMessage 开始 ##########`)
    console.log(`[${new Date().toISOString()}] 消息类型: ${event.data.type}, 数据长度: ${event.data.data.length}`)

    try {
      const loadStartTime = performance.now()
      store.loadText(event.data.data)
      const loadTime = performance.now() - loadStartTime
      console.log(`[${new Date().toISOString()}] store.loadText 完成, 耗时 ${loadTime.toFixed(2)}ms`)

      // 加载成功后关闭加载状态
      isLoading.value = false

      const msgTime = performance.now() - msgStartTime
      console.log(`[${new Date().toISOString()}] ########## handleMessage 完成 ########## 总耗时 ${msgTime.toFixed(2)}ms`)
    } catch (err) {
      console.error(`[${new Date().toISOString()}] 解析文件失败:`, err)
      showError('无法解析文件内容: ' + (err as Error).message)
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

// 全局拖拽处理（列表页面也可拖拽文件）
function handleGlobalDragOver(event: DragEvent) {
  // 只在有文件被拖拽时才处理
  if (event.dataTransfer?.types.includes('Files')) {
    isDragging.value = true
  }
}

function handleGlobalDragLeave(event: DragEvent) {
  // 检查是否真的离开了 app 区域
  const target = event.target as HTMLElement
  if (target.id === 'app') {
    isDragging.value = false
  }
}

function handleGlobalDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    // 直接加载文件，不需要确认
    loadFile(files[0])
  }
}

async function loadFile(file: File) {
  const funcStartTime = performance.now()
  console.log(`[${new Date().toISOString()}] ########## loadFile 开始 ##########`)
  console.log(`[${new Date().toISOString()}] 文件名: ${file.name}, 大小: ${file.size} 字节`)

  try {
    const readStartTime = performance.now()
    const text = await file.text()
    const readTime = performance.now() - readStartTime
    console.log(`[${new Date().toISOString()}] 文件读取完成: ${text.length} 字符, 耗时 ${readTime.toFixed(2)}ms`)
    console.log(`[${new Date().toISOString()}] 文件前200字符: ${text.substring(0, 200)}`)

    const loadStartTime = performance.now()
    store.loadText(text)
    const loadTime = performance.now() - loadStartTime
    console.log(`[${new Date().toISOString()}] store.loadText 完成, 耗时 ${loadTime.toFixed(2)}ms`)

    // 更新 URL 显示文件名（方便浏览器历史记录）
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('file', file.name)
    newUrl.searchParams.set('size', file.size.toString())
    window.history.pushState({ file: file.name, size: file.size }, '', newUrl.toString())
    console.log(`[${new Date().toISOString()}] URL 已更新: ${newUrl.toString()}`)

    // 更新页面标题和当前文件信息
    currentFileName.value = file.name
    currentFileSize.value = file.size
    document.title = `${file.name} - JSONL Viewer`

    const funcTime = performance.now() - funcStartTime
    console.log(`[${new Date().toISOString()}] ########## loadFile 完成 ########## 总耗时 ${funcTime.toFixed(2)}ms`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 文件加载失败:`, err)
    showError('文件读取失败：' + (err as Error).message)
  }
}

function toggleTheme() {
  store.toggleTheme()
  applyTheme()
}

function toggleHelpDialog() {
  showHelpDialog.value = !showHelpDialog.value
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

// 主题相关函数
function selectThemeColor(themeId: string) {
  setThemeColor(themeId)
}

// 语言相关函数
function handleLanguageChange() {
  setLocale(currentLocale.value)
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

function toggleSettingsPanel() {
  showSettingsPanel.value = !showSettingsPanel.value
}

function handleMaxLinesChange() {
  store.setMaxDisplayLines(selectedMaxLines.value)

  // 保存到本地存储
  const settings = getSettings()
  settings.maxDisplayLines = selectedMaxLines.value
  saveSettings(settings)
}

function handleIndentSizeChange() {
  // 保存到本地存储
  const settings = getSettings()
  settings.indentSize = selectedIndentSize.value
  saveSettings(settings)

  // TODO: 将缩进字符数应用到 store 或 JSON 渲染
  console.log('缩进字符数已保存:', selectedIndentSize.value)
}

function handleFontFamilyChange() {
  // 保存到本地存储
  const settings = getSettings()
  settings.fontFamily = selectedFontFamily.value
  saveSettings(settings)

  // 应用字体到文档
  applyFontSettings()
}

function handleFontSizeChange() {
  // 保存到本地存储
  const settings = getSettings()
  settings.fontSize = selectedFontSize.value
  saveSettings(settings)

  // 应用字体到文档
  applyFontSettings()
}

// 应用字体设置到页面
function applyFontSettings() {
  document.documentElement.style.setProperty('--viewer-font-family', selectedFontFamily.value)
  document.documentElement.style.setProperty('--viewer-font-size', `${selectedFontSize.value}px`)
}
</script>

<style>
:root {
  --viewer-font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  --viewer-font-size: 13px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  font-size: 13px;
}

#app {
  min-height: 100vh;
  background: #fff;
  color: #333;
  transition: background 0.3s, color 0.3s;
  font-family: var(--viewer-font-family);
  font-size: var(--viewer-font-size);
}

#app.dark {
  background: #1e1e1e;
  color: #ddd;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-title-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.app-title {
  font-size: 20px;
  font-weight: 600;
}

.current-file-name {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.app-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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
  padding: 4px 10px;
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

/* 语言选择器 */
.language-selector {
  display: flex;
  align-items: center;
  position: relative;
}

.language-btn {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.language-menu {
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

.language-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.language-menu-item:last-child {
  border-bottom: none;
}

.language-menu-item:hover {
  background: #f5f5f5;
}

.language-menu-item.active {
  background: #f0f7ff;
}

.language-flag {
  font-size: 20px;
  line-height: 1;
}

.language-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.language-check {
  color: var(--theme-primary);
  font-size: 16px;
  font-weight: bold;
}

/* 设置选择器 */
.settings-selector {
  display: flex;
  align-items: center;
  position: relative;
}

.settings-btn {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
  border-radius: 6px 6px 0 0;
}

.settings-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.settings-close {
  background: none;
  border: none;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding: 2px 6px;
  line-height: 1;
  transition: color 0.2s;
}

.settings-close:hover {
  color: #666;
}

.settings-content {
  padding: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
  margin-right: 12px;
}

.setting-select {
  flex: 1;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.setting-select:focus {
  border-color: #4a90e2;
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

/* 暗色主题下的滚动按钮 - 使用当前主题颜色 */
#app.dark .scroll-btn {
  background: linear-gradient(135deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%);
  box-shadow: 0 4px 12px var(--theme-shadow-color);
}

#app.dark .scroll-btn:hover {
  box-shadow: 0 6px 16px color-mix(in srgb, var(--theme-shadow-color) 133%, transparent);
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

/* 暗色主题下的语言菜单 */
#app.dark .language-menu {
  background: #2a2a2a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

#app.dark .language-menu-item {
  color: #ddd;
  border-bottom-color: #3a3a3a;
}

#app.dark .language-menu-item:hover {
  background: #3a3a3a;
}

#app.dark .language-menu-item.active {
  background: #2a3a4a;
}

/* 暗色主题下的设置面板 */
#app.dark .settings-panel {
  background: #2a2a2a;
  border-color: #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

#app.dark .settings-header {
  background: #1e1e1e;
  border-bottom-color: #444;
}

#app.dark .settings-title {
  color: #999;
}

#app.dark .settings-close {
  color: #666;
}

#app.dark .settings-close:hover {
  color: #999;
}

#app.dark .setting-label {
  color: #999;
}

#app.dark .setting-select {
  background: #1e1e1e;
  border-color: #444;
  color: #ddd;
}

#app.dark .setting-select:focus {
  border-color: #4a90e2;
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

/* 后台加载进度条（底部悬浮，半透明） */
.loading-progress {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 998;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  animation: slideInUp 0.3s ease-out;
}

.loading-progress-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.loading-progress-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.loading-progress-count {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  font-family: monospace;
}

.loading-progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.loading-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 暗色主题下的进度条 */
#app.dark .loading-progress {
  background: rgba(42, 42, 42, 0.95);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.3);
}

#app.dark .loading-progress-text {
  color: #ddd;
}

#app.dark .loading-progress-count {
  color: #999;
}

#app.dark .loading-progress-bar {
  background: #444;
}

/* 滑入动画 */
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
/* 全局拖拽覆盖层（列表页面） */
.drag-overlay-global {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.drag-overlay-content {
  text-align: center;
  padding: 60px;
  border: 3px dashed var(--theme-primary);
  border-radius: 16px;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.drag-overlay-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 0.6s ease-in-out;
}

.drag-overlay-content h2 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.drag-overlay-content p {
  font-size: 16px;
  color: #666;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 暗色主题 */
#app.dark .drag-overlay-global {
  background: rgba(30, 30, 30, 0.95);
}

#app.dark .drag-overlay-content {
  background: #2a2a2a;
  border-color: var(--theme-primary);
}

#app.dark .drag-overlay-content h2 {
  color: #ddd;
}

#app.dark .drag-overlay-content p {
  color: #999;
}

/* 帮助对话框 */
.help-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

.help-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.help-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.help-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
}

.help-close:hover {
  color: #333;
}

.help-content {
  padding: 24px;
  overflow-y: auto;
}

.help-section {
  margin-bottom: 24px;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--theme-primary);
  font-weight: 600;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
  list-style: disc;
}

.help-section li {
  margin: 8px 0;
  color: #555;
  line-height: 1.6;
}

.help-section p {
  margin: 8px 0;
  color: #555;
  line-height: 1.6;
}

.help-section code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e91e63;
}

.help-section a {
  color: var(--theme-primary);
  text-decoration: none;
  font-weight: 500;
}

.help-section a:hover {
  text-decoration: underline;
}

.help-section .github-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  margin-top: 12px;
  background: var(--theme-primary);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s;
}

.help-section .github-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-decoration: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色主题 */
#app.dark .help-dialog {
  background: #2a2a2a;
}

#app.dark .help-header {
  border-bottom-color: #444;
}

#app.dark .help-header h2 {
  color: #ddd;
}

#app.dark .help-close {
  color: #999;
}

#app.dark .help-close:hover {
  color: #ddd;
}

#app.dark .help-section li,
#app.dark .help-section p {
  color: #bbb;
}

#app.dark .help-section code {
  background: #3a3a3a;
  color: #ff6b9d;
}

/* 设置对话框 */
.settings-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

.settings-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.settings-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.settings-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
}

.settings-close:hover {
  color: #333;
}

.settings-content {
  padding: 24px;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.setting-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.setting-option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.setting-option-card:hover {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 5%, transparent);
}

.setting-option-card.active {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
}

.option-icon {
  font-size: 32px;
  line-height: 1;
}

.theme-color-preview-large {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.option-name {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  text-align: center;
}

.option-check {
  position: absolute;
  top: 6px;
  right: 6px;
  color: var(--theme-primary);
  font-size: 18px;
  font-weight: bold;
}

.setting-toggle-group {
  display: flex;
  gap: 12px;
}

.setting-toggle-btn {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.setting-toggle-btn:hover {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 5%, transparent);
}

.setting-toggle-btn.active {
  border-color: var(--theme-primary);
  background: var(--theme-primary);
  color: white;
}

.setting-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.setting-select:hover {
  border-color: #ccc;
}

.setting-select:focus {
  border-color: var(--theme-primary);
}

/* 颜色选择器网格 */
.color-picker-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-option {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
  overflow: hidden;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.color-option.active {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.color-preview {
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.color-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* 暗色主题 - 设置对话框 */
#app.dark .settings-dialog {
  background: #2a2a2a;
}

#app.dark .settings-header {
  border-bottom-color: #444;
}

#app.dark .settings-header h2 {
  color: #ddd;
}

#app.dark .settings-close {
  color: #999;
}

#app.dark .settings-close:hover {
  color: #ddd;
}

#app.dark .setting-group-label {
  color: #ddd;
}

#app.dark .setting-option-card {
  border-color: #444;
  background: #1e1e1e;
}

#app.dark .setting-option-card:hover {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 10%, #1e1e1e);
}

#app.dark .setting-option-card.active {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 15%, #1e1e1e);
}

#app.dark .option-name {
  color: #bbb;
}

#app.dark .setting-toggle-btn {
  border-color: #444;
  background: #1e1e1e;
  color: #bbb;
}

#app.dark .setting-toggle-btn:hover {
  border-color: var(--theme-primary);
  background: color-mix(in srgb, var(--theme-primary) 10%, #1e1e1e);
}

#app.dark .setting-toggle-btn.active {
  border-color: var(--theme-primary);
  background: var(--theme-primary);
  color: white;
}

#app.dark .setting-select {
  border-color: #444;
  background: #1e1e1e;
  color: #ddd;
}

#app.dark .setting-select:hover {
  border-color: #555;
}

#app.dark .setting-select:focus {
  border-color: var(--theme-primary);
}

/* 暗色主题 - 颜色选择器 */
#app.dark .color-option.active {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

#app.dark .color-option:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
</style>
