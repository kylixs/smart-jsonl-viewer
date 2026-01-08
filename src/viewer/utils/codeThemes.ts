/**
 * 代码高亮主题管理
 * Shiki 主题配置
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
    name: 'GitHub (Auto)',
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
    id: 'github-default',
    name: 'GitHub Default (Auto)',
    lightTheme: 'github-light-default',
    darkTheme: 'github-dark-default',
    mode: 'auto'
  },
  {
    id: 'github-dimmed',
    name: 'GitHub Dimmed (Auto)',
    lightTheme: 'github-light',
    darkTheme: 'github-dark-dimmed',
    mode: 'auto'
  },
  {
    id: 'vscode',
    name: 'VS Code (Auto)',
    lightTheme: 'light-plus',
    darkTheme: 'dark-plus',
    mode: 'auto'
  },
  {
    id: 'vscode-light',
    name: 'VS Code Light',
    lightTheme: 'light-plus',
    darkTheme: 'light-plus',
    mode: 'light'
  },
  {
    id: 'vscode-dark',
    name: 'VS Code Dark',
    lightTheme: 'dark-plus',
    darkTheme: 'dark-plus',
    mode: 'dark'
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro (Auto)',
    lightTheme: 'one-light',
    darkTheme: 'one-dark-pro',
    mode: 'auto'
  },
  {
    id: 'solarized',
    name: 'Solarized (Auto)',
    lightTheme: 'solarized-light',
    darkTheme: 'solarized-dark',
    mode: 'auto'
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    lightTheme: 'solarized-light',
    darkTheme: 'solarized-light',
    mode: 'light'
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    lightTheme: 'solarized-dark',
    darkTheme: 'solarized-dark',
    mode: 'dark'
  },
  {
    id: 'vitesse',
    name: 'Vitesse (Auto)',
    lightTheme: 'vitesse-light',
    darkTheme: 'vitesse-dark',
    mode: 'auto'
  },
  {
    id: 'material',
    name: 'Material Theme (Auto)',
    lightTheme: 'material-theme-lighter',
    darkTheme: 'material-theme-darker',
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
    id: 'monokai',
    name: 'Monokai',
    lightTheme: 'monokai',
    darkTheme: 'monokai',
    mode: 'auto'
  },
  {
    id: 'dracula',
    name: 'Dracula (Auto)',
    lightTheme: 'dracula-soft',
    darkTheme: 'dracula',
    mode: 'auto'
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    lightTheme: 'tokyo-night',
    darkTheme: 'tokyo-night',
    mode: 'auto'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    lightTheme: 'night-owl',
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
