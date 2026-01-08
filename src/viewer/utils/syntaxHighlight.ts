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

// 主题动态导入映射（按需加载）
const themeImports: Record<string, () => Promise<any>> = {
  'github-light': () => import('@shikijs/themes/github-light'),
  'github-dark': () => import('@shikijs/themes/github-dark'),
  'light-plus': () => import('@shikijs/themes/light-plus'),
  'dark-plus': () => import('@shikijs/themes/dark-plus'),
  'monokai': () => import('@shikijs/themes/monokai'),
  'dracula': () => import('@shikijs/themes/dracula'),
  'dracula-soft': () => import('@shikijs/themes/dracula-soft'),
  'nord': () => import('@shikijs/themes/nord'),
  'one-light': () => import('@shikijs/themes/one-light'),
  'one-dark-pro': () => import('@shikijs/themes/one-dark-pro'),
  'solarized-light': () => import('@shikijs/themes/solarized-light'),
  'solarized-dark': () => import('@shikijs/themes/solarized-dark'),
  'night-owl': () => import('@shikijs/themes/night-owl'),
  'night-owl-light': () => import('@shikijs/themes/min-light'),
}

// 语言类型映射（将我们的类型映射到 Shiki 的语言名称）
// 这个映射决定了哪些语言会被打包
const languageMap: Partial<Record<LanguageType, string>> = {
  plaintext: 'plaintext',
  // Web 开发
  javascript: 'javascript',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  vue: 'vue',
  jsx: 'jsx',
  tsx: 'tsx',
  // 后端语言
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  scala: 'scala',
  r: 'r',
  // 脚本语言
  bash: 'bash',
  powershell: 'powershell',
  perl: 'perl',
  lua: 'lua',
  // 数据格式
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
  toml: 'toml',
  ini: 'ini',
  // 数据库
  sql: 'sql',
  // 文档
  markdown: 'markdown',
  latex: 'latex',
  // 其他
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  graphql: 'graphql',
  proto: 'proto',
}

// 动态导入语言的映射（按需加载）
const languageImports: Partial<Record<string, () => Promise<any>>> = {
  javascript: () => import('@shikijs/langs/javascript'),
  typescript: () => import('@shikijs/langs/typescript'),
  html: () => import('@shikijs/langs/html'),
  css: () => import('@shikijs/langs/css'),
  scss: () => import('@shikijs/langs/scss'),
  less: () => import('@shikijs/langs/less'),
  vue: () => import('@shikijs/langs/vue'),
  jsx: () => import('@shikijs/langs/jsx'),
  tsx: () => import('@shikijs/langs/tsx'),
  python: () => import('@shikijs/langs/python'),
  java: () => import('@shikijs/langs/java'),
  cpp: () => import('@shikijs/langs/cpp'),
  c: () => import('@shikijs/langs/c'),
  csharp: () => import('@shikijs/langs/csharp'),
  go: () => import('@shikijs/langs/go'),
  rust: () => import('@shikijs/langs/rust'),
  php: () => import('@shikijs/langs/php'),
  ruby: () => import('@shikijs/langs/ruby'),
  swift: () => import('@shikijs/langs/swift'),
  kotlin: () => import('@shikijs/langs/kotlin'),
  scala: () => import('@shikijs/langs/scala'),
  r: () => import('@shikijs/langs/r'),
  bash: () => import('@shikijs/langs/bash'),
  powershell: () => import('@shikijs/langs/powershell'),
  perl: () => import('@shikijs/langs/perl'),
  lua: () => import('@shikijs/langs/lua'),
  json: () => import('@shikijs/langs/json'),
  yaml: () => import('@shikijs/langs/yaml'),
  xml: () => import('@shikijs/langs/xml'),
  toml: () => import('@shikijs/langs/toml'),
  ini: () => import('@shikijs/langs/ini'),
  sql: () => import('@shikijs/langs/sql'),
  markdown: () => import('@shikijs/langs/markdown'),
  latex: () => import('@shikijs/langs/latex'),
  dockerfile: () => import('@shikijs/langs/dockerfile'),
  makefile: () => import('@shikijs/langs/makefile'),
  graphql: () => import('@shikijs/langs/graphql'),
  proto: () => import('@shikijs/langs/proto'),
}

/**
 * 初始化 Shiki 高亮器（仅加载默认主题和最常用的语言）
 * 其他主题和语言按需动态加载
 */
async function getHighlighterInstance(): Promise<HighlighterCore> {
  if (!highlighterInstance) {
    // 仅预加载最常用的语言（减少初始 bundle 体积）
    highlighterInstance = await createHighlighterCore({
      themes: [
        import('@shikijs/themes/github-light'),
        import('@shikijs/themes/github-dark'),
      ],
      langs: [
        // 仅预加载这4个最常用的语言
        import('@shikijs/langs/javascript'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/python'),
        import('@shikijs/langs/json'),
      ],
      engine: createOnigurumaEngine(import('shiki/wasm'))
    })

    // 标记已加载
    loadedThemes.add('github-light')
    loadedThemes.add('github-dark')
    loadedLangs.add('javascript')
    loadedLangs.add('typescript')
    loadedLangs.add('python')
    loadedLangs.add('json')
  }
  return highlighterInstance
}

/**
 * 动态加载语言（按需加载）
 */
async function ensureLangLoaded(lang: string): Promise<void> {
  if (loadedLangs.has(lang)) {
    return
  }

  const importFunc = languageImports[lang]
  if (!importFunc) {
    console.warn(`语言 ${lang} 没有配置导入函数，使用 javascript 作为后备`)
    return
  }

  try {
    const highlighter = await getHighlighterInstance()
    const langModule = await importFunc()
    await highlighter.loadLanguage(langModule.default)
    loadedLangs.add(lang)
    console.log(`✅ 动态加载语言: ${lang}`)
  } catch (error) {
    console.error(`❌ 加载语言 ${lang} 失败:`, error)
  }
}

/**
 * 动态加载主题（按需加载）
 */
async function ensureThemeLoaded(theme: string): Promise<void> {
  if (loadedThemes.has(theme)) {
    return
  }

  const importFunc = themeImports[theme]
  if (!importFunc) {
    console.warn(`主题 ${theme} 没有配置导入函数`)
    return
  }

  try {
    const highlighter = await getHighlighterInstance()
    const themeModule = await importFunc()
    await highlighter.loadTheme(themeModule.default)
    loadedThemes.add(theme)
    console.log(`✅ 动态加载主题: ${theme}`)
  } catch (error) {
    console.error(`❌ 加载主题 ${theme} 失败:`, error)
  }
}

/**
 * 设置当前主题（并动态加载）
 */
export async function setTheme(
  lightTheme: string,
  darkTheme: string,
  mode: 'auto' | 'light' | 'dark' = 'auto'
) {
  currentLightTheme = lightTheme
  currentDarkTheme = darkTheme
  currentMode = mode

  // 动态加载主题（如果尚未加载）
  await Promise.all([
    ensureThemeLoaded(lightTheme),
    ensureThemeLoaded(darkTheme)
  ])
}

/**
 * 根据语言类型高亮代码（异步）
 * 按需动态加载所需的语言
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

    // 动态加载语言（如果尚未加载）
    if (!loadedLangs.has(shikiLang)) {
      await ensureLangLoaded(shikiLang)

      // 如果加载失败，使用 javascript 作为后备
      if (!loadedLangs.has(shikiLang)) {
        console.warn(`语言 ${shikiLang} 加载失败，使用 javascript 作为后备`)
        shikiLang = 'javascript'
      }
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

    // 动态加载主题（如果尚未加载）
    if (!loadedThemes.has(theme)) {
      await ensureThemeLoaded(theme)

      // 如果加载失败，使用默认主题
      if (!loadedThemes.has(theme)) {
        console.warn(`主题 ${theme} 加载失败，使用默认主题`)
        theme = isDark ? 'github-dark' : 'github-light'
      }
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
