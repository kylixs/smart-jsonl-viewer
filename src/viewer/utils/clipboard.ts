/**
 * 剪贴板工具函数
 * 提供更可靠的复制功能，包含降级方案和错误处理
 */

export interface CopyResult {
  success: boolean
  error?: string
}

/**
 * 复制文本到剪贴板
 * 优先使用 Clipboard API，如果不可用则降级到 execCommand
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // 方法 1: 尝试使用现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return { success: true }
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err)
      // 如果失败，继续尝试降级方案
    }
  }

  // 方法 2: 降级到 document.execCommand（用于旧浏览器或权限被拒绝的情况）
  try {
    const result = await copyTextFallback(text)
    if (result) {
      return { success: true }
    }
  } catch (err) {
    console.error('Fallback copy method failed:', err)
  }

  // 所有方法都失败
  return {
    success: false,
    error: '复制失败，请检查浏览器权限或手动复制'
  }
}

/**
 * 使用 execCommand 的降级方案
 */
function copyTextFallback(text: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // 创建临时 textarea
    const textarea = document.createElement('textarea')
    textarea.value = text

    // 设置样式使其不可见
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.left = '-9999px'
    textarea.style.opacity = '0'
    textarea.setAttribute('readonly', '')

    document.body.appendChild(textarea)

    try {
      // 选择文本
      textarea.select()
      textarea.setSelectionRange(0, text.length)

      // 执行复制命令
      const successful = document.execCommand('copy')

      if (successful) {
        resolve(true)
      } else {
        reject(new Error('execCommand copy failed'))
      }
    } catch (err) {
      reject(err)
    } finally {
      // 清理临时元素
      document.body.removeChild(textarea)
    }
  })
}

/**
 * 检查是否支持剪贴板功能
 */
export function isClipboardSupported(): boolean {
  return !!(
    (navigator.clipboard && navigator.clipboard.writeText) ||
    document.queryCommandSupported?.('copy')
  )
}
