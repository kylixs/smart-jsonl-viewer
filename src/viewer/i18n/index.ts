import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import en from './locales/en'
import de from './locales/de'
import fr from './locales/fr'
import es from './locales/es'

// 从 localStorage 获取保存的语言设置
const getStoredLocale = (): string => {
  const stored = localStorage.getItem('jsonl-viewer-locale')
  if (stored && ['zh-CN', 'en', 'de', 'fr', 'es'].includes(stored)) {
    return stored
  }

  // 根据浏览器语言自动选择
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('de')) return 'de'
  if (browserLang.startsWith('fr')) return 'fr'
  if (browserLang.startsWith('es')) return 'es'
  return 'en'
}

export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getStoredLocale(),
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    'en': en,
    'de': de,
    'fr': fr,
    'es': es
  }
})

// 保存语言设置到 localStorage
export const setLocale = (locale: string) => {
  i18n.global.locale.value = locale as any
  localStorage.setItem('jsonl-viewer-locale', locale)
}

// 获取当前语言
export const getLocale = (): string => {
  return i18n.global.locale.value
}

// 可用的语言列表
export const availableLocales = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]
