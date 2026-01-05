/**
 * 语法高亮工具
 * 使用 Shiki 实现 - VS Code 同款高亮引擎
 */

import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki'
import type { LanguageType } from './codeDetector'

// Shiki 高亮器实例（单例）
let highlighterInstance: Highlighter | null = null
let currentTheme: BundledTheme = 'github-light'
let currentDarkTheme: BundledTheme = 'github-dark'

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
 * 初始化或获取 Shiki 高亮器实例
 */
async function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: [
        'github-light',
        'github-dark',
        'github-dark-dimmed',
        'vitesse-light',
        'vitesse-dark',
        'material-theme-lighter',
        'material-theme-darker',
        'nord',
        'monokai',
        'dracula'
      ],
      langs: [
        'javascript',
        'typescript',
        'python',
        'bash',
        'json',
        'yaml',
        'html',
        'css',
        'sql',
        'java',
        'cpp',
        'csharp',
        'go',
        'rust',
        'php',
        'ruby',
        'swift',
        'kotlin',
        'xml',
        'markdown'
      ],
    })
  }
  return highlighterInstance
}

/**
 * 设置当前主题
 */
export function setTheme(lightTheme: BundledTheme, darkTheme: BundledTheme) {
  currentTheme = lightTheme
  currentDarkTheme = darkTheme
}

/**
 * 根据语言类型高亮代码（异步）
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
    const theme = isDark ? currentDarkTheme : currentTheme

    const html = highlighter.codeToHtml(code, {
      lang: shikiLang,
      theme: theme,
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
