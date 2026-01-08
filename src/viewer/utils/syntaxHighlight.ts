/**
 * 语法高亮工具
 * 使用 Shiki 实现 - VS Code 同款高亮引擎
 * 优化策略：使用细粒度导入，仅打包需要的语言和主题，大幅减少 bundle 体积
 */

import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import type { LanguageType } from './codeDetector'

// Shiki 高亮器实例（单例）
let highlighterInstance: HighlighterCore | null = null
let currentLightTheme: string = 'github-light'
let currentDarkTheme: string = 'github-dark'
let currentMode: 'auto' | 'light' | 'dark' = 'auto'

// 已加载的主题集合
const loadedThemes = new Set<string>()
// 已加载的语言集合
const loadedLangs = new Set<string>()

// 语言类型映射（将我们的类型映射到 Shiki 的语言名称）
const languageMap: Partial<Record<LanguageType, string>> = {
  plaintext: 'plaintext',
  // Web 开发（常用，预加载）
  javascript: 'javascript',
  typescript: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  vue: 'vue',
  html: 'html',
  css: 'css',
  less: 'less',
  // 后端语言（常用，预加载）
  python: 'python',
  java: 'java',
  kotlin: 'kotlin',
  cpp: 'cpp',
  csharp: 'csharp',
  swift: 'swift',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  // Shell/Scripts
  bash: 'bash',
  powershell: 'powershell',
  // 数据格式（常用，预加载）
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
  proto: 'proto',
  // 其他常用
  sql: 'sql',
  markdown: 'markdown',
  dockerfile: 'dockerfile',
}

/**
 * 初始化 Shiki 高亮器
 * 预加载所有常用语言和主题，避免语法高亮失效
 */
async function getHighlighterInstance(): Promise<HighlighterCore> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighterCore({
      themes: [
        // 预加载所有主题（避免切换主题时失效）
        import('@shikijs/themes/github-light'),
        import('@shikijs/themes/github-dark'),
        import('@shikijs/themes/github-light-default'),
        import('@shikijs/themes/github-dark-default'),
        import('@shikijs/themes/github-dark-dimmed'),
        import('@shikijs/themes/light-plus'),
        import('@shikijs/themes/dark-plus'),
        import('@shikijs/themes/one-light'),
        import('@shikijs/themes/one-dark-pro'),
        import('@shikijs/themes/solarized-light'),
        import('@shikijs/themes/solarized-dark'),
        import('@shikijs/themes/vitesse-light'),
        import('@shikijs/themes/vitesse-dark'),
        import('@shikijs/themes/material-theme-lighter'),
        import('@shikijs/themes/material-theme-darker'),
        import('@shikijs/themes/nord'),
        import('@shikijs/themes/monokai'),
        import('@shikijs/themes/dracula'),
        import('@shikijs/themes/dracula-soft'),
        import('@shikijs/themes/tokyo-night'),
        import('@shikijs/themes/night-owl'),
      ],
      langs: [
        // 预加载所有常用语言（避免语法高亮失效）
        import('@shikijs/langs/javascript'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/jsx'),
        import('@shikijs/langs/tsx'),
        import('@shikijs/langs/vue'),
        import('@shikijs/langs/html'),
        import('@shikijs/langs/css'),
        import('@shikijs/langs/less'),
        import('@shikijs/langs/python'),
        import('@shikijs/langs/java'),
        import('@shikijs/langs/kotlin'),
        import('@shikijs/langs/cpp'),
        import('@shikijs/langs/csharp'),
        import('@shikijs/langs/swift'),
        import('@shikijs/langs/go'),
        import('@shikijs/langs/rust'),
        import('@shikijs/langs/php'),
        import('@shikijs/langs/ruby'),
        import('@shikijs/langs/bash'),
        import('@shikijs/langs/powershell'),
        import('@shikijs/langs/json'),
        import('@shikijs/langs/yaml'),
        import('@shikijs/langs/xml'),
        import('@shikijs/langs/proto'),
        import('@shikijs/langs/sql'),
        import('@shikijs/langs/markdown'),
        import('@shikijs/langs/dockerfile'),
      ],
      engine: createOnigurumaEngine(import('shiki/wasm'))
    })

    // 标记所有已加载的主题
    const themes = [
      'github-light', 'github-dark', 'github-light-default', 'github-dark-default',
      'github-dark-dimmed', 'light-plus', 'dark-plus', 'one-light', 'one-dark-pro',
      'solarized-light', 'solarized-dark', 'vitesse-light', 'vitesse-dark',
      'material-theme-lighter', 'material-theme-darker', 'nord', 'monokai',
      'dracula', 'dracula-soft', 'tokyo-night', 'night-owl'
    ]
    themes.forEach(theme => loadedThemes.add(theme))

    // 标记所有已加载的语言
    const langs = [
      'javascript', 'typescript', 'jsx', 'tsx', 'vue', 'html', 'css', 'less',
      'python', 'java', 'kotlin', 'cpp', 'csharp', 'swift', 'go', 'rust',
      'php', 'ruby', 'bash', 'powershell', 'json', 'yaml', 'xml', 'proto',
      'sql', 'markdown', 'dockerfile'
    ]
    langs.forEach(lang => loadedLangs.add(lang))
  }
  return highlighterInstance
}

/**
 * 设置当前主题
 */
export async function setTheme(
  lightTheme: string,
  darkTheme: string,
  mode: 'auto' | 'light' | 'dark' = 'auto'
) {
  currentLightTheme = lightTheme
  currentDarkTheme = darkTheme
  currentMode = mode
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
    let shikiLang = languageMap[language] || 'javascript'

    // 如果语言未预加载，使用 javascript 作为后备
    if (!loadedLangs.has(shikiLang)) {
      console.warn(`语言 ${shikiLang} 未预加载，使用 javascript 作为后备`)
      shikiLang = 'javascript'
    }

    // 根据 mode 决定使用哪个主题
    let theme: string
    if (currentMode === 'light') {
      theme = currentLightTheme
    } else if (currentMode === 'dark') {
      theme = currentDarkTheme
    } else {
      // auto 模式：根据系统暗色模式自动切换
      theme = isDark ? currentDarkTheme : currentLightTheme
    }

    // 如果主题未预加载，使用默认主题
    if (!loadedThemes.has(theme)) {
      console.warn(`主题 ${theme} 未预加载，使用默认主题`)
      theme = isDark ? 'github-dark' : 'github-light'
    }

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
