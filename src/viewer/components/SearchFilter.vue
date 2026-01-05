<template>
  <div class="search-filter">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="输入关键字搜索..."
        @input="handleSearch"
        @focus="showHistoryDropdown = true"
        @blur="handleInputBlur"
        @keydown.down.prevent="navigateHistory(1)"
        @keydown.up.prevent="navigateHistory(-1)"
        @keydown.enter="selectCurrentHistory"
      />
      <button v-if="keyword" class="clear-btn" @click="clearSearch" title="清空">
        ✕
      </button>
      <!-- 搜索历史下拉列表 -->
      <div v-if="showHistoryDropdown && searchHistory.length > 0" class="history-dropdown">
        <div class="history-header">
          <span class="history-title">搜索历史</span>
          <button class="history-clear-all" @mousedown.prevent="clearAllHistory" title="清空历史">
            清空
          </button>
        </div>
        <div
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          :class="{ active: index === selectedHistoryIndex }"
          @mousedown.prevent="selectHistory(item)"
        >
          <span class="history-text">{{ item }}</span>
          <button class="history-delete" @mousedown.prevent.stop="deleteHistoryItem(item)" title="删除">
            ✕
          </button>
        </div>
      </div>
    </div>

    <div class="filter-options">
      <div class="option-group">
        <label class="option-label">过滤范围:</label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              value="line"
              v-model="mode"
              @change="handleModeChange"
            />
            <span>按行</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              value="node"
              v-model="mode"
              @change="handleModeChange"
            />
            <span>按节点</span>
          </label>
        </div>
      </div>

      <div class="option-group">
        <label class="option-label">匹配模式:</label>
        <div class="radio-group">
          <label class="radio-label" title="忽略大小写，包含即匹配">
            <input
              type="radio"
              value="fuzzy"
              v-model="searchMode"
              @change="handleSearchModeChange"
            />
            <span>模糊</span>
          </label>
          <label class="radio-label" title="忽略大小写，完整单词匹配">
            <input
              type="radio"
              value="exact"
              v-model="searchMode"
              @change="handleSearchModeChange"
            />
            <span>完全</span>
          </label>
          <label class="radio-label" title="使用 JSONPath 表达式">
            <input
              type="radio"
              value="jsonpath"
              v-model="searchMode"
              @change="handleSearchModeChange"
            />
            <span>JSONPath</span>
          </label>
        </div>
      </div>

      <label class="checkbox-label" v-if="searchMode !== 'jsonpath'">
        <input
          type="checkbox"
          v-model="searchDecoded"
          @change="handleSearchDecodedChange"
        />
        <span>解码内容</span>
      </label>

      <div class="depth-control">
        <label class="depth-label">展开深度:</label>
        <select v-model="selectedDepth" @change="handleDepthChange" class="depth-select">
          <option :value="-1">全部展开</option>
          <option :value="0">全部折叠</option>
          <option :value="1">展开1层</option>
          <option :value="2">展开2层</option>
          <option :value="3">展开3层</option>
          <option :value="4">展开4层</option>
          <option :value="5">展开5层</option>
        </select>
      </div>

      <div class="depth-control">
        <label class="depth-label">显示行数:</label>
        <select v-model="selectedMaxLines" @change="handleMaxLinesChange" class="depth-select">
          <option :value="-1">不限制</option>
          <option :value="5">5行</option>
          <option :value="10">10行</option>
          <option :value="20">20行</option>
          <option :value="30">30行</option>
          <option :value="50">50行</option>
          <option :value="100">100行</option>
        </select>
      </div>
    </div>

    <div v-if="searchMode === 'jsonpath'" class="jsonpath-hint">
      <span class="hint-icon">💡</span>
      <span class="hint-text">
        示例:
        <code @click="fillExample('$.user.name')">$.user.name</code>,
        <code @click="fillExample('$.data[0]')">$.data[0]</code>,
        <code @click="fillExample('$.items[*]')">$.items[*]</code>,
        <code @click="fillExample('$..content')">$..content</code>
      </span>
    </div>

    <div v-if="store.hasSearch" class="search-stats">
      显示 <strong>{{ store.filteredCount }}</strong> / {{ store.totalLines }} 行
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { FilterMode, SearchMode } from '../utils/types'
import { useJsonlStore } from '../stores/jsonlStore'
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  removeSearchHistoryItem
} from '../utils/searchHistory'

const store = useJsonlStore()

const keyword = ref('')
const mode = ref<FilterMode>('line')
const searchMode = ref<SearchMode>('fuzzy')
const searchDecoded = ref(true)
const selectedDepth = ref(-1)
const selectedMaxLines = ref(10)
const showHistoryDropdown = ref(false)
const selectedHistoryIndex = ref(-1)

// 根据当前搜索模式获取历史记录
const searchHistory = computed(() => {
  return getSearchHistory(searchMode.value)
})

onMounted(() => {
  // 从 store 初始化
  keyword.value = store.searchKeyword
  mode.value = store.filterMode
  searchMode.value = store.searchMode
  searchDecoded.value = store.searchDecoded
  selectedDepth.value = store.expandDepth
  selectedMaxLines.value = store.maxDisplayLines
})

// 监听搜索模式变化，重置历史下拉状态
watch(searchMode, () => {
  selectedHistoryIndex.value = -1
})

function handleSearch() {
  const trimmedKeyword = keyword.value.trim()
  store.setSearchKeyword(trimmedKeyword)

  // 保存到历史记录（只有非空时）
  if (trimmedKeyword) {
    addSearchHistory(searchMode.value, trimmedKeyword)
    showHistoryDropdown.value = false
  }
}

function handleInputBlur() {
  // 延迟关闭，以便点击事件能够触发
  setTimeout(() => {
    showHistoryDropdown.value = false
    selectedHistoryIndex.value = -1
  }, 200)
}

function selectHistory(item: string) {
  keyword.value = item
  store.setSearchKeyword(item)
  showHistoryDropdown.value = false
  selectedHistoryIndex.value = -1
}

function deleteHistoryItem(item: string) {
  removeSearchHistoryItem(searchMode.value, item)
  // 强制刷新历史列表
  selectedHistoryIndex.value = -1
}

function clearAllHistory() {
  clearSearchHistory(searchMode.value)
  showHistoryDropdown.value = false
  selectedHistoryIndex.value = -1
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
    selectHistory(searchHistory.value[selectedHistoryIndex.value])
  } else {
    handleSearch()
  }
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

function handleMaxLinesChange() {
  store.setMaxDisplayLines(selectedMaxLines.value)
}

function fillExample(example: string) {
  keyword.value = example
  store.setSearchKeyword(example)
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

.history-text {
  flex: 1;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  margin-left: auto;
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
