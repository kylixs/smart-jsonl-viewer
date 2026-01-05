/**
 * 主题配置
 */

export interface ThemeColors {
  // 主色调
  primary: string
  primaryDark: string
  // 按钮渐变
  gradientFrom: string
  gradientTo: string
  // 阴影颜色
  shadowColor: string
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
}

export const themes: Theme[] = [
  {
    id: 'purple',
    name: '紫色经典',
    colors: {
      primary: '#667eea',
      primaryDark: '#764ba2',
      gradientFrom: '#667eea',
      gradientTo: '#764ba2',
      shadowColor: 'rgba(102, 126, 234, 0.3)'
    }
  },
  {
    id: 'blue',
    name: '深蓝科技',
    colors: {
      primary: '#2563eb',
      primaryDark: '#1e40af',
      gradientFrom: '#3b82f6',
      gradientTo: '#1e40af',
      shadowColor: 'rgba(37, 99, 235, 0.3)'
    }
  },
  {
    id: 'gray',
    name: '极简黑白',
    colors: {
      primary: '#374151',
      primaryDark: '#1f2937',
      gradientFrom: '#4b5563',
      gradientTo: '#1f2937',
      shadowColor: 'rgba(55, 65, 81, 0.3)'
    }
  },
  {
    id: 'green',
    name: '绿色开发者',
    colors: {
      primary: '#059669',
      primaryDark: '#047857',
      gradientFrom: '#10b981',
      gradientTo: '#047857',
      shadowColor: 'rgba(5, 150, 105, 0.3)'
    }
  },
  {
    id: 'orange',
    name: '橙红活力',
    colors: {
      primary: '#ea580c',
      primaryDark: '#dc2626',
      gradientFrom: '#f97316',
      gradientTo: '#dc2626',
      shadowColor: 'rgba(234, 88, 12, 0.3)'
    }
  }
]

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) || themes[0]
}
