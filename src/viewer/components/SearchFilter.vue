<template>
  <div class="search-filter">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        :placeholder="t('search.placeholder')"
        @input="handleSearch"
        @focus="showHistoryDropdown = true"
        @blur="handleInputBlur"
        @keydown.down.prevent="navigateHistory(1)"
        @keydown.up.prevent="navigateHistory(-1)"
        @keydown.enter="selectCurrentHistory"
      />
      <button v-if="keyword" class="clear-btn" @click="clearSearch" :title="t('search.clear')">
        ✕
      </button>
      <button
        v-if="!keyword && searchHistory.length > 0"
        class="history-arrow-btn"
        @mousedown.prevent="toggleHistoryDropdown"
        :title="t('search.viewHistory')"
      >
        ▼
      </button>
      <!-- 搜索历史下拉列表 -->
      <div v-if="showHistoryDropdown && searchHistory.length > 0" class="history-dropdown">
        <div class="history-header">
          <span class="history-title">{{ t('search.history') }}</span>
          <button class="history-clear-all" @mousedown.prevent="clearAllHistory" :title="t('search.clearHistory')">
            {{ t('search.clear') }}
          </button>
        </div>
        <div
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          :class="{ active: index === selectedHistoryIndex }"
          @mousedown.prevent="selectHistory(item)"
        >
          <div class="history-item-content">
            <div class="history-tags">
              <span class="history-tag search-mode">{{ getSearchModeLabel(item.searchMode) }}</span>
              <span class="history-tag filter-mode">{{ getFilterModeLabel(item.filterMode) }}</span>
            </div>
            <span class="history-text">{{ item.keyword }}</span>
          </div>
          <button class="history-delete" @mousedown.prevent.stop="deleteHistoryItem(item)" :title="t('search.delete')">
            ✕
          </button>
        </div>
      </div>
    </div>

    <div class="filter-options">
      <div class="option-group">
        <label class="option-label">{{ t('search.filterScope') }}:</label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              value="line"
              v-model="mode"
              @change="handleModeChange"
            />
            <span>{{ t('search.filterByLine') }}</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              value="node"
              v-model="mode"
              @change="handleModeChange"
            />
            <span>{{ t('search.filterByNode') }}</span>
          </label>
        </div>
      </div>

      <div class="option-group">
        <label class="option-label">{{ t('search.matchMode') }}:</label>
        <div class="radio-group">
          <label class="radio-label" :title="t('search.fuzzyHint')">
            <input
              type="radio"
              value="fuzzy"
              v-model="searchMode"
              @change="handleSearchModeChange"
            />
            <span>{{ t('search.fuzzy') }}</span>
          </label>
          <label class="radio-label" :title="t('search.exactHint')">
            <input
              type="radio"
              value="exact"
              v-model="searchMode"
              @change="handleSearchModeChange"
            />
            <span>{{ t('search.exact') }}</span>
          </label>
          <label class="radio-label" :title="t('search.jsonpathHint')">
            <input
              type="radio"
              value="jsonpath"
              v-model="searchMode"
              @change="handleSearchModeChange"
            />
            <span>{{ t('search.jsonpathLabel') }}</span>
          </label>
        </div>
      </div>

      <label class="checkbox-label" v-if="searchMode !== 'jsonpath'">
        <input
          type="checkbox"
          v-model="searchDecoded"
          @change="handleSearchDecodedChange"
        />
        <span>{{ t('search.searchDecoded') }}</span>
      </label>

      <div class="depth-control">
        <label class="depth-label">{{ t('search.expandDepth') }}:</label>
        <select v-model="selectedDepth" @change="handleDepthChange" class="depth-select">
          <option :value="-1">{{ t('search.expandAll') }}</option>
          <option :value="0">{{ t('search.collapseAll') }}</option>
          <option :value="1">{{ t('search.expandLevel', { level: 1 }) }}</option>
          <option :value="2">{{ t('search.expandLevel', { level: 2 }) }}</option>
          <option :value="3">{{ t('search.expandLevel', { level: 3 }) }}</option>
          <option :value="4">{{ t('search.expandLevel', { level: 4 }) }}</option>
          <option :value="5">{{ t('search.expandLevel', { level: 5 }) }}</option>
        </select>
      </div>
    </div>

    <div v-if="searchMode === 'jsonpath'" class="jsonpath-hint">
      <span class="hint-icon">💡</span>
      <span class="hint-text">
        {{ t('search.jsonpathExamples') }}:
        <code @click="fillExample('$.user.name')">$.user.name</code>,
        <code @click="fillExample('$.data[0]')">$.data[0]</code>,
        <code @click="fillExample('$.items[*]')">$.items[*]</code>,
        <code @click="fillExample('$..content')">$..content</code>
      </span>
    </div>

    <div v-if="store.hasSearch" class="search-stats">
      {{ t('search.statsDisplay') }} <strong>{{ store.filteredCount }}</strong> {{ t('search.statsOf') }} {{ store.totalLines }} {{ t('search.statsLines') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FilterMode, SearchMode } from '../utils/types'
import { useJsonlStore } from '../stores/jsonlStore'
import {
  type SearchHistoryItem,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  removeSearchHistoryItem
} from '../utils/searchHistory'

const { t } = useI18n()
const store = useJsonlStore()

const keyword = ref('')
const mode = ref<FilterMode>('line')
const searchMode = ref<SearchMode>('fuzzy')
const searchDecoded = ref(true)
const selectedDepth = ref(-1)
const showHistoryDropdown = ref(false)
const selectedHistoryIndex = ref(-1)
const historyVersion = ref(0) // 用于触发历史列表更新

// 搜索防抖定时器
const searchDebounceTimer = ref<number>()

// 获取所有搜索历史（不再按模式过滤）
const searchHistory = computed<SearchHistoryItem[]>(() => {
  // 访问 historyVersion 以建立响应式依赖
  historyVersion.value
  return getSearchHistory()
})

// 获取搜索模式的标签文本
function getSearchModeLabel(mode: SearchMode): string {
  const labels = {
    'fuzzy': t('search.fuzzy'),
    'exact': t('search.exact'),
    'jsonpath': t('search.jsonpathLabel')
  }
  return labels[mode] || mode
}

// 获取过滤范围的标签文本
function getFilterModeLabel(mode: FilterMode): string {
  const labels = {
    'line': t('search.filterByLine'),
    'node': t('search.filterByNode')
  }
  return labels[mode] || mode
}

onMounted(() => {
  // 从 store 初始化
  keyword.value = store.searchKeyword
  mode.value = store.filterMode
  searchMode.value = store.searchMode
  searchDecoded.value = store.searchDecoded
  selectedDepth.value = store.expandDepth
})

// 监听搜索模式变化，重置历史下拉状态
watch(searchMode, () => {
  selectedHistoryIndex.value = -1
})

function handleSearch() {
  const inputStartTime = performance.now()
  console.log(`[${new Date().toISOString()}] ===== handleSearch 触发 =====`)
  console.log(`[${new Date().toISOString()}] 当前输入: "${keyword.value}"`)

  // 清除之前的防抖定时器
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  const trimmedKeyword = keyword.value.trim()

  // 如果是清空搜索，立即执行
  if (!trimmedKeyword) {
    console.log(`[${new Date().toISOString()}] 清空搜索，立即执行`)
    const searchStartTime = performance.now()
    store.setSearchKeyword('')
    const searchTime = performance.now() - searchStartTime
    console.log(`[${new Date().toISOString()}] 搜索完成, 耗时 ${searchTime.toFixed(2)}ms`)
    return
  }

  // 有内容时使用防抖，500ms 后执行
  console.log(`[${new Date().toISOString()}] 设置防抖定时器 (500ms)`)
  searchDebounceTimer.value = window.setTimeout(() => {
    const debounceStartTime = performance.now()
    console.log(`[${new Date().toISOString()}] ===== 防抖触发，开始搜索 =====`)
    console.log(`[${new Date().toISOString()}] 搜索关键字: "${trimmedKeyword}"`)

    const searchStartTime = performance.now()
    store.setSearchKeyword(trimmedKeyword)
    const searchTime = performance.now() - searchStartTime
    console.log(`[${new Date().toISOString()}] store.setSearchKeyword 完成, 耗时 ${searchTime.toFixed(2)}ms`)

    const totalDebounceTime = performance.now() - debounceStartTime
    console.log(`[${new Date().toISOString()}] ===== 搜索流程完成 ===== 总耗时 ${totalDebounceTime.toFixed(2)}ms`)
  }, 500)

  const inputTime = performance.now() - inputStartTime
  console.log(`[${new Date().toISOString()}] handleSearch 完成, 耗时 ${inputTime.toFixed(2)}ms`)
}

function handleInputBlur() {
  // 失去焦点时，保存当前有效的搜索词到历史
  const trimmedKeyword = keyword.value.trim()
  if (trimmedKeyword) {
    addSearchHistory(trimmedKeyword, searchMode.value, mode.value)
    historyVersion.value++ // 触发历史列表更新
  }

  // 延迟关闭，以便点击事件能够触发
  setTimeout(() => {
    showHistoryDropdown.value = false
    selectedHistoryIndex.value = -1
  }, 200)
}

function selectHistory(item: SearchHistoryItem) {
  keyword.value = item.keyword
  // 同时恢复当时的搜索模式和过滤范围
  searchMode.value = item.searchMode
  mode.value = item.filterMode
  // 更新 store
  store.setSearchKeyword(item.keyword)
  store.setSearchMode(item.searchMode)
  store.setFilterMode(item.filterMode)
  showHistoryDropdown.value = false
  selectedHistoryIndex.value = -1
  // 选择历史项时已经是完整的搜索词，无需再次保存
}

function deleteHistoryItem(item: SearchHistoryItem) {
  removeSearchHistoryItem(item)
  // 强制刷新历史列表
  selectedHistoryIndex.value = -1
  historyVersion.value++ // 触发历史列表更新
}

function clearAllHistory() {
  clearSearchHistory()
  showHistoryDropdown.value = false
  selectedHistoryIndex.value = -1
  historyVersion.value++ // 触发历史列表更新
}

function navigateHistory(direction: number) {
  if (searchHistory.value.length === 0) return

  const newIndex = selectedHistoryIndex.value + direction
  if (newIndex >= -1 && newIndex < searchHistory.value.length) {
    selectedHistoryIndex.value = newIndex
  }
}

function selectCurrentHistory() {
  if (selectedHistoryIndex.value >= 0 && selectedHistoryIndex.value < searchHistory.value.length) {
    // 选择了历史项，直接使用不需要再保存
    selectHistory(searchHistory.value[selectedHistoryIndex.value])
  } else {
    // 按 Enter，触发待保存逻辑（通过 handleSearch 已经设置）
    // 不需要额外操作，handleSearch 已经处理了
  }
}

function toggleHistoryDropdown() {
  showHistoryDropdown.value = !showHistoryDropdown.value
}

function handleModeChange() {
  store.setFilterMode(mode.value)
}

function handleSearchModeChange() {
  store.setSearchMode(searchMode.value)
}

function handleSearchDecodedChange() {
  store.toggleSearchDecoded()
}

function clearSearch() {
  keyword.value = ''
  store.setSearchKeyword('')
}

function handleDepthChange() {
  store.setExpandDepth(selectedDepth.value)
}

function fillExample(example: string) {
  keyword.value = example
  // 直接设置值不会触发 @input 事件，需要手动调用
  handleSearch()
}
</script>

<style scoped>
.search-filter {
  padding: 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  flex: 1;
  padding: 10px 40px 10px 40px;
  font-size: 14px;
  border: 2px solid #ddd;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.search-input:focus {
  border-color: #4a90e2;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #666;
}

/* 历史下拉箭头按钮 */
.history-arrow-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: all 0.2s;
}

.history-arrow-btn:hover {
  color: #666;
  transform: translateY(1px);
}

/* 搜索历史下拉列表 */
.history-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
  border-radius: 6px 6px 0 0;
}

.history-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.history-clear-all {
  background: none;
  border: none;
  font-size: 11px;
  color: #999;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.2s;
}

.history-clear-all:hover {
  background: #e0e0e0;
  color: #666;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover,
.history-item.active {
  background: #f5f5f5;
}

.history-item-content {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.history-tags {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.history-tag {
  display: inline-block;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.history-tag.search-mode {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.history-tag.filter-mode {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.history-text {
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.history-delete {
  background: none;
  border: none;
  font-size: 14px;
  color: #ccc;
  cursor: pointer;
  padding: 2px 6px;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
  margin-left: 8px;
}

.history-delete:hover {
  color: #f44336;
}

.filter-options {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-label,
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  user-select: none;
}

.radio-label input[type='radio'],
.checkbox-label input[type='checkbox'] {
  cursor: pointer;
}

.radio-label:hover,
.checkbox-label:hover {
  color: #333;
}

.depth-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.depth-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
}

.depth-select {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.depth-select:focus {
  border-color: #4a90e2;
}

.search-stats {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.search-stats strong {
  color: #4a90e2;
  font-weight: 600;
}

.jsonpath-hint {
  margin-top: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-icon {
  font-size: 14px;
}

.hint-text {
  color: #1976d2;
}

.hint-text code {
  background: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 11px;
  color: #d32f2f;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.hint-text code:hover {
  background: #ffebee;
  border-color: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hint-text code:active {
  transform: translateY(0);
  box-shadow: none;
}

/* 暗色主题 */
:root.dark .search-filter {
  background: #252525;
  border-bottom-color: #333;
}

:root.dark .search-input {
  background: #1e1e1e;
  border-color: #444;
  color: #ddd;
}

:root.dark .search-input:focus {
  border-color: #4a90e2;
}

:root.dark .search-input::placeholder {
  color: #666;
}

:root.dark .clear-btn {
  color: #666;
}

:root.dark .clear-btn:hover {
  color: #999;
}

/* 历史下拉箭头按钮暗色主题 */
:root.dark .history-arrow-btn {
  color: #666;
}

:root.dark .history-arrow-btn:hover {
  color: #999;
}

/* 搜索历史下拉列表暗色主题 */
:root.dark .history-dropdown {
  background: #2a2a2a;
  border-color: #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

:root.dark .history-header {
  background: #1e1e1e;
  border-bottom-color: #444;
}

:root.dark .history-title {
  color: #999;
}

:root.dark .history-clear-all {
  color: #666;
}

:root.dark .history-clear-all:hover {
  background: #333;
  color: #999;
}

:root.dark .history-item {
  border-bottom-color: #333;
}

:root.dark .history-item:hover,
:root.dark .history-item.active {
  background: #333;
}

:root.dark .history-text {
  color: #ddd;
}

:root.dark .history-tag.search-mode {
  background: #1e3a5f;
  color: #90caf9;
  border-color: #2b5a8a;
}

:root.dark .history-tag.filter-mode {
  background: #3a2a4a;
  color: #ce93d8;
  border-color: #5a3a6a;
}

:root.dark .history-delete {
  color: #555;
}

:root.dark .history-delete:hover {
  color: #ff6b6b;
}

:root.dark .radio-label,
:root.dark .checkbox-label {
  color: #aaa;
}

:root.dark .radio-label:hover,
:root.dark .checkbox-label:hover {
  color: #ddd;
}

:root.dark .search-stats {
  background: #1e1e1e;
  border-color: #333;
  color: #999;
}

:root.dark .search-stats strong {
  color: #6ab0f3;
}

:root.dark .option-label {
  color: #999;
}

:root.dark .jsonpath-hint {
  background: #1e3a5f;
  border-left-color: #42a5f5;
}

:root.dark .hint-text {
  color: #90caf9;
}

:root.dark .hint-text code {
  background: #2a2a2a;
  color: #ff6b6b;
  border: 1px solid transparent;
}

:root.dark .hint-text code:hover {
  background: #3a2a2a;
  border-color: #ff6b6b;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

:root.dark .hint-text code:active {
  transform: translateY(0);
  box-shadow: none;
}

:root.dark .depth-label {
  color: #999;
}

:root.dark .depth-select {
  background: #1e1e1e;
  border-color: #444;
  color: #ddd;
}

:root.dark .depth-select:focus {
  border-color: #4a90e2;
}
</style>
