/**
 * 简单的语法高亮工具
 * 基于正则表达式的轻量级实现
 */

import type { LanguageType } from './codeDetector'

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
 * 高亮 JavaScript/TypeScript
 */
function highlightJavaScript(code: string): string {
  let html = escapeHtml(code)

  // 注释
  html = html.replace(/\/\/.*/g, '<span class="comment">$&</span>')
  html = html.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')

  // 字符串
  html = html.replace(/"(?:[^"\\]|\\.)*"/g, '<span class="string">$&</span>')
  html = html.replace(/'(?:[^'\\]|\\.)*'/g, '<span class="string">$&</span>')
  html = html.replace(/`(?:[^`\\]|\\.)*`/g, '<span class="string">$&</span>')

  // 关键字
  const keywords = 'const|let|var|function|class|interface|type|enum|extends|implements|import|export|from|as|async|await|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|this|super|static|public|private|protected|readonly|typeof|instanceof'
  html = html.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="keyword">$1</span>')

  // 数字
  html = html.replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')

  // 函数调用
  html = html.replace(/\b([a-zA-Z_$][\w$]*)\s*\(/g, '<span class="function">$1</span>(')

  return html
}

/**
 * 高亮 Python
 */
function highlightPython(code: string): string {
  let html = escapeHtml(code)

  // 注释
  html = html.replace(/#.*/g, '<span class="comment">$&</span>')

  // 字符串
  html = html.replace(/"""[\s\S]*?"""/g, '<span class="string">$&</span>')
  html = html.replace(/'''[\s\S]*?'''/g, '<span class="string">$&</span>')
  html = html.replace(/"(?:[^"\\]|\\.)*"/g, '<span class="string">$&</span>')
  html = html.replace(/'(?:[^'\\]|\\.)*'/g, '<span class="string">$&</span>')

  // 关键字
  const keywords = 'def|class|import|from|as|return|if|elif|else|for|while|break|continue|try|except|finally|raise|with|lambda|yield|async|await|pass|None|True|False|and|or|not|in|is|del|global|nonlocal'
  html = html.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="keyword">$1</span>')

  // 装饰器
  html = html.replace(/@\w+/g, '<span class="decorator">$&</span>')

  // 数字
  html = html.replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')

  // 函数调用
  html = html.replace(/\b([a-zA-Z_][\w]*)\s*\(/g, '<span class="function">$1</span>(')

  return html
}

/**
 * 高亮 Bash/Shell
 */
function highlightBash(code: string): string {
  let html = escapeHtml(code)

  // 注释
  html = html.replace(/#.*/g, '<span class="comment">$&</span>')

  // 字符串
  html = html.replace(/"(?:[^"\\]|\\.)*"/g, '<span class="string">$&</span>')
  html = html.replace(/'(?:[^'\\]|\\.)*'/g, '<span class="string">$&</span>')

  // 关键字
  const keywords = 'if|then|else|elif|fi|for|do|done|while|until|case|esac|function|return|exit|break|continue|local|declare|export|readonly'
  html = html.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="keyword">$1</span>')

  // 变量
  html = html.replace(/\$\{?[a-zA-Z_][\w]*\}?/g, '<span class="variable">$&</span>')
  html = html.replace(/\$[0-9@#?*!]/g, '<span class="variable">$&</span>')

  // 数字
  html = html.replace(/\b\d+\b/g, '<span class="number">$&</span>')

  return html
}

/**
 * 高亮 JSON
 */
function highlightJSON(code: string): string {
  let html = escapeHtml(code)

  // 字符串键
  html = html.replace(/"([^"]+)"\s*:/g, '<span class="property">"$1"</span>:')

  // 字符串值
  html = html.replace(/:\s*"([^"]*)"/g, ': <span class="string">"$1"</span>')

  // 数字
  html = html.replace(/:\s*(-?\d+(\.\d+)?([eE][+-]?\d+)?)/g, ': <span class="number">$1</span>')

  // 布尔值和 null
  html = html.replace(/:\s*(true|false|null)\b/g, ': <span class="keyword">$1</span>')

  return html
}

/**
 * 高亮 HTML
 */
function highlightHTML(code: string): string {
  let html = escapeHtml(code)

  // 注释
  html = html.replace(/&lt;!--[\s\S]*?--&gt;/g, '<span class="comment">$&</span>')

  // 标签
  html = html.replace(/&lt;\/?([\w-]+)/g, '<span class="tag">&lt;$1</span>')
  html = html.replace(/\/&gt;|&gt;/g, '<span class="tag">$&</span>')

  // 属性
  html = html.replace(/\s([\w-]+)=/g, ' <span class="attribute">$1</span>=')

  // 属性值
  html = html.replace(/="([^"]*)"/g, '=<span class="string">"$1"</span>')
  html = html.replace(/='([^']*)'/g, "=<span class=\"string\">'$1'</span>")

  return html
}

/**
 * 高亮 CSS
 */
function highlightCSS(code: string): string {
  let html = escapeHtml(code)

  // 注释
  html = html.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')

  // 选择器
  html = html.replace(/^([^\{]+)\{/gm, '<span class="selector">$1</span>{')

  // 属性
  html = html.replace(/\b([\w-]+)\s*:/g, '<span class="property">$1</span>:')

  // ���符串
  html = html.replace(/"(?:[^"\\]|\\.)*"/g, '<span class="string">$&</span>')
  html = html.replace(/'(?:[^'\\]|\\.)*'/g, '<span class="string">$&</span>')

  // 数字和单位
  html = html.replace(/\b\d+(\.\d+)?(px|em|rem|%|vh|vw|deg)?\b/g, '<span class="number">$&</span>')

  // 颜色
  html = html.replace(/#[0-9a-fA-F]{3,6}\b/g, '<span class="number">$&</span>')

  return html
}

/**
 * 基础高亮（用于不支持的语言）
 */
function highlightBasic(code: string): string {
  let html = escapeHtml(code)

  // 字符串
  html = html.replace(/"(?:[^"\\]|\\.)*"/g, '<span class="string">$&</span>')
  html = html.replace(/'(?:[^'\\]|\\.)*'/g, '<span class="string">$&</span>')

  // 数字
  html = html.replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')

  return html
}

/**
 * 根据语言类型高亮代码
 */
export function highlightCode(code: string, language: LanguageType): string {
  if (!code) return ''

  switch (language) {
    case 'javascript':
    case 'typescript':
      return highlightJavaScript(code)

    case 'python':
      return highlightPython(code)

    case 'bash':
      return highlightBash(code)

    case 'json':
      return highlightJSON(code)

    case 'html':
    case 'xml':
      return highlightHTML(code)

    case 'css':
      return highlightCSS(code)

    case 'java':
    case 'cpp':
    case 'csharp':
    case 'go':
    case 'rust':
    case 'php':
    case 'ruby':
    case 'swift':
    case 'kotlin':
      // 使用 JavaScript 高亮器作为基础（关键字会不同但结构类似）
      return highlightJavaScript(code)

    case 'sql':
    case 'yaml':
    case 'markdown':
    case 'plaintext':
    default:
      return highlightBasic(code)
  }
}
