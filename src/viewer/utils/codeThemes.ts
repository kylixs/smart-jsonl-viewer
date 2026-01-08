/**
 * 代码高亮主题管理
 * Shiki 主题配置
 *
 * 注意：主题会按需动态加载，只有被使用的主题才会打包
 */

export interface CodeTheme {
  id: string
  name: string
  lightTheme: string
  darkTheme: string
  mode?: 'auto' | 'light' | 'dark' // 主题模式：自动、强制亮色、强制暗色
}

export const codeThemes: CodeTheme[] = [
  {
    id: 'github',
    name: 'GitHub (推荐)',
    lightTheme: 'github-light',
    darkTheme: 'github-dark',
    mode: 'auto'
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    lightTheme: 'github-light',
    darkTheme: 'github-light',
    mode: 'light'
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    lightTheme: 'github-dark',
    darkTheme: 'github-dark',
    mode: 'dark'
  },
  {
    id: 'vscode',
    name: 'VS Code',
    lightTheme: 'light-plus',
    darkTheme: 'dark-plus',
    mode: 'auto'
  },
  {
    id: 'monokai',
    name: 'Monokai',
    lightTheme: 'monokai',
    darkTheme: 'monokai',
    mode: 'auto'
  },
  {
    id: 'dracula',
    name: 'Dracula',
    lightTheme: 'dracula-soft',
    darkTheme: 'dracula',
    mode: 'auto'
  },
  {
    id: 'nord',
    name: 'Nord',
    lightTheme: 'nord',
    darkTheme: 'nord',
    mode: 'auto'
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    lightTheme: 'one-light',
    darkTheme: 'one-dark-pro',
    mode: 'auto'
  },
  {
    id: 'solarized',
    name: 'Solarized',
    lightTheme: 'solarized-light',
    darkTheme: 'solarized-dark',
    mode: 'auto'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    lightTheme: 'night-owl-light',
    darkTheme: 'night-owl',
    mode: 'auto'
  }
]

/**
 * 获取主题
 */
export function getCodeThemeById(id: string): CodeTheme {
  return codeThemes.find(t => t.id === id) || codeThemes[0]
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
    return localStorage.getItem('jsonl-viewer-code-theme') || 'github'
  }
  return 'github'
}
