/**
 * Content Script - 拦截网页中的 JSONL/JSON 响应
 * 优化：在 document_start 时立即拦截，避免浏览器构建大量 DOM 节点
 */

// ========== 预检测函数（不打印日志）==========

// 检测 URL 文件后缀（本地文件或远程 URL）
function isJsonUrl(url: string): boolean {
  return /\.(json|jsonl|ndjson)(\?|#|$)/i.test(url)
}

// 检测页面内容类型（仅 application/json，不检测 text/plain 避免误判）
function detectContentType(): boolean {
  return document.contentType.includes('application/json')
}

// 判断是否应该拦截（文件后缀或 content-type）
function shouldIntercept(): boolean {
  const urlMatch = isJsonUrl(location.href)
  const contentTypeMatch = detectContentType()
  return urlMatch || contentTypeMatch
}

  // 只有 URL 匹配时，才继续执行并打印日志
if (shouldIntercept()) {

  // 性能监控：记录脚本注入时间
  const scriptStartTime = performance.now()
  console.log('[JSONL Viewer] 脚本注入时间:', new Date().toISOString(), 'readyState:', document.readyState)

  // 标记是否已处理
  let handled = false

  // 尝试通过 background script fetch 文件（需要用户启用 file:// 权限）
  async function tryBackgroundFetch(url: string): Promise<string | null> {
    try {
      const fetchStart = performance.now()
      console.log('[JSONL Viewer] 🚀 尝试通过 background 读取文件')

      // 设置 5 秒超时，防止 background fetch 卡住
      const messagePromise = chrome.runtime.sendMessage({
        type: 'FETCH_FILE',
        url: url
      })

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log('[JSONL Viewer] background fetch 超时（5秒）')
          resolve(null)
        }, 5000)
      })

      const response = await Promise.race([messagePromise, timeoutPromise])

      if (response && response.success) {
        const fetchEnd = performance.now()
        console.log(
          '[JSONL Viewer] ✅ background 读取成功，耗时:',
          (fetchEnd - fetchStart).toFixed(2),
          'ms，内容大小:',
          response.content.length
        )
        return response.content
      } else {
        console.log('[JSONL Viewer] background 读取失败:', response?.error)
        return null
      }
    } catch (error) {
      console.log('[JSONL Viewer] background fetch 异常:', error)
      return null
    }
  }

  // 显示右下角小提示框（非侵入式）
  function showTip(isFileProtocol: boolean) {
    if (!document.body) return

    // 检查是否已经显示过
    if (document.getElementById('jsonl-viewer-tip')) return

    const tipDiv = document.createElement('div')
    tipDiv.id = 'jsonl-viewer-tip'
    tipDiv.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 360px;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      border: 1px solid #e0e0e0;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px; color: #333;">🚀 JSONL Viewer</h3>
        <button id="close-tip-btn" style="
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #999;
          padding: 0;
          line-height: 1;
        ">×</button>
      </div>
      <p style="margin: 0 0 16px; font-size: 14px; color: #666; line-height: 1.5;">
        检测到大文件加载较慢，您可以：
      </p>
      <button id="open-viewer-btn" style="
        width: 100%;
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
      ">
        ✨ 打开插件首页快速加载
      </button>
      ${isFileProtocol ? `
      <button id="guide-permission-btn" style="
        width: 100%;
        background: #2196F3;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      ">
        ⚡ 授权文件访问（一劳永逸）
      </button>
      ` : ''}
      <p style="margin: 12px 0 0; font-size: 12px; color: #999;">
        或继续等待浏览器加载完成
      </p>
    </div>
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      #jsonl-viewer-tip button:hover {
        opacity: 0.9;
      }
    </style>
  `

    document.body.appendChild(tipDiv)
    console.log('[JSONL Viewer] 显示非侵入式提示')

    // 关闭按钮
    document.getElementById('close-tip-btn')?.addEventListener('click', () => {
      tipDiv.remove()
    })

    // 打开首页按钮
    document.getElementById('open-viewer-btn')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_VIEWER' })
      tipDiv.remove()
    })

    // 授权引导按钮
    if (isFileProtocol) {
      document.getElementById('guide-permission-btn')?.addEventListener('click', () => {
        alert(`请按以下步骤授权：\n\n1. 右键点击浏览器工具栏中的 JSONL Viewer 图标\n2. 选择"管理扩展程序"\n3. 开启"允许访问文件网址"开关\n4. 刷新此页面\n\n授权后可直接打开本地文件，秒级加载！`)
      })
    }

    // 10秒后自动隐藏
    setTimeout(() => {
      if (document.getElementById('jsonl-viewer-tip')) {
        tipDiv.style.opacity = '0'
        tipDiv.style.transition = 'opacity 0.3s'
        setTimeout(() => tipDiv.remove(), 300)
      }
    }, 10000)
  }

  // 替换页面为查看器
  function replaceWithViewer(text: string) {
    const replaceStart = performance.now()
    console.log('[JSONL Viewer] 开始替换页面，内容大小:', text.length, '字符')

    // 创建 iframe，添加 autoload 参数告知是自动加载模式
    const iframe = document.createElement('iframe')
    iframe.src = chrome.runtime.getURL('index.html') + '?autoload=true'
    iframe.style.cssText =
      'position:fixed; top:0; left:0; width:100%; height:100%; border:none; z-index:999999;'

    // 清空页面并插入 iframe（body 已被 CSS 隐藏）
    document.body.innerHTML = ''
    document.body.style.visibility = 'visible' // 恢复可见性，显示 iframe
    document.body.appendChild(iframe)

    const replaceEnd = performance.now()
    console.log('[JSONL Viewer] 页面替换完成，耗时:', (replaceEnd - replaceStart).toFixed(2), 'ms')

    // 等待 iframe 加载完成后传递数据
    iframe.onload = () => {
      const messageStart = performance.now()
      console.log('[JSONL Viewer] iframe 加载完成，开始传递数据')

      iframe.contentWindow?.postMessage(
        {
          type: 'LOAD_JSONL',
          data: text
        },
        '*'
      )

      const messageEnd = performance.now()
      const totalTime = messageEnd - scriptStartTime
      console.log('[JSONL Viewer] 数据传递完成，耗时:', (messageEnd - messageStart).toFixed(2), 'ms')
      console.log('[JSONL Viewer] ✅ 总耗时:', totalTime.toFixed(2), 'ms，从脚本注入到数据传递')
    }
  }

  // 尝试早期拦截（基于 URL 后缀或 content-type）
  async function tryEarlyIntercept() {
    const interceptStart = performance.now()
    console.log(
      '[JSONL Viewer] tryEarlyIntercept 调用，耗时:',
      (interceptStart - scriptStartTime).toFixed(2),
      'ms，readyState:',
      document.readyState
    )

    if (handled) return

    // 立即标记为已处理，阻止后续检测
    handled = true

    const isFileProtocol = location.href.startsWith('file://')

    // 🚀 优先尝试 background fetch（需要用户授权）
    console.log('[JSONL Viewer] 尝试快速加载...')
    const fetchPromise = tryBackgroundFetch(location.href)

    // ⏱️ 设置 2 秒超时：如果 2 秒内没有完成，显示提示
    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        console.log('[JSONL Viewer] ⏱️ 2秒超时，显示非侵入式提示')
        resolve('timeout')
      }, 2000)
    })

    const result = await Promise.race([fetchPromise, timeoutPromise])

    if (result === 'timeout') {
      // 超时了，显示小提示框，但不阻止原始加载
      console.log('[JSONL Viewer] 显示提示，继续等待浏览器加载...')
      showTip(isFileProtocol)

      // 继续等待 fetch 完成
      const content = await fetchPromise
      if (content !== null) {
        // 如果最终成功了，替换页面
        console.log('[JSONL Viewer] 最终 fetch 成功，替换页面')
        document.getElementById('jsonl-viewer-tip')?.remove()
        replaceWithViewer(content as string)
      } else {
        // fetch 失败，等待 DOM 加载完成后再替换
        console.log('[JSONL Viewer] fetch 失败，等待 DOM 加载')
        waitForDOMAndReplace()
      }
    } else if (result !== null) {
      // 2秒内成功了，直接替换
      console.log('[JSONL Viewer] ✅ 快速加载成功（<2s），直接替换')
      replaceWithViewer(result as string)
    } else {
      // 快速失败（没有权限），等待 DOM 加载并显示提示
      console.log('[JSONL Viewer] ⚠️ 快速加载失败，显示提示并等待 DOM')
      showTip(isFileProtocol)
      waitForDOMAndReplace()
    }
  }

  // 等待 DOM 加载完成后替换
  function waitForDOMAndReplace() {
    console.log('[JSONL Viewer] 等待 DOM 加载完成...')
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        const dclTime = performance.now()
        const fullContent = document.body?.textContent || ''
        console.log(
          '[JSONL Viewer] ⏰ DOMContentLoaded 触发，耗时:',
          (dclTime - scriptStartTime).toFixed(2),
          'ms，内容长度:',
          fullContent.length
        )

        // 移除提示框
        document.getElementById('jsonl-viewer-tip')?.remove()

        if (fullContent.trim()) {
          replaceWithViewer(fullContent)
        }
      },
      { once: true }
    )
  }

  // 主逻辑（作为后备，确保完整性）
  async function main() {
    const mainStart = performance.now()
    console.log(
      '[JSONL Viewer] main 调用，耗时:',
      (mainStart - scriptStartTime).toFixed(2),
      'ms，readyState:',
      document.readyState
    )

    if (handled) {
      console.log('[JSONL Viewer] 已处理，跳过')
      return
    }

    // 标记已处理
    handled = true

    const isFileProtocol = location.href.startsWith('file://')

    // 尝试 background fetch
    const content = await tryBackgroundFetch(location.href)

    if (content !== null) {
      // 成功，直接替换
      replaceWithViewer(content)
    } else {
      // 失败，显示提示并等待 DOM
      showTip(isFileProtocol)
      waitForDOMAndReplace()
    }
  }

  // 早期拦截：监听 body 的创建和内容变化
  if (document.body) {
    // body 已存在，立即尝试拦截
    console.log('[JSONL Viewer] body 已存在，立即拦截')
    tryEarlyIntercept()
  } else {
    // body 还未创建，监听 document 变化
    console.log('[JSONL Viewer] body 未创建，启动 MutationObserver 监听')
    const observer = new MutationObserver(() => {
      if (document.body && !handled) {
        console.log('[JSONL Viewer] MutationObserver 检测到 body 创建')
        tryEarlyIntercept()

        // 如果已处理，停止监听
        if (handled) {
          console.log('[JSONL Viewer] MutationObserver 停止监听')
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
    console.log('[JSONL Viewer] 注册 DOMContentLoaded 后备监听')
    document.addEventListener('DOMContentLoaded', main)
  } else {
    console.log('[JSONL Viewer] readyState 非 loading，立即调用 main')
    main()
  }

}
