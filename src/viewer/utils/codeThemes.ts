/**
 * 代码高亮主题管理
 */

export interface CodeTheme {
  id: string
  name: string
  lightTheme: string // highlight.js 主题名称
  darkTheme: string
}

export const codeThemes: CodeTheme[] = [
  {
    id: 'atom-one',
    name: 'Atom One',
    lightTheme: 'atom-one-light',
    darkTheme: 'atom-one-dark'
  },
  {
    id: 'github',
    name: 'GitHub',
    lightTheme: 'github',
    darkTheme: 'github-dark'
  },
  {
    id: 'vs',
    name: 'Visual Studio',
    lightTheme: 'vs',
    darkTheme: 'vs2015'
  },
  {
    id: 'monokai',
    name: 'Monokai',
    lightTheme: 'monokai',
    darkTheme: 'monokai'
  },
  {
    id: 'nord',
    name: 'Nord',
    lightTheme: 'nord',
    darkTheme: 'nord'
  }
]

/**
 * 获取主题
 */
export function getCodeThemeById(id: string): CodeTheme {
  return codeThemes.find(t => t.id === id) || codeThemes[0]
}

/**
 * 动态加载代码高亮主题CSS
 */
export async function loadCodeTheme(themeName: string, isDark: boolean) {
  const theme = getCodeThemeById(themeName)
  const themeFile = isDark ? theme.darkTheme : theme.lightTheme

  // 移除旧的主题样式
  const oldLinks = document.querySelectorAll('link[data-code-theme]')
  oldLinks.forEach(link => link.remove())

  // 创建新的 link 标签
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeFile}.min.css`
  link.setAttribute('data-code-theme', themeName)

  // 添加到 head
  document.head.appendChild(link)

  // 等待加载完成
  return new Promise<void>((resolve, reject) => {
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load theme: ${themeFile}`))
  })
}

/**
 * 保存主题设置到 localStorage
 */
export function saveCodeThemePreference(themeId: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('jsonl-viewer-code-theme', themeId)
  }
}

/**
 * 从 localStorage 加载主题设置
 */
export function loadCodeThemePreference(): string {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('jsonl-viewer-code-theme') || 'atom-one'
  }
  return 'atom-one'
}
