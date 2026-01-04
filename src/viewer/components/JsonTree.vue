<template>
  <div class="json-tree" :style="{ paddingLeft: `${depth * 20}px` }">
    <div v-if="isObject || isArray" class="json-node">
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
      <div class="json-node" :style="{ paddingLeft: `${depth * 20}px` }">
        <span class="bracket">{{ closeBracket }}</span>
      </div>
    </template>

    <!-- 基本类型：字符串、数字、布尔值、null -->
    <div v-if="!isObject && !isArray" class="json-node primitive">
      <span v-if="nodeKey" class="key">{{ nodeKey }}:</span>
      <StringDecoder :value="data" :node-key="nodeKey" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import StringDecoder from './StringDecoder.vue'

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
}

.json-node.primitive {
  padding-left: 20px;
}

.toggle-icon {
  cursor: pointer;
  user-select: none;
  width: 16px;
  text-align: center;
  color: #666;
  transition: color 0.2s;
}

.toggle-icon:hover {
  color: #333;
}

.key {
  color: #9cdcfe;
  font-weight: 500;
}

.bracket {
  color: #d4d4d4;
  font-weight: bold;
}

.collapsed-indicator {
  color: #888;
  font-style: italic;
  font-size: 12px;
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
</style>
