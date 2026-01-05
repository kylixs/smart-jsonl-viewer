/**
 * 代码检测和语言识别工具
 */

/**
 * 支持的编程语言
 */
export const SUPPORTED_LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text', extensions: ['.txt'] },
  { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx', '.mjs'] },
  { value: 'typescript', label: 'TypeScript', extensions: ['.ts', '.tsx'] },
  { value: 'python', label: 'Python', extensions: ['.py'] },
  { value: 'bash', label: 'Bash/Shell', extensions: ['.sh', '.bash'] },
  { value: 'json', label: 'JSON', extensions: ['.json'] },
  { value: 'yaml', label: 'YAML', extensions: ['.yml', '.yaml'] },
  { value: 'html', label: 'HTML', extensions: ['.html', '.htm'] },
  { value: 'css', label: 'CSS', extensions: ['.css'] },
  { value: 'sql', label: 'SQL', extensions: ['.sql'] },
  { value: 'java', label: 'Java', extensions: ['.java'] },
  { value: 'cpp', label: 'C/C++', extensions: ['.c', '.cpp', '.h', '.hpp'] },
  { value: 'csharp', label: 'C#', extensions: ['.cs'] },
  { value: 'go', label: 'Go', extensions: ['.go'] },
  { value: 'rust', label: 'Rust', extensions: ['.rs'] },
  { value: 'php', label: 'PHP', extensions: ['.php'] },
  { value: 'ruby', label: 'Ruby', extensions: ['.rb'] },
  { value: 'swift', label: 'Swift', extensions: ['.swift'] },
  { value: 'kotlin', label: 'Kotlin', extensions: ['.kt'] },
  { value: 'xml', label: 'XML', extensions: ['.xml'] },
  { value: 'markdown', label: 'Markdown', extensions: ['.md'] },
] as const

export type LanguageType = typeof SUPPORTED_LANGUAGES[number]['value']

/**
 * 检测文本是否为代码
 */
export function isCode(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }

  const trimmed = text.trim()
  const lines = trimmed.split('\n')

  // 检测 shebang
  if (lines[0]?.startsWith('#!')) {
    return true
  }

  // 检测常见代码模式
  const codePatterns = [
    /^(import|from|export|const|let|var|function|class|def|public|private|package)\s/m,
    /^\s*(if|for|while|switch|try|catch)\s*\(/m,
    /^\s*\/\/|^\s*\/\*|^\s*#(?!#)/m, // 注释
    /^<\?php/m,
    /^#!/m,
    /^\s*@\w+/m, // 装饰器
    /<[a-z][\s\S]*>/i, // HTML 标签
    /\{\s*"[^"]+"\s*:/m, // JSON 对象
  ]

  // 至少匹配一个代码模式
  return codePatterns.some(pattern => pattern.test(text))
}

/**
 * 自动检测编程语言
 */
export function detectLanguage(text: string): LanguageType {
  if (!text) return 'plaintext'

  const trimmed = text.trim()
  const firstLine = trimmed.split('\n')[0] || ''

  // 检测 shebang
  if (firstLine.startsWith('#!/')) {
    if (firstLine.includes('bash') || firstLine.includes('sh')) return 'bash'
    if (firstLine.includes('python')) return 'python'
    if (firstLine.includes('node')) return 'javascript'
    if (firstLine.includes('ruby')) return 'ruby'
    if (firstLine.includes('php')) return 'php'
  }

  // 检测 JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // 继续检测其他语言
    }
  }

  // 检测 HTML/XML
  if (/<(!DOCTYPE|html|head|body|div|span|p|a|table|form)/i.test(text)) {
    return 'html'
  }
  if (/<\?xml|<[a-z]+:[a-z]/i.test(text)) {
    return 'xml'
  }

  // 检测 CSS
  if (/^\s*[\w-]+\s*\{[\s\S]*?\}/m.test(text)) {
    return 'css'
  }

  // 检测 YAML
  if (/^[a-z_-]+:\s*$/m.test(text) || /^\s*-\s+[a-z_-]+:/m.test(text)) {
    return 'yaml'
  }

  // 检测 SQL
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/im.test(text)) {
    return 'sql'
  }

  // 检测 Python
  if (/^\s*(def|class|import|from)\s/m.test(text) || /^\s*@\w+/m.test(text)) {
    return 'python'
  }

  // 检测 JavaScript/TypeScript
  if (/^\s*(import|export|const|let|var|function|class)\s/m.test(text)) {
    if (/:\s*(string|number|boolean|any|void|interface|type)\b/m.test(text)) {
      return 'typescript'
    }
    return 'javascript'
  }

  // 检测 Java（在 Go 之前检测，因为两者都用 package 关键字）
  // Java 的 package 通常有点号，如 package com.example.app;
  // Java 特征：package 声明、import 语句、注解、class/interface/enum
  if (
    /^package\s+[\w.]+;/m.test(text) || // Java package 有点号和分号
    /^import\s+(static\s+)?[\w.]+(\.\*)?;/m.test(text) || // Java import 格式
    /^\s*@\w+(\(.*\))?$/m.test(text) || // Java 注解
    /^\s*(public|private|protected)?\s*(static\s+)?(final\s+)?(class|interface|enum|abstract\s+class)\s+\w+/m.test(text) || // class/interface/enum 定义
    /\b(extends|implements)\s+\w+/m.test(text) // Java 继承/实现
  ) {
    return 'java'
  }

  // 检测 C/C++
  if (/#include\s*<|int\s+main\s*\(|std::/m.test(text)) {
    return 'cpp'
  }

  // 检测 C#
  if (/^\s*using\s+System|namespace\s+\w+/m.test(text)) {
    return 'csharp'
  }

  // 检测 Go（在 Java 之后，避免误判）
  if (/^package\s+\w+\s*$/m.test(text) || /func\s+\w+\s*\(/m.test(text)) {
    return 'go'
  }

  // 检测 Rust
  if (/^use\s+std::|fn\s+\w+\s*\(|impl\s+/m.test(text)) {
    return 'rust'
  }

  // 检测 PHP
  if (/<\?php|^\s*<\?/m.test(text)) {
    return 'php'
  }

  // 检测 Ruby
  if (/^\s*(def|class|module|require|end)\s/m.test(text)) {
    return 'ruby'
  }

  // 检测 Swift
  if (/^\s*(import\s+\w+|func\s+\w+|class\s+\w+|struct\s+\w+)/m.test(text)) {
    if (/\bSwift\b|import\s+UIKit|import\s+Foundation/m.test(text)) {
      return 'swift'
    }
  }

  // 检测 Kotlin
  if (/^\s*(fun|class|val|var)\s/m.test(text)) {
    return 'kotlin'
  }

  // 默认返回纯文本
  return 'plaintext'
}
