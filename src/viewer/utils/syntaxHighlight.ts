/**
 * 语法高亮工具
 * 使用 Shiki 实现 - VS Code 同款高亮引擎
 * 优化策略：按需加载主题和语言，提升初始加载速度
 */

import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki'
import type { LanguageType } from './codeDetector'

// Shiki 高亮器实例（单例）
let highlighterInstance: Highlighter | null = null
let currentLightTheme: BundledTheme = 'github-light'
let currentDarkTheme: BundledTheme = 'github-dark'
let currentMode: 'auto' | 'light' | 'dark' = 'auto'

// 已加载的主题集合
const loadedThemes = new Set<BundledTheme>()
// 已加载的语言集合
const loadedLangs = new Set<BundledLanguage>()

// 语言类型映射（将我们的类型映射到 Shiki 的语言名称）
const languageMap: Partial<Record<LanguageType, BundledLanguage>> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  bash: 'bash',
  json: 'json',
  yaml: 'yaml',
  html: 'html',
  css: 'css',
  sql: 'sql',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  xml: 'xml',
  markdown: 'markdown',
}

/**
 * 初始化 Shiki 高亮器（仅加载默认主题和语言）
 * 其他主题和语言按需加载
 */
async function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterInstance) {
    // 仅加载默认主题，大幅提升初始化速度
    highlighterInstance = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: ['javascript'], // 仅加载最常用的语言
    })

    // 标记已加载
    loadedThemes.add('github-light')
    loadedThemes.add('github-dark')
    loadedLangs.add('javascript')
  }
  return highlighterInstance
}

/**
 * 确保主题已加载
 */
async function ensureThemeLoaded(theme: BundledTheme): Promise<void> {
  if (loadedThemes.has(theme)) {
    return
  }

  const highlighter = await getHighlighterInstance()
  await highlighter.loadTheme(theme)
  loadedThemes.add(theme)
}

/**
 * 确保语言已加载
 */
async function ensureLangLoaded(lang: BundledLanguage): Promise<void> {
  if (loadedLangs.has(lang)) {
    return
  }

  const highlighter = await getHighlighterInstance()
  await highlighter.loadLanguage(lang)
  loadedLangs.add(lang)
}

/**
 * 设置当前主题（并预加载）
 */
export async function setTheme(
  lightTheme: BundledTheme,
  darkTheme: BundledTheme,
  mode: 'auto' | 'light' | 'dark' = 'auto'
) {
  currentLightTheme = lightTheme
  currentDarkTheme = darkTheme
  currentMode = mode

  // 预加载新主题
  await ensureThemeLoaded(lightTheme)
  await ensureThemeLoaded(darkTheme)
}

/**
 * 根据语言类型高亮代码（异步）
 * 按需加载所需的主题和语言
 */
export async function highlightCode(
  code: string,
  language: LanguageType,
  isDark: boolean = false
): Promise<string> {
  if (!code) return ''

  try {
    const highlighter = await getHighlighterInstance()
    const shikiLang = languageMap[language] || 'javascript'

    // 根据 mode 决定使用哪个主题
    let theme: BundledTheme
    if (currentMode === 'light') {
      theme = currentLightTheme
    } else if (currentMode === 'dark') {
      theme = currentDarkTheme
    } else {
      // auto 模式：根据系统暗色模式自动切换
      theme = isDark ? currentDarkTheme : currentLightTheme
    }

    // 确保主题和语言已加载
    await ensureThemeLoaded(theme)
    await ensureLangLoaded(shikiLang)

    const html = highlighter.codeToHtml(code, {
      lang: shikiLang,
      theme: theme,
      transformers: [
        {
          name: 'line-numbers',
          line(node, line) {
            // 为每一行添加 data-line 属性，用于 CSS 显示行号
            node.properties['data-line'] = line
            return node
          }
        }
      ]
    })

    return html
  } catch (err) {
    console.error('Shiki highlighting error:', err)
    // 出错时返回转义后的纯文本
    return `<pre><code>${escapeHtml(code)}</code></pre>`
  }
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 自动检测编程语言
 * Shiki 没有内置自动检测，这里提供一个简单实现
 */
export function autoDetectLanguage(code: string): LanguageType {
  if (!code || typeof code !== 'string') {
    return 'plaintext'
  }

  const trimmed = code.trim()

  // JavaScript/TypeScript 特征
  if (/^(import|export|const|let|var|function|class|interface|type)\s/.test(trimmed)) {
    if (/:\s*\w+(\[\])?(\s*[=|]|;)/.test(trimmed) || /interface\s+\w+/.test(trimmed)) {
      return 'typescript'
    }
    return 'javascript'
  }

  // Python 特征
  if (/^(def|class|import|from)\s/.test(trimmed) || /^\s*#\s*!\/usr\/bin\/(python|env python)/.test(trimmed)) {
    return 'python'
  }

  // JSON 特征
  if (/^\s*[\{\[]/.test(trimmed) && /[\}\]]\s*$/.test(trimmed)) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // 不是有效 JSON
    }
  }

  // HTML/XML 特征
  if (/^<[!?]?[a-zA-Z]/.test(trimmed) && /<\/[a-zA-Z]/.test(trimmed)) {
    return 'html'
  }

  // Bash 特征
  if (/^#!\/bin\/(ba)?sh/.test(trimmed) || /^\s*(echo|cd|ls|grep|awk|sed)\s/.test(trimmed)) {
    return 'bash'
  }

  // CSS 特征
  if (/\{[^}]*:[^}]*\}/.test(trimmed) && /[\.#][\w-]+\s*\{/.test(trimmed)) {
    return 'css'
  }

  // SQL 特征
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/i.test(trimmed)) {
    return 'sql'
  }

  // YAML 特征
  if (/^[\w-]+:\s/.test(trimmed) && !/[{}]/.test(trimmed)) {
    return 'yaml'
  }

  return 'plaintext'
}
