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
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'RENDER_JSONL') {
    // 可以在这里处理来自 content script 的消息
    console.log('Received JSONL data from content script')
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
