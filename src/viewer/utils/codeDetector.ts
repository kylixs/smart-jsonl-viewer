/**
 * 代码检测和语言识别工具
 */

import { autoDetectLanguage as hljsAutoDetect } from './syntaxHighlight'

/**
 * 支持的编程语言
 * 注意：这里列出的语言会在用户选择时按需加载，只有被选择的语言才会打包
 */
export const SUPPORTED_LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text', extensions: ['.txt'] },
  // Web 开发
  { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx', '.mjs'] },
  { value: 'typescript', label: 'TypeScript', extensions: ['.ts', '.tsx'] },
  { value: 'html', label: 'HTML', extensions: ['.html', '.htm'] },
  { value: 'css', label: 'CSS', extensions: ['.css'] },
  { value: 'scss', label: 'SCSS', extensions: ['.scss'] },
  { value: 'less', label: 'Less', extensions: ['.less'] },
  { value: 'vue', label: 'Vue', extensions: ['.vue'] },
  { value: 'jsx', label: 'JSX', extensions: ['.jsx'] },
  { value: 'tsx', label: 'TSX', extensions: ['.tsx'] },
  // 后端语言
  { value: 'python', label: 'Python', extensions: ['.py'] },
  { value: 'java', label: 'Java', extensions: ['.java'] },
  { value: 'cpp', label: 'C/C++', extensions: ['.c', '.cpp', '.h', '.hpp'] },
  { value: 'c', label: 'C', extensions: ['.c', '.h'] },
  { value: 'csharp', label: 'C#', extensions: ['.cs'] },
  { value: 'go', label: 'Go', extensions: ['.go'] },
  { value: 'rust', label: 'Rust', extensions: ['.rs'] },
  { value: 'php', label: 'PHP', extensions: ['.php'] },
  { value: 'ruby', label: 'Ruby', extensions: ['.rb'] },
  { value: 'swift', label: 'Swift', extensions: ['.swift'] },
  { value: 'kotlin', label: 'Kotlin', extensions: ['.kt'] },
  { value: 'scala', label: 'Scala', extensions: ['.scala'] },
  { value: 'r', label: 'R', extensions: ['.r', '.R'] },
  // 脚本语言
  { value: 'bash', label: 'Bash/Shell', extensions: ['.sh', '.bash'] },
  { value: 'powershell', label: 'PowerShell', extensions: ['.ps1'] },
  { value: 'perl', label: 'Perl', extensions: ['.pl'] },
  { value: 'lua', label: 'Lua', extensions: ['.lua'] },
  // 数据格式
  { value: 'json', label: 'JSON', extensions: ['.json'] },
  { value: 'yaml', label: 'YAML', extensions: ['.yml', '.yaml'] },
  { value: 'xml', label: 'XML', extensions: ['.xml'] },
  { value: 'toml', label: 'TOML', extensions: ['.toml'] },
  { value: 'ini', label: 'INI', extensions: ['.ini'] },
  // 数据库
  { value: 'sql', label: 'SQL', extensions: ['.sql'] },
  // 文档
  { value: 'markdown', label: 'Markdown', extensions: ['.md'] },
  { value: 'latex', label: 'LaTeX', extensions: ['.tex'] },
  // 其他
  { value: 'dockerfile', label: 'Dockerfile', extensions: ['Dockerfile'] },
  { value: 'makefile', label: 'Makefile', extensions: ['Makefile'] },
  { value: 'graphql', label: 'GraphQL', extensions: ['.graphql', '.gql'] },
  { value: 'proto', label: 'Protocol Buffers', extensions: ['.proto'] },
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
 * 使用 highlight.js 的成熟检测算法，配合一些快速预检查
 */
export function detectLanguage(text: string): LanguageType {
  if (!text) return 'plaintext'

  const trimmed = text.trim()
  const firstLine = trimmed.split('\n')[0] || ''

  // 快速检测 shebang（优先级最高）
  if (firstLine.startsWith('#!/')) {
    if (firstLine.includes('bash') || firstLine.includes('sh')) return 'bash'
    if (firstLine.includes('python')) return 'python'
    if (firstLine.includes('node')) return 'javascript'
    if (firstLine.includes('ruby')) return 'ruby'
    if (firstLine.includes('php')) return 'php'
  }

  // 快速检测 JSON（常见且容易判断）
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // 不是合法 JSON，继续检测
    }
  }

  // 使用 highlight.js 的自动检测（最可靠的方法）
  return hljsAutoDetect(text)
}

