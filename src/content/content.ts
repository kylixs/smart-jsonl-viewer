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

// 检测文本是否为 JSONL 格式（快速检测：只检查格式特征，不完整解析）
function isJsonLines(text: string): boolean {
  const lines = text.trim().split('\n')

  if (lines.length < 2) {
    return false
  }

  // 只检查前5行即可快速判断
  const samplesToCheck = Math.min(lines.length, 5)
  let validCount = 0

  for (let i = 0; i < samplesToCheck; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // 快速检测：JSON 对象以 { 开头，数组以 [ 开头
    const firstChar = line[0]
    if (firstChar === '{' || firstChar === '[') {
      validCount++
    } else {
      // 不是 JSON 格式
      return false
    }
  }

  return validCount >= 2
}

// 快速检测：只读取前几KB内容，仅检查完整的行
function quickDetectJsonLines(text: string): boolean {
  // 如果内容很短（<=2KB），直接检测全部内容
  if (text.length <= 2048) {
    return isJsonLines(text)
  }

  // 内容较长，只读取前 2KB 避免性能问题
  const sample = text.substring(0, 2048)

  // 只保留完整的行（去掉最后可能被截断的行）
  const lastNewlineIndex = sample.lastIndexOf('\n')
  if (lastNewlineIndex === -1) {
    // 如果连一个换行符都没有，说明可能是单行JSON（或第一行超过2KB）
    // 无法判断是否为JSONL，返回false，让后续完整检测处理
    return false
  }

  // 只检查到最后一个完整行
  const completeLines = sample.substring(0, lastNewlineIndex)

  // 检测完整的行
  return isJsonLines(completeLines)
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

  // 获取当前内容
  const bodyText = document.body?.textContent || ''

  // 如果内容太少，判断是否需要等待
  if (bodyText.length < 100) {
    // 如果 DOM 已加载完成，说明文件就是这么小，直接检测
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log('[JSONL Viewer] 小文件检测，内容长度:', bodyText.length)
      // 继续检测，不返回
    } else {
      // DOM 仍在加载，等待更多内容
      return
    }
  }

  // 快速检测是否为 JSONL/JSON
  if (quickDetectJsonLines(bodyText) || isValidJson(bodyText)) {
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
