<template>
  <div class="json-tree">
    <!-- 对象或数组 -->
    <div v-if="isObject || isArray" class="json-node" :style="{ paddingLeft: `${depth * 32}px` }">
      <span class="toggle-icon" @click="toggleExpand">
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span v-if="nodeKey" class="key">{{ nodeKey }}:</span>
      <span class="bracket">{{ openBracket }}</span>
      <span v-if="!isExpanded" class="collapsed-indicator">
        ... ({{ itemCount }} items)
      </span>
      <span v-if="!isExpanded" class="bracket">{{ closeBracket }}</span>
    </div>

    <!-- 展开状态：显示子节点 -->
    <template v-if="isExpanded && (isObject || isArray)">
      <JsonTree
        v-for="(child, index) in children"
        :key="index"
        :data="child.value"
        :node-key="child.key"
        :depth="depth + 1"
        :max-depth="maxDepth"
      />
      <div class="json-node closing-bracket" :style="{ paddingLeft: `${depth * 32}px` }">
        <span class="bracket">{{ closeBracket }}</span>
      </div>
    </template>

    <!-- 基本类型：字符串、数字、布尔值、null -->
    <div v-if="!isObject && !isArray" class="json-node primitive" :style="{ paddingLeft: `${depth * 32}px` }">
      <span v-if="nodeKey" class="key">{{ nodeKey }}:</span>
      <!-- 只有需要解码的字符串才使用 StringDecoder 组件 -->
      <StringDecoder v-if="needsDecoder" :value="data" :node-key="nodeKey" />
      <!-- 其他类型直接显示 -->
      <span v-else :class="`value-${valueType}`">{{ displayValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import StringDecoder from './StringDecoder.vue'
import { isDecodable } from '../utils/decoder'

interface Props {
  data: any
  nodeKey?: string
  depth?: number
  maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
  nodeKey: '',
  depth: 0,
  maxDepth: -1
})

// 根据最大深度决定初始展开状态
const isExpanded = ref(
  props.maxDepth === -1 ? true : props.depth < props.maxDepth
)

// 监听maxDepth变化，更新展开状态
watch(() => props.maxDepth, (newMaxDepth) => {
  isExpanded.value = newMaxDepth === -1 ? true : props.depth < newMaxDepth
})

const isObject = computed(() => {
  return props.data !== null && typeof props.data === 'object' && !Array.isArray(props.data)
})

const isArray = computed(() => {
  return Array.isArray(props.data)
})

const openBracket = computed(() => {
  return isArray.value ? '[' : '{'
})

const closeBracket = computed(() => {
  return isArray.value ? ']' : '}'
})

const itemCount = computed(() => {
  if (isArray.value) {
    return props.data.length
  }
  if (isObject.value) {
    return Object.keys(props.data).length
  }
  return 0
})

const children = computed(() => {
  if (isArray.value) {
    return props.data.map((item: any, index: number) => ({
      key: String(index),
      value: item
    }))
  }
  if (isObject.value) {
    return Object.entries(props.data).map(([key, value]) => ({
      key,
      value
    }))
  }
  return []
})

// 是否需要 StringDecoder 组件（仅对可解码的字符串使用）
const needsDecoder = computed(() => {
  return isDecodable(props.data)
})

// 值类型（用于不需要解码的值）
const valueType = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'boolean') return 'boolean'
  if (typeof props.data === 'number') return 'number'
  if (typeof props.data === 'string') return 'string'
  return 'unknown'
})

// 显示值（用于不需要解码的值）
const displayValue = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'boolean') return String(props.data)
  if (typeof props.data === 'number') return String(props.data)
  if (typeof props.data === 'string') return `"${props.data}"`
  return String(props.data)
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.json-tree {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.json-node {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-height: 24px;
}

.json-node.closing-bracket {
  color: #888;
}

.toggle-icon {
  cursor: pointer;
  user-select: none;
  width: 16px;
  text-align: center;
  color: #666;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toggle-icon:hover {
  color: #333;
}

.key {
  color: #9cdcfe;
  font-weight: 500;
  margin-right: 4px;
}

.bracket {
  color: #d4d4d4;
  font-weight: bold;
}

.collapsed-indicator {
  color: #888;
  font-style: italic;
  font-size: 12px;
  margin: 0 4px;
}

/* 基本类型值样式 */
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

/* 暗色主题 */
:root.dark .toggle-icon {
  color: #999;
}

:root.dark .toggle-icon:hover {
  color: #ccc;
}

:root.dark .key {
  color: #9cdcfe;
}

:root.dark .bracket {
  color: #d4d4d4;
}

:root.dark .collapsed-indicator {
  color: #666;
}

:root.dark .json-node.closing-bracket {
  color: #666;
}

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

:root.dark .value-unknown {
  color: #d4d4d4;
}
</style>
