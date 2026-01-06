/**
 * Content Script - 拦截网页中的 JSONL/JSON 响应
 * 优化：在 document_start 时立即拦截，避免浏览器构建大量 DOM 节点
 */

// 标记是否已处理
let handled = false

// 立即隐藏 body，避免浏览器渲染纯文本（在 CSS 之外再加一层保险）
if (document.body) {
  document.body.style.visibility = 'hidden'
}

// 检测页面内容类型
function detectContentType(): string | null {
  const contentType = document.contentType
  if (contentType.includes('application/json') || contentType.includes('text/plain')) {
    return contentType
  }
  return null
}

// 检测文本是否为 JSONL 格式（优化：只检查前几行，快速判断）
function isJsonLines(text: string): boolean {
  const lines = text.trim().split('\n')

  if (lines.length < 2) {
    return false
  }

  // 只检查前5行即可快速判断，不需要解析整个文件
  const samplesToCheck = Math.min(lines.length, 5)
  let validCount = 0

  for (let i = 0; i < samplesToCheck; i++) {
    const line = lines[i].trim()
    if (!line) continue

    try {
      JSON.parse(line)
      validCount++
    } catch {
      return false
    }
  }

  return validCount >= 2
}

// 快速检测：只读取前 1KB 内容进行初步判断
function quickDetectJsonLines(text: string): boolean {
  // 只检查前 1KB（大约 10-20 行）
  const sample = text.substring(0, 1024)
  return isJsonLines(sample)
}

// 检测文本是否为有效的 JSON
function isValidJson(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

// 替换页面为查看器
function replaceWithViewer(text: string) {
  // 创建 iframe，添加 autoload 参数告知是自动加载模式
  const iframe = document.createElement('iframe')
  iframe.src = chrome.runtime.getURL('index.html') + '?autoload=true'
  iframe.style.cssText =
    'position:fixed; top:0; left:0; width:100%; height:100%; border:none; z-index:999999;'

  // 清空页面并插入 iframe（body 已被 CSS 隐藏）
  document.body.innerHTML = ''
  document.body.style.visibility = 'visible' // 恢复可见性，显示 iframe
  document.body.appendChild(iframe)

  // 等待 iframe 加载完成后传递数据
  iframe.onload = () => {
    iframe.contentWindow?.postMessage(
      {
        type: 'LOAD_JSONL',
        data: text
      },
      '*'
    )
  }
}

// 尝试早期拦截（在 body 刚有内容时立即检测）
function tryEarlyIntercept() {
  if (handled) return

  const contentType = detectContentType()
  if (!contentType) {
    restorePageVisibility()
    return
  }

  // 尝试获取前 1KB 内容进行快速检测
  const bodyText = document.body?.textContent || ''

  // 如果内容少于 100 字节，等待更多内容
  if (bodyText.length < 100) {
    return
  }

  // 快速检测前 1KB 是否为 JSONL/JSON
  const sample = bodyText.substring(0, 1024)

  if (quickDetectJsonLines(sample) || isValidJson(sample)) {
    // 立即标记为已处理，阻止后续检测
    handled = true

    console.log('[JSONL Viewer] 检测到 JSONL/JSON，提前拦截，内容长度:', bodyText.length)

    // 检查内容是否完整（基于 readyState）
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // DOM 已完全加载，直接使用
      console.log('[JSONL Viewer] DOM 已完成，立即替换')
      replaceWithViewer(bodyText)
    } else {
      // DOM 仍在加载，等待完成后再替换（但已阻止重复处理）
      console.log('[JSONL Viewer] DOM 仍在加载，等待完成...')
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          const fullContent = document.body?.textContent || bodyText
          console.log('[JSONL Viewer] DOM 加载完成，替换页面，完整内容长度:', fullContent.length)
          replaceWithViewer(fullContent)
        },
        { once: true }
      )
    }
  }
}

// 主逻辑（作为后备，确保完整性）
function main() {
  if (handled) return

  const contentType = detectContentType()

  // 如果不是相关内容类型，恢复页面显示
  if (!contentType) {
    restorePageVisibility()
    return
  }

  // 获取页面文本内容
  const bodyText = document.body.innerText || document.body.textContent || ''

  if (!bodyText.trim()) {
    restorePageVisibility()
    return
  }

  // 检测是否为 JSONL 或 JSON
  if (isJsonLines(bodyText) || isValidJson(bodyText)) {
    handled = true
    replaceWithViewer(bodyText)
  } else {
    // 不是 JSON/JSONL，恢复页面显示
    restorePageVisibility()
  }
}

// 恢复页面可见性（针对非 JSON/JSONL 页面）
function restorePageVisibility() {
  if (document.body) {
    document.body.style.visibility = 'visible'
  }
}

// 早期拦截：监听 body 的创建和内容变化
if (document.body) {
  // body 已存在，立即尝试拦截
  tryEarlyIntercept()
} else {
  // body 还未创建，监听 document 变化
  const observer = new MutationObserver(() => {
    if (document.body && !handled) {
      tryEarlyIntercept()

      // 如果已处理，停止监听
      if (handled) {
        observer.disconnect()
      }
    }
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })
}

// 后备方案：等待 DOMContentLoaded（确保完整性）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
