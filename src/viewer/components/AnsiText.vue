<template>
  <span class="ansi-text">
    <span
      v-for="(segment, index) in segments"
      :key="index"
      :style="styleToCss(segment.style)"
      class="ansi-segment"
    >{{ segment.text }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseAnsiToSegments, styleToCss, hasAnsiCodes } from '../utils/ansi'

interface Props {
  text: string
}

const props = defineProps<Props>()

const segments = computed(() => {
  if (!props.text || !hasAnsiCodes(props.text)) {
    return [{ text: props.text || '', style: {} }]
  }
  return parseAnsiToSegments(props.text)
})
</script>

<style scoped>
.ansi-text {
  display: inline;
  white-space: pre-wrap;
  word-break: break-word;
}

.ansi-segment {
  display: inline;
}
</style>
