/**
 * Content Script - 拦截网页中的 JSONL/JSON 响应
 */

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
  // 创建 iframe
  const iframe = document.createElement('iframe')
  iframe.src = chrome.runtime.getURL('index.html')
  iframe.style.cssText =
    'position:fixed; top:0; left:0; width:100%; height:100%; border:none; z-index:999999;'

  // 清空页面并插入 iframe
  document.body.innerHTML = ''
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

  if (!contentType) {
    return
  }

  // 获取页面文本内容
  const bodyText = document.body.innerText || document.body.textContent || ''

  if (!bodyText.trim()) {
    return
  }

  // 检测是否为 JSONL 或 JSON
  if (isJsonLines(bodyText) || isValidJson(bodyText)) {
    replaceWithViewer(bodyText)
  }
}

// 延迟执行，确保 DOM 加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
