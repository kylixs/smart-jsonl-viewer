/**
 * ANSI 转义序列处理工具
 */

// ANSI 颜色映射
const ANSI_COLORS: Record<string, string> = {
  // 前景色 (30-37)
  '30': '#000000', // black
  '31': '#cd3131', // red
  '32': '#0dbc79', // green
  '33': '#e5e510', // yellow
  '34': '#2472c8', // blue
  '35': '#bc3fbc', // magenta
  '36': '#11a8cd', // cyan
  '37': '#e5e5e5', // white

  // 亮色前景 (90-97)
  '90': '#666666', // bright black (gray)
  '91': '#f14c4c', // bright red
  '92': '#23d18b', // bright green
  '93': '#f5f543', // bright yellow
  '94': '#3b8eea', // bright blue
  '95': '#d670d6', // bright magenta
  '96': '#29b8db', // bright cyan
  '97': '#ffffff', // bright white

  // 背景色 (40-47)
  '40': '#000000', // black bg
  '41': '#cd3131', // red bg
  '42': '#0dbc79', // green bg
  '43': '#e5e510', // yellow bg
  '44': '#2472c8', // blue bg
  '45': '#bc3fbc', // magenta bg
  '46': '#11a8cd', // cyan bg
  '47': '#e5e5e5', // white bg

  // 亮色背景 (100-107)
  '100': '#666666', // bright black bg
  '101': '#f14c4c', // bright red bg
  '102': '#23d18b', // bright green bg
  '103': '#f5f543', // bright yellow bg
  '104': '#3b8eea', // bright blue bg
  '105': '#d670d6', // bright magenta bg
  '106': '#29b8db', // bright cyan bg
  '107': '#ffffff', // bright white bg
}

interface AnsiStyle {
  color?: string
  backgroundColor?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

interface AnsiSegment {
  text: string
  style: AnsiStyle
}

/**
 * 移除 ANSI 转义序列
 */
export function stripAnsi(text: string): string {
  // 匹配 ANSI 转义序列: \x1b[...m 或 \x1b[...m 或 [...m
  return text.replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\[([0-9;]*)m/g, '')
}

/**
 * 解析 ANSI 代码并返回样式对象
 */
function parseAnsiCodes(codes: string[]): AnsiStyle {
  const style: AnsiStyle = {}

  for (const code of codes) {
    const num = parseInt(code, 10)

    if (num === 0) {
      // Reset all
      return {}
    } else if (num === 1) {
      style.bold = true
    } else if (num === 22) {
      style.bold = false
    } else if (num === 3) {
      style.italic = true
    } else if (num === 23) {
      style.italic = false
    } else if (num === 4) {
      style.underline = true
    } else if (num === 24) {
      style.underline = false
    } else if ((num >= 30 && num <= 37) || (num >= 90 && num <= 97)) {
      // 前景色
      style.color = ANSI_COLORS[code]
    } else if ((num >= 40 && num <= 47) || (num >= 100 && num <= 107)) {
      // 背景色
      style.backgroundColor = ANSI_COLORS[code]
    }
  }

  return style
}

/**
 * 将 ANSI 转义序列转换为样式化的 HTML 段落
 */
export function parseAnsiToSegments(text: string): AnsiSegment[] {
  const segments: AnsiSegment[] = []
  let currentStyle: AnsiStyle = {}

  // 匹配所有 ANSI 序列: \x1b[...m 或 [...m
  const ansiRegex = /(?:\x1b)?\[([0-9;]*)m/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = ansiRegex.exec(text)) !== null) {
    // 添加普通文本段
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index)
      if (plainText) {
        segments.push({
          text: plainText,
          style: { ...currentStyle }
        })
      }
    }

    // 解析 ANSI 代码并更新当前样式
    const codes = match[1] ? match[1].split(';') : ['0']
    const newStyle = parseAnsiCodes(codes)

    // 如果是 reset (0)，清空样式；否则合并样式
    if (codes.includes('0') || codes.includes('')) {
      currentStyle = { ...newStyle }
    } else {
      currentStyle = { ...currentStyle, ...newStyle }
    }

    lastIndex = ansiRegex.lastIndex
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    if (remainingText) {
      segments.push({
        text: remainingText,
        style: { ...currentStyle }
      })
    }
  }

  // 如果没有任何段落，返回原始文本
  if (segments.length === 0 && text) {
    segments.push({
      text,
      style: {}
    })
  }

  return segments
}

/**
 * 将样式对象转换为 CSS 字符串
 */
export function styleToCss(style: AnsiStyle): string {
  const css: string[] = []

  if (style.color) {
    css.push(`color: ${style.color}`)
  }

  if (style.backgroundColor) {
    css.push(`background-color: ${style.backgroundColor}`)
  }

  if (style.bold) {
    css.push('font-weight: bold')
  }

  if (style.italic) {
    css.push('font-style: italic')
  }

  if (style.underline) {
    css.push('text-decoration: underline')
  }

  return css.join('; ')
}

/**
 * 检测文本中是否包含 ANSI 转义序列
 */
export function hasAnsiCodes(text: string): boolean {
  return /(?:\x1b)?\[([0-9;]*)m/.test(text)
}
