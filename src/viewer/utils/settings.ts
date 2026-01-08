/**
 * 应用设置管理
 */

const STORAGE_KEY = 'jsonline-viewer-settings'

export interface AppSettings {
  maxDisplayLines: number  // 预览行数
  indentSize: number       // 缩进字符数
  fontFamily: string       // 字体
  fontSize: number         // 字体大小（像素）
}

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  maxDisplayLines: 20,
  indentSize: 4,
  fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
  fontSize: 13
}

/**
 * 获取应用设置
 */
export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const settings = JSON.parse(stored)
      // 合并默认设置，确保新增的配置项有默认值
      return { ...DEFAULT_SETTINGS, ...settings }
    }
  } catch (error) {
    console.warn('Failed to load settings:', error)
  }
  return { ...DEFAULT_SETTINGS }
}

/**
 * 保存应用设置
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save settings:', error)
  }
}

/**
 * 重置为默认设置
 */
export function resetSettings(): AppSettings {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to reset settings:', error)
  }
  return { ...DEFAULT_SETTINGS }
}
