export default {
  app: {
    title: 'Smart JSONL Viewer',
    home: '首頁',
    help: '說明',
    settings: '設定',
    export: '匯出',
    github: 'GitHub 專案'
  },
  upload: {
    title: '拖曳檔案到此處',
    subtitle: '支援 .jsonl、.json、.ndjson 格式',
    button: '點擊選擇檔案',
    or: '或',
    paste: '按 Ctrl+V 貼上內容'
  },
  search: {
    placeholder: '搜尋關鍵字...',
    mode: {
      fuzzy: '模糊比對',
      exact: '完全比對',
      regex: '正規表示式',
      jsonpath: 'JSON 路徑'
    },
    typeFilter: '類型過濾',
    types: {
      all: '全部',
      string: '字串',
      number: '數字',
      boolean: '布林值',
      object: '物件',
      array: '陣列'
    },
    clear: '清空',
    viewHistory: '檢視搜尋歷史',
    history: '搜尋歷史',
    clearHistory: '清空歷史',
    delete: '刪除',
    filterScope: '過濾範圍',
    filterByLine: '按行',
    filterByNode: '按節點',
    matchMode: '比對模式',
    fuzzy: '模糊',
    fuzzyHint: '忽略大小寫，包含即比對',
    exact: '完全',
    exactHint: '忽略大小寫，完整單詞比對',
    jsonpathLabel: 'JSONPath',
    jsonpathHint: '使用 JSONPath 表達式',
    searchDecoded: '解碼內容',
    expandDepth: '展開深度',
    expandAll: '全部展開',
    collapseAll: '全部摺疊',
    expandLevel: '展開{level}層',
    jsonpathExamples: '範例',
    statsDisplay: '顯示',
    statsOf: '/',
    statsLines: '行'
  },
  settings: {
    title: '設定',
    close: '關閉',
    language: '語言',
    themeColor: '主題配色',
    themeMode: '主題模式',
    maxLines: '預覽行數',
    indentSize: '縮排字元數',
    fontFamily: '字型',
    fontSize: '字型大小',
    unlimited: '不限制',
    lines: '行',
    spaces: '個空格',
    px: '像素'
  },
  theme: {
    toggle: '切換主題',
    light: '切換到亮色主題',
    lightMode: '亮色主題',
    dark: '切換到暗色主題',
    darkMode: '暗色主題',
    selectColor: '選擇主題配色',
    colors: {
      ocean: '海洋藍',
      forest: '森林綠',
      sunset: '日落橙',
      purple: '薰衣草紫',
      ruby: '寶石紅',
      gray: '極簡黑白'
    }
  },
  help: {
    title: 'Smart JSONL Viewer 說明',
    close: '關閉',
    fileLoading: {
      title: '📁 檔案載入',
      feature1: '快速開啟 100MB+ 大檔案，後台非同步載入',
      feature2: '支援拖曳檔案、點擊選擇或貼上內容',
      feature3: '自動識別 .jsonl、.json、.ndjson 格式'
    },
    searchFilter: {
      title: '🔍 搜尋與過濾',
      feature1: '過濾範圍：按行過濾 / 按節點過濾',
      feature2: '比對模式：模糊比對 / 完全比對 / JSONPath',
      feature3: 'JSONPath 範例：$.user.name、$.data[0]、$..content',
      feature4: '支援搜尋解碼後的內容',
      feature5: '搜尋歷史記錄，快速重複查詢'
    },
    smartDecoding: {
      title: '✨ 智慧解碼',
      feature1: '自動解碼轉義字元（\\n、\\"、\\t 等）',
      feature2: '解析巢狀的 JSON 字串',
      feature3: 'JSON/程式碼語法醒目提示，Markdown 預覽',
      feature4: '點擊欄位旁的 👁 圖示檢視解碼內容'
    },
    themesSettings: {
      title: '🎨 主題與設定',
      feature1: '亮色/暗色主題快速切換',
      feature2: '5 種配色方案：海洋藍、森林綠、日落橙、薰衣草紫、寶石紅',
      feature3: '自訂預覽行數、縮排大小',
      feature4: '靈活的展開深度控制（0-5層或全部展開）'
    },
    moreFeatures: {
      title: '🚀 其他功能',
      feature1: '匯出過濾結果為 JSONL 或 JSON 格式',
      feature2: '批次載入，支援「載入更多」',
      feature3: '快速捲動到頂部/底部'
    },
    moreInfo: {
      title: '📖 更多資訊',
      content: '造訪 GitHub 檢視詳細文件、提交問題或貢獻程式碼',
      github: 'GitHub 專案首頁'
    }
  },
  loading: {
    title: '正在載入 JSONL 檔案...',
    subtitle: '請稍候',
    progress: '正在載入...',
    rendering: '正在算繪...'
  },
  result: {
    noResults: '沒有找到符合的結果',
    hint: '嘗試使用其他關鍵字或切換過濾模式',
    displayed: '已顯示',
    of: '/',
    lines: '行',
    loadMore: '載入更多',
    loadMoreCount: '行'
  },
  paste: {
    title: '貼上 JSONL 內容',
    placeholder: '在此貼上 JSONL 內容...\n每行一個 JSON 物件，例如：\n{"name": "Alice", "age": 25}\n{"name": "Bob", "age": 30}',
    submit: '確定',
    cancel: '取消'
  },
  drag: {
    title: '拖曳檔案到此處',
    subtitle: '將載入新檔案'
  },
  scroll: {
    toTop: '到頂部',
    toBottom: '到底部'
  },
  confirm: {
    goHome: '確定要返回首頁嗎？目前資料將被清空。'
  },
  error: {
    fileRead: '檔案讀取失敗：',
    parse: '無法解析檔案內容: ',
    pasteContent: '無法解析貼上的內容：'
  },
  language: {
    select: '選擇語言',
    current: '目前語言'
  },
  decoder: {
    viewFull: '檢視完整內容',
    copied: '已複製!',
    copyDecoded: '複製解碼內容',
    copyFailed: '複製失敗',
    copyFailedRetry: '複製失敗，請重試',
    markdownRenderError: 'Markdown 算繪錯誤',
    title: '解碼內容',
    originalContent: '原始內容',
    markdownPreview: 'Markdown 預覽',
    showToc: '顯示目錄',
    hideToc: '隱藏目錄',
    selectLanguage: '選擇或搜尋語言...',
    searchLanguageHint: '選擇或輸入語言名稱進行搜尋',
    autoDetectLanguage: '自動偵測',
    selectTheme: '選擇程式碼醒目提示主題',
    showDecoded: '顯示解碼後的內容',
    showOriginal: '顯示原始內容',
    truncated: '（已省略 {count} 行）',
    noMatchingLanguage: '未找到匹配的語言',
    themeLabel: '配色主題：',
    loadingHighlight: '正在載入程式碼醒目提示...',
    toc: '目錄',
    programmingLanguage: '程式語言：'
  }
}
