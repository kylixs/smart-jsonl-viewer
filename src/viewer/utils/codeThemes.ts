/**
 * 代码高亮主题管理
 * Shiki 主题配置
 */

import type { BundledTheme } from 'shiki'

export interface CodeTheme {
  id: string
  name: string
  lightTheme: BundledTheme
  darkTheme: BundledTheme
}

export const codeThemes: CodeTheme[] = [
  {
    id: 'github',
    name: 'GitHub',
    lightTheme: 'github-light',
    darkTheme: 'github-dark'
  },
  {
    id: 'github-dimmed',
    name: 'GitHub Dimmed',
    lightTheme: 'github-light',
    darkTheme: 'github-dark-dimmed'
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    lightTheme: 'one-light',
    darkTheme: 'one-dark-pro'
  },
  {
    id: 'vitesse',
    name: 'Vitesse',
    lightTheme: 'vitesse-light',
    darkTheme: 'vitesse-dark'
  },
  {
    id: 'material',
    name: 'Material Theme',
    lightTheme: 'material-theme-lighter',
    darkTheme: 'material-theme-darker'
  },
  {
    id: 'nord',
    name: 'Nord',
    lightTheme: 'nord',
    darkTheme: 'nord'
  },
  {
    id: 'monokai',
    name: 'Monokai',
    lightTheme: 'monokai',
    darkTheme: 'monokai'
  },
  {
    id: 'dracula',
    name: 'Dracula',
    lightTheme: 'dracula-soft',
    darkTheme: 'dracula'
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    lightTheme: 'tokyo-night',
    darkTheme: 'tokyo-night'
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
