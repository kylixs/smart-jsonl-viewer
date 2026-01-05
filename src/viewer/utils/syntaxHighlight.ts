/**
 * 语法高亮工具
 * 使用 highlight.js 实现
 */

import hljs from 'highlight.js/lib/core'

// 按需导入常用语言
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import sql from 'highlight.js/lib/languages/sql'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import swift from 'highlight.js/lib/languages/swift'
import kotlin from 'highlight.js/lib/languages/kotlin'
import markdown from 'highlight.js/lib/languages/markdown'
import plaintext from 'highlight.js/lib/languages/plaintext'

import type { LanguageType } from './codeDetector'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('plaintext', plaintext)

// 语言类型映射（将我们的类型映射到 highlight.js 的语言名称）
const languageMap: Record<LanguageType, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  bash: 'bash',
  json: 'json',
  yaml: 'yaml',
  html: 'xml',
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
  plaintext: 'plaintext',
}

/**
 * 根据语言类型高亮代码
 */
export function highlightCode(code: string, language: LanguageType): string {
  if (!code) return ''

  try {
    const hljsLanguage = languageMap[language] || 'plaintext'
    const result = hljs.highlight(code, { language: hljsLanguage })
    return result.value
  } catch (err) {
    console.error('Syntax highlighting error:', err)
    // 出错时返回转义后的纯文本
    return escapeHtml(code)
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
 * 使用 highlight.js 自动检测编程语言
 * @param code 代码文本
 * @returns 检测到的语言类型，如果无法识别则返回 'plaintext'
 */
export function autoDetectLanguage(code: string): LanguageType {
  if (!code || typeof code !== 'string') {
    return 'plaintext'
  }

  try {
    // 使用 highlight.js 的自动检测功能
    const result = hljs.highlightAuto(code)
    const detectedLang = result.language

    if (!detectedLang) {
      return 'plaintext'
    }

    // 将 highlight.js 的语言名称映射回我们的 LanguageType
    const reverseMap: Record<string, LanguageType> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'bash': 'bash',
      'shell': 'bash',
      'sh': 'bash',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'sql': 'sql',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'cpp',
      'csharp': 'csharp',
      'cs': 'csharp',
      'go': 'go',
      'golang': 'go',
      'rust': 'rust',
      'php': 'php',
      'ruby': 'ruby',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'markdown': 'markdown',
      'md': 'markdown',
      'plaintext': 'plaintext',
      'text': 'plaintext',
    }

    return reverseMap[detectedLang.toLowerCase()] || 'plaintext'
  } catch (err) {
    console.error('Language auto-detection error:', err)
    return 'plaintext'
  }
}
