/**
 * Background Script - Service Worker
 * 处理扩展的后台任务
 */

// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('JSONL Viewer extension installed')
})

// 监听扩展图标点击，打开新标签页
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  })
})

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RENDER_JSONL') {
    // 可以在这里处理来自 content script 的消息
    console.log('Received JSONL data from content script')
  }

  // 打开 JSONL Viewer 首页
  if (message.type === 'OPEN_VIEWER') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    })
    sendResponse({ success: true })
    return true
  }

  // 处理文件读取请求（需要用户在 chrome://extensions/ 中启用 "允许访问文件网址"）
  if (message.type === 'FETCH_FILE') {
    const requestUrl = message.url
    const requestId = message.requestId || 'unknown'
    const tabId = sender.tab?.id

    console.log('[Background] 收到文件读取请求:', {
      requestId: requestId,
      url: requestUrl,
      tabId: tabId
    })

    fetch(requestUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.text()
      })
      .then((content) => {
        console.log('[Background] 文件读取成功:', {
          requestId: requestId,
          url: requestUrl,
          size: content.length,
          tabId: tabId
        })
        sendResponse({ success: true, content, requestId: requestId })
      })
      .catch((error) => {
        console.error('[Background] 文件读取失败:', {
          requestId: requestId,
          url: requestUrl,
          error: error.message,
          tabId: tabId
        })
        sendResponse({ success: false, error: error.message, requestId: requestId })
      })

    // 返回 true 表示异步响应
    return true
  }

  return true
})

// 监听标签页更新
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 可以在这里添加额外的逻辑
  }
})

export {}
