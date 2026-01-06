/**
 * Content Script - 拦截网页中的 JSONL/JSON 响应
 * 优化：在 document_start 时立即执行，配合 CSS 隐藏原始内容
 */

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

// 检测文本是否为 JSONL 格式
function isJsonLines(text: string): boolean {
  const lines = text.trim().split('\n')

  if (lines.length < 2) {
    return false
  }

  // 检查前几行是否都是有效的 JSON
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

// 主逻辑
function main() {
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

// 延迟执行，确保 DOM 加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
