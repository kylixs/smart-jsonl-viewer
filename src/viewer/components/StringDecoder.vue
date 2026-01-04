<template>
  <span class="string-decoder">
    <span v-if="!decodable" :class="`value-${valueType}`">{{ displayValue }}</span>
    <template v-else>
      <div class="decoder-container">
        <div class="decoder-content">
          <span v-if="displayMode === 'original'" class="value-string">
            "{{ value }}"
          </span>
          <span v-else class="decoded-value">
            <span v-if="decodedType === 'json'" class="decoded-json">
              <JsonTree :data="decodedData" :depth="0" />
            </span>
            <span v-else class="value-string multiline">
              <AnsiText :text="displayedValue" />
              <span v-if="isTruncated" class="truncate-hint" @click="showModal = true">（已省略 {{ totalLines - store.maxDisplayLines }} 行）</span>
            </span>
          </span>
        </div>
        <div class="decoder-actions">
          <button
            v-if="displayMode === 'decoded' && (isTruncated || decodedType === 'json')"
            class="action-btn"
            @click="showModal = true"
            title="查看完整内容"
          >
            🔍
          </button>
          <button class="action-btn" @click="toggleMode" :title="toggleTitle">
            {{ displayMode === 'original' ? '🔄' : '↩️' }}
          </button>
          <button
            v-if="displayMode === 'decoded'"
            class="action-btn"
            @click="copyDecodedContent"
            :title="copySuccess ? '已复制!' : copyError || '复制解码内容'"
            :class="{ error: copyError }"
          >
            {{ copySuccess ? '✓' : copyError ? '✗' : '📋' }}
          </button>
        </div>
      </div>
    </template>
  </span>

  <!-- 弹窗 -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>解码内容</h3>

          <!-- Tab 切换栏 - 放在标题右侧 -->
          <div v-if="(isMarkdownContent || isCodeContent) && decodedType === 'string'" class="modal-tabs">
            <button
              class="modal-tab"
              :class="{ active: modalViewMode === 'raw' }"
              @click="modalViewMode = 'raw'"
            >
              原始内容
            </button>
            <button
              v-if="isCodeContent"
              class="modal-tab"
              :class="{ active: modalViewMode === 'code' }"
              @click="modalViewMode = 'code'"
            >
              代码高亮
            </button>
            <button
              v-if="isMarkdownContent"
              class="modal-tab"
              :class="{ active: modalViewMode === 'markdown' }"
              @click="modalViewMode = 'markdown'"
            >
              Markdown 预览
            </button>
          </div>

          <!-- 语言选择器（仅代码视图显示） -->
          <select
            v-if="isCodeContent && modalViewMode === 'code'"
            v-model="selectedLanguage"
            class="language-selector"
            title="选择编程语言"
          >
            <option v-for="lang in SUPPORTED_LANGUAGES" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </option>
          </select>

          <button class="modal-close" @click="showModal = false">✕</button>
        </div>

        <div class="modal-body">
          <!-- JSON 类型内容 -->
          <div v-if="decodedType === 'json'" class="modal-json">
            <JsonTree :data="decodedData" :depth="0" />
          </div>

          <!-- 字符串类型内容 -->
          <template v-else>
            <!-- 原始内容视图 -->
            <pre v-if="modalViewMode === 'raw'" class="modal-text"><AnsiText :text="decodedValue" /></pre>

            <!-- 代码高亮视图 -->
            <pre v-else-if="modalViewMode === 'code'" class="code-highlight" v-html="highlightedCode"></pre>

            <!-- Markdown 预览视图 -->
            <div v-else-if="modalViewMode === 'markdown'" class="markdown-container">
              <!-- 目录导航 -->
              <aside v-if="shouldShowToc && showToc" class="markdown-toc">
                <div class="toc-header">
                  <span class="toc-title">目录</span>
                  <button class="toc-toggle" @click="showToc = false" title="隐藏目录">✕</button>
                </div>
                <nav class="toc-nav">
                  <a
                    v-for="item in markdownToc"
                    :key="item.id"
                    :class="['toc-link', `toc-level-${item.level}`]"
                    @click.prevent="scrollToHeading(item.id)"
                    :href="`#${item.id}`"
                  >
                    {{ item.text }}
                  </a>
                </nav>
              </aside>

              <!-- 显示目录按钮（当目录隐藏时） -->
              <button
                v-if="shouldShowToc && !showToc"
                class="toc-show-btn"
                @click="showToc = true"
                title="显示目录"
              >
                📑
              </button>

              <!-- Markdown 内容 -->
              <div class="markdown-preview" :class="{ 'with-toc': shouldShowToc && showToc }" v-html="markdownHtml"></div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import JsonTree from './JsonTree.vue'
import AnsiText from './AnsiText.vue'
import { smartDecode, isDecodable as checkDecodable } from '../utils/decoder'
import { stripAnsi } from '../utils/ansi'
import { useJsonlStore } from '../stores/jsonlStore'
import { copyToClipboard } from '../utils/clipboard'
import { isMarkdown, renderMarkdown, generateToc } from '../utils/markdown'
import { isCode, detectLanguage, SUPPORTED_LANGUAGES, type LanguageType } from '../utils/codeDetector'
import { highlightCode } from '../utils/syntaxHighlight'

interface Props {
  value: any
  nodeKey?: string
}

const props = defineProps<Props>()
const store = useJsonlStore()

const displayMode = ref<'original' | 'decoded'>('decoded')
const copySuccess = ref(false)
const copyError = ref('')
const showModal = ref(false)
const modalViewMode = ref<'raw' | 'markdown' | 'code'>('raw')
const showToc = ref(true)
const selectedLanguage = ref<LanguageType>('plaintext')

// 值类型
const valueType = computed(() => {
  if (props.value === null) return 'null'
  if (typeof props.value === 'boolean') return 'boolean'
  if (typeof props.value === 'number') return 'number'
  if (typeof props.value === 'string') return 'string'
  return 'unknown'
})

// 显示值
const displayValue = computed(() => {
  if (props.value === null) return 'null'
  if (typeof props.value === 'boolean') return String(props.value)
  if (typeof props.value === 'number') return String(props.value)
  if (typeof props.value === 'string') return `"${props.value}"`
  return String(props.value)
})

// 是否可解码
const decodable = computed(() => {
  return checkDecodable(props.value)
})

// 解码结果
const decoded = computed(() => {
  if (!decodable.value) return null
  return smartDecode(props.value)
})

// 解码后的类型
const decodedType = computed(() => {
  if (!decoded.value) return null
  return decoded.value.type
})

// 解码后的值
const decodedValue = computed(() => {
  if (!decoded.value) return ''

  if (decoded.value.type === 'string') {
    return decoded.value.displayValue || decoded.value.value
  }

  if (decoded.value.type === 'json') {
    return decoded.value.original
  }

  return String(decoded.value.value)
})

// 是否需要截断显示
const isTruncated = computed(() => {
  if (decodedType.value === 'json') return false
  if (store.maxDisplayLines === -1) return false

  const lines = decodedValue.value.split('\n')
  return lines.length > store.maxDisplayLines
})

// 显示的值（可能被截断）
const displayedValue = computed(() => {
  if (!isTruncated.value) return decodedValue.value

  const lines = decodedValue.value.split('\n')
  const truncatedLines = lines.slice(0, store.maxDisplayLines)
  return truncatedLines.join('\n') + '\n...'
})

// 总行数
const totalLines = computed(() => {
  return decodedValue.value.split('\n').length
})

// 解码后的数据（用于 JSON 类型）
const decodedData = computed(() => {
  if (!decoded.value || decoded.value.type !== 'json') return null

  // 递归获取最终解码的数据
  let current: any = decoded.value
  while (current && current.type === 'json') {
    current = current.decoded
  }

  if (current.type === 'primitive') {
    return current.value
  }

  return null
})

// 切换按钮提示
const toggleTitle = computed(() => {
  return displayMode.value === 'original' ? '显示解码后的内容' : '显示原始内容'
})

// 检测解码后的内容是否为 Markdown
const isMarkdownContent = computed(() => {
  if (decodedType.value !== 'string') return false
  return isMarkdown(decodedValue.value)
})

// 检测解码后的内容是否为代码
const isCodeContent = computed(() => {
  if (decodedType.value !== 'string') return false
  return isCode(decodedValue.value)
})

// 渲染后的 Markdown HTML
const markdownHtml = computed(() => {
  if (!isMarkdownContent.value) return ''
  return renderMarkdown(decodedValue.value)
})

// 渲染后的代码 HTML（语法高亮）
const highlightedCode = computed(() => {
  if (!isCodeContent.value) return escapeHtml(decodedValue.value)
  return highlightCode(decodedValue.value, selectedLanguage.value)
})

// 辅助函数：转义 HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 生成 Markdown 目录
const markdownToc = computed(() => {
  if (!isMarkdownContent.value) return []
  return generateToc(decodedValue.value)
})

// 是否显示目录（至少有 2 个标题才显示）
const shouldShowToc = computed(() => {
  return markdownToc.value.length >= 2
})

// 弹窗打开时重置视图模式并自动检测内容类型
watch(showModal, (isOpen) => {
  if (isOpen) {
    showToc.value = true

    // 自动选择合适的视图模式
    if (isCodeContent.value) {
      modalViewMode.value = 'code'
      // 自动检测编程语言
      selectedLanguage.value = detectLanguage(decodedValue.value)
    } else if (isMarkdownContent.value) {
      modalViewMode.value = 'markdown'
    } else {
      modalViewMode.value = 'raw'
    }
  }
})

// 跳转到指定标题
function scrollToHeading(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function toggleMode() {
  displayMode.value = displayMode.value === 'original' ? 'decoded' : 'original'
}

async function copyDecodedContent() {
  let textToCopy = ''

  if (decodedType.value === 'json') {
    // JSON 类型，复制格式化的 JSON
    textToCopy = JSON.stringify(decodedData.value, null, 2)
  } else {
    // 字符串类型，复制解码后的文本，移除 ANSI 代码
    textToCopy = stripAnsi(decodedValue.value)
  }

  try {
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

// ESC 键关闭弹窗
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && showModal.value) {
    showModal.value = false
  }
}

// 监听弹窗状态，添加/移除键盘事件监听
watch(showModal, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeyDown)
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.string-decoder {
  display: inline-block;
  width: 100%;
}

.decoder-container {
  display: inline-flex;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
}

.decoder-content {
  display: inline-flex;
  min-width: 0;
}

.decoder-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 0;
}

.action-btn {
  font-size: 14px;
  padding: 4px 6px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 32px;
  text-align: center;
}

.action-btn:hover {
  background: #e0e0e0;
}

.action-btn.error {
  background: #ffebee;
  border-color: #ef5350;
  color: #c62828;
}

.value-string {
  color: #ce9178;
}

.value-number {
  color: #b5cea8;
}

.value-boolean {
  color: #569cd6;
}

.value-null {
  color: #569cd6;
}

.value-unknown {
  color: #d4d4d4;
}

.decoded-value {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  background: #fff3cd;
  padding: 6px 8px;
  margin: 1px 0;
  border-radius: 3px;
}

.truncate-hint {
  color: #999;
  font-size: 12px;
  font-style: italic;
  margin-top: 4px;
  display: inline;
  cursor: pointer;
  text-decoration: underline;
}

.truncate-hint:hover {
  color: #666;
}

.decode-indicator {
  font-size: 12px;
  align-self: flex-start;
}

.multiline {
  white-space: pre-wrap;
  word-break: break-word;
  display: block;
  max-width: 90vw;
  overflow: hidden;
}

.decoded-json {
  display: block;
  border-left: 3px solid #ffc107;
  padding-left: 12px;
  margin-left: 4px;
  margin-top: 8px;
  max-width: 95%;
  overflow: hidden;
}

/* 暗色主题 */
:root.dark .value-string {
  color: #ce9178;
}

:root.dark .value-number {
  color: #b5cea8;
}

:root.dark .value-boolean {
  color: #569cd6;
}

:root.dark .value-null {
  color: #569cd6;
}

:root.dark .decoded-value {
  background: #3a3a2a;
}

:root.dark .action-btn {
  background: #333;
  border-color: #555;
  color: #ddd;
}

:root.dark .action-btn:hover {
  background: #444;
}

:root.dark .action-btn.error {
  background: #4a2626;
  border-color: #d32f2f;
  color: #ef5350;
}

:root.dark .decoded-json {
  border-left-color: #aa8800;
}

:root.dark .truncate-hint {
  color: #666;
}

:root.dark .truncate-hint:hover {
  color: #999;
}

/* 弹窗样式 */
.modal-overlay {
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
  padding: 0;
}

.modal-content {
  background: #fff;
  border-radius: 0;
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
  margin-left: auto;
}

.modal-close:hover {
  color: #666;
}

/* Tab 切换栏 - 放在 header 内 */
.modal-tabs {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.modal-tab {
  padding: 6px 16px;
  background: transparent;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
  white-space: nowrap;
}

.modal-tab:hover {
  color: #333;
  background: #f5f5f5;
  border-color: #999;
}

.modal-tab.active {
  color: #fff;
  background: #2472c8;
  border-color: #2472c8;
  font-weight: 500;
}

/* 语言选择器 */
.language-selector {
  padding: 6px 12px;
  font-size: 13px;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  outline: none;
  transition: all 0.2s;
}

.language-selector:hover {
  border-color: #999;
}

.language-selector:focus {
  border-color: #2472c8;
  box-shadow: 0 0 0 2px rgba(36, 114, 200, 0.1);
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 24px;
  position: relative;
}

.modal-json {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
}

.modal-text {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  color: #ce9178;
}

/* 代码高亮样式 */
.code-highlight {
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0;
  color: #24292f;
}

/* 代码高亮颜色主题 */
.code-highlight :deep(.keyword) {
  color: #d73a49;
  font-weight: 600;
}

.code-highlight :deep(.string) {
  color: #032f62;
}

.code-highlight :deep(.comment) {
  color: #6a737d;
  font-style: italic;
}

.code-highlight :deep(.number) {
  color: #005cc5;
}

.code-highlight :deep(.function) {
  color: #6f42c1;
  font-weight: 600;
}

.code-highlight :deep(.variable) {
  color: #e36209;
}

.code-highlight :deep(.property) {
  color: #005cc5;
}

.code-highlight :deep(.tag) {
  color: #22863a;
}

.code-highlight :deep(.attribute) {
  color: #6f42c1;
}

.code-highlight :deep(.selector) {
  color: #6f42c1;
  font-weight: 600;
}

.code-highlight :deep(.decorator) {
  color: #e36209;
  font-style: italic;
}

/* Markdown 容器 - 支持侧边目录布局 */
.markdown-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  min-height: 100%;
}

/* Markdown 目录导航 */
.markdown-toc {
  flex-shrink: 0;
  width: 240px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  position: sticky;
  top: 0;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  border: 1px solid #e0e0e0;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

.toc-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.toc-toggle {
  background: none;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.toc-toggle:hover {
  color: #666;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-link {
  display: block;
  padding: 6px 8px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
  line-height: 1.4;
}

.toc-link:hover {
  background: #e8e9eb;
  color: #333;
}

/* 不同层级的目录缩进 */
.toc-link.toc-level-1 {
  font-weight: 600;
  font-size: 14px;
}

.toc-link.toc-level-2 {
  padding-left: 16px;
}

.toc-link.toc-level-3 {
  padding-left: 24px;
  font-size: 12px;
}

.toc-link.toc-level-4 {
  padding-left: 32px;
  font-size: 12px;
}

.toc-link.toc-level-5 {
  padding-left: 40px;
  font-size: 11px;
}

.toc-link.toc-level-6 {
  padding-left: 48px;
  font-size: 11px;
}

/* 显示目录按钮 - 紧凑图标样式 */
.toc-show-btn {
  position: fixed;
  left: 24px;
  top: 24px;
  width: 40px;
  height: 40px;
  padding: 0;
  background: #2472c8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.toc-show-btn:hover {
  background: #1a5fb4;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Markdown 预览样式 */
.markdown-preview {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  flex: 1;
  min-width: 0;
  scroll-behavior: smooth;
}

/* 当有目录时，限制最大宽度 */
.markdown-preview.with-toc {
  max-width: 980px;
  margin: 0 auto;
}

/* 为标题添加滚动偏移，避免被遮挡 */
.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  scroll-margin-top: 20px;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: #1f2328;
}

.markdown-preview :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h3) {
  font-size: 1.25em;
}

.markdown-preview :deep(h4) {
  font-size: 1em;
}

.markdown-preview :deep(h5) {
  font-size: 0.875em;
}

.markdown-preview :deep(h6) {
  font-size: 0.85em;
  color: #656d76;
}

.markdown-preview :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-preview :deep(a) {
  color: #0969da;
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin-top: 0;
  margin-bottom: 16px;
  padding-left: 2em;
}

.markdown-preview :deep(li) {
  margin-bottom: 0.25em;
}

.markdown-preview :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.markdown-preview :deep(pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.markdown-preview :deep(pre code) {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  font-size: 100%;
}

.markdown-preview :deep(blockquote) {
  margin: 0 0 16px 0;
  padding: 0 1em;
  color: #656d76;
  border-left: 0.25em solid #d0d7de;
}

.markdown-preview :deep(hr) {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #d0d7de;
  border: 0;
}

.markdown-preview :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

.markdown-preview :deep(table th),
.markdown-preview :deep(table td) {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}

.markdown-preview :deep(table th) {
  font-weight: 600;
  background-color: #f6f8fa;
}

.markdown-preview :deep(table tr) {
  background-color: #ffffff;
  border-top: 1px solid #d0d7de;
}

.markdown-preview :deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.markdown-preview :deep(strong) {
  font-weight: 600;
}

.markdown-preview :deep(em) {
  font-style: italic;
}

.markdown-preview :deep(del) {
  text-decoration: line-through;
}

/* 弹窗暗色主题 */
:root.dark .modal-overlay {
  background: rgba(0, 0, 0, 0.85);
}

:root.dark .modal-content {
  background: #1e1e1e;
}

:root.dark .modal-header {
  border-bottom-color: #333;
}

:root.dark .modal-header h3 {
  color: #ddd;
}

:root.dark .modal-close {
  color: #666;
}

:root.dark .modal-close:hover {
  color: #999;
}

/* Tab 切换栏暗色主题 */
:root.dark .modal-tabs {
  /* 不需要额外背景，在 header 内 */
}

:root.dark .modal-tab {
  color: #999;
  border-color: #555;
}

:root.dark .modal-tab:hover {
  color: #ddd;
  background: #333;
  border-color: #777;
}

:root.dark .modal-tab.active {
  color: #fff;
  background: #569cd6;
  border-color: #569cd6;
}

:root.dark .modal-text {
  color: #ce9178;
}

/* 语言选择器暗色主题 */
:root.dark .language-selector {
  background: #333;
  border-color: #555;
  color: #ddd;
}

:root.dark .language-selector:hover {
  border-color: #777;
}

:root.dark .language-selector:focus {
  border-color: #569cd6;
  box-shadow: 0 0 0 2px rgba(86, 156, 214, 0.2);
}

/* 代码高亮暗色主题 */
:root.dark .code-highlight {
  background: #1e1e1e;
  color: #d4d4d4;
}

:root.dark .code-highlight :deep(.keyword) {
  color: #569cd6;
}

:root.dark .code-highlight :deep(.string) {
  color: #ce9178;
}

:root.dark .code-highlight :deep(.comment) {
  color: #6a9955;
}

:root.dark .code-highlight :deep(.number) {
  color: #b5cea8;
}

:root.dark .code-highlight :deep(.function) {
  color: #dcdcaa;
}

:root.dark .code-highlight :deep(.variable) {
  color: #9cdcfe;
}

:root.dark .code-highlight :deep(.property) {
  color: #9cdcfe;
}

:root.dark .code-highlight :deep(.tag) {
  color: #569cd6;
}

:root.dark .code-highlight :deep(.attribute) {
  color: #9cdcfe;
}

:root.dark .code-highlight :deep(.selector) {
  color: #d7ba7d;
}

:root.dark .code-highlight :deep(.decorator) {
  color: #dcdcaa;
}

/* 目录导航暗色主题 */
:root.dark .markdown-toc {
  background: #2a2a2a;
  border-color: #444;
}

:root.dark .toc-header {
  border-bottom-color: #444;
}

:root.dark .toc-title {
  color: #ddd;
}

:root.dark .toc-toggle {
  color: #666;
}

:root.dark .toc-toggle:hover {
  color: #999;
}

:root.dark .toc-link {
  color: #999;
}

:root.dark .toc-link:hover {
  background: #333;
  color: #ddd;
}

:root.dark .toc-show-btn {
  background: #569cd6;
}

:root.dark .toc-show-btn:hover {
  background: #4a8ec2;
}

/* Markdown 预览暗色主题 */
:root.dark .markdown-preview {
  color: #d4d4d4;
}

:root.dark .markdown-preview :deep(h1),
:root.dark .markdown-preview :deep(h2),
:root.dark .markdown-preview :deep(h3),
:root.dark .markdown-preview :deep(h4),
:root.dark .markdown-preview :deep(h5),
:root.dark .markdown-preview :deep(h6) {
  color: #ddd;
}

:root.dark .markdown-preview :deep(h1),
:root.dark .markdown-preview :deep(h2) {
  border-bottom-color: #444;
}

:root.dark .markdown-preview :deep(h6) {
  color: #999;
}

:root.dark .markdown-preview :deep(a) {
  color: #569cd6;
}

:root.dark .markdown-preview :deep(code) {
  background-color: rgba(110, 118, 129, 0.4);
  color: #ce9178;
}

:root.dark .markdown-preview :deep(pre) {
  background-color: #2a2a2a;
}

:root.dark .markdown-preview :deep(blockquote) {
  color: #999;
  border-left-color: #555;
}

:root.dark .markdown-preview :deep(hr) {
  background-color: #444;
}

:root.dark .markdown-preview :deep(table th),
:root.dark .markdown-preview :deep(table td) {
  border-color: #444;
}

:root.dark .markdown-preview :deep(table th) {
  background-color: #2a2a2a;
}

:root.dark .markdown-preview :deep(table tr) {
  background-color: #1e1e1e;
  border-top-color: #444;
}

:root.dark .markdown-preview :deep(table tr:nth-child(2n)) {
  background-color: #252525;
}
</style>
