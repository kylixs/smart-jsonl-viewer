export default {
  app: {
    title: 'Smart JSONL Viewer',
    home: '首页',
    help: '帮助',
    settings: '设置',
    export: '导出',
    github: 'GitHub 项目'
  },
  upload: {
    title: '拖拽文件到此处',
    subtitle: '支持 .jsonl、.json、.ndjson 格式',
    button: '点击选择文件',
    or: '或',
    paste: '按 Ctrl+V 粘贴内容'
  },
  search: {
    placeholder: '搜索关键字...',
    mode: {
      fuzzy: '模糊匹配',
      exact: '完全匹配',
      regex: '正则表达式',
      jsonpath: 'JSON 路径'
    },
    typeFilter: '类型过滤',
    types: {
      all: '全部',
      string: '字符串',
      number: '数字',
      boolean: '布尔值',
      object: '对象',
      array: '数组'
    },
    clear: '清空',
    viewHistory: '查看搜索历史',
    history: '搜索历史',
    clearHistory: '清空历史',
    delete: '删除',
    filterScope: '过滤范围',
    filterByLine: '按行',
    filterByNode: '按节点',
    matchMode: '匹配模式',
    fuzzy: '模糊',
    fuzzyHint: '忽略大小写，包含即匹配',
    exact: '完全',
    exactHint: '忽略大小写，完整单词匹配',
    jsonpathLabel: 'JSONPath',
    jsonpathHint: '使用 JSONPath 表达式',
    searchDecoded: '解码内容',
    expandDepth: '展开深度',
    expandAll: '全部展开',
    collapseAll: '全部折叠',
    expandLevel: '展开{level}层',
    jsonpathExamples: '示例',
    statsDisplay: '显示',
    statsOf: '/',
    statsLines: '行'
  },
  settings: {
    title: '设置',
    close: '关闭',
    language: '语言',
    themeColor: '主题配色',
    themeMode: '主题模式',
    maxLines: '预览行数',
    indentSize: '缩进字符数',
    fontFamily: '字体',
    fontSize: '字体大小',
    unlimited: '不限制',
    lines: '行',
    spaces: '个空格',
    px: '像素'
  },
  theme: {
    toggle: '切换主题',
    light: '切换到亮色主题',
    lightMode: '亮色主题',
    dark: '切换到暗色主题',
    darkMode: '暗色主题',
    selectColor: '选择主题配色',
    colors: {
      ocean: '海洋蓝',
      forest: '森林绿',
      sunset: '日落橙',
      purple: '薰衣草紫',
      ruby: '宝石红',
      gray: '极简黑白'
    }
  },
  help: {
    title: 'Smart JSONL Viewer 帮助',
    close: '关闭',
    fileLoading: {
      title: '📁 文件加载',
      feature1: '快速打开 100MB+ 大文件，后台异步加载',
      feature2: '支持拖拽文件、点击选择或粘贴内容',
      feature3: '自动识别 .jsonl、.json、.ndjson 格式'
    },
    searchFilter: {
      title: '🔍 搜索与过滤',
      feature1: '过滤范围：按行过滤 / 按节点过滤',
      feature2: '匹配模式：模糊匹配 / 完全匹配 / JSONPath',
      feature3: 'JSONPath 示例：$.user.name、$.data[0]、$..content',
      feature4: '支持搜索解码后的内容',
      feature5: '搜索历史记录，快速重复查询'
    },
    smartDecoding: {
      title: '✨ 智能解码',
      feature1: '自动解码转义字符（\\n、\\"、\\t 等）',
      feature2: '解析嵌套的 JSON 字符串',
      feature3: 'JSON/代码语法高亮，Markdown 预览',
      feature4: '点击字段旁的 👁 图标查看解码内容'
    },
    themesSettings: {
      title: '🎨 主题与设置',
      feature1: '亮色/暗色主题快速切换',
      feature2: '5 种配色方案：海洋蓝、森林绿、日落橙、薰衣草紫、宝石红',
      feature3: '自定义预览行数、缩进大小',
      feature4: '灵活的展开深度控制（0-5层或全部展开）'
    },
    moreFeatures: {
      title: '🚀 其他功能',
      feature1: '导出过滤结果为 JSONL 或 JSON 格式',
      feature2: '批量加载，支持"加载更多"',
      feature3: '快速滚动到顶部/底部'
    },
    moreInfo: {
      title: '📖 更多信息',
      content: '访问 GitHub 查看详细文档、提交问题或贡献代码',
      github: 'GitHub 项目主页'
    }
  },
  loading: {
    title: '正在加载 JSONL 文件...',
    subtitle: '请稍候',
    progress: '正在加载...',
    rendering: '正在渲染...'
  },
  result: {
    noResults: '没有找到匹配的结果',
    hint: '尝试使用其他关键字或切换过滤模式',
    displayed: '已显示',
    of: '/',
    lines: '行',
    loadMore: '加载更多',
    loadMoreCount: '行'
  },
  paste: {
    title: '粘贴 JSONL 内容',
    placeholder: '在此粘贴 JSONL 内容...\n每行一个 JSON 对象，例如：\n{"name": "Alice", "age": 25}\n{"name": "Bob", "age": 30}',
    submit: '确定',
    cancel: '取消'
  },
  drag: {
    title: '拖拽文件到此处',
    subtitle: '将加载新文件'
  },
  scroll: {
    toTop: '到顶部',
    toBottom: '到末尾'
  },
  confirm: {
    goHome: '确定要返回首页吗？当前数据将被清空。'
  },
  error: {
    fileRead: '文件读取失败：',
    parse: '无法解析文件内容: ',
    pasteContent: '无法解析粘贴的内容：'
  },
  language: {
    select: '选择语言',
    current: '当前语言'
  },
  decoder: {
    viewFull: '查看完整内容',
    copied: '已复制!',
    copyDecoded: '复制解码内容',
    copyFailed: '复制失败',
    copyFailedRetry: '复制失败，请重试',
    markdownRenderError: 'Markdown 渲染错误',
    title: '解码内容',
    originalContent: '原始内容',
    markdownPreview: 'Markdown 预览',
    showToc: '显示目录',
    hideToc: '隐藏目录',
    selectLanguage: '选择或搜索语言...',
    searchLanguageHint: '选择或输入语言名称进行搜索',
    autoDetectLanguage: '自动检测',
    selectTheme: '选择代码高亮主题',
    showDecoded: '显示解码后的内容',
    showOriginal: '显示原始内容',
    truncated: '（已省略 {count} 行）',
    noMatchingLanguage: '未找到匹配的语言',
    themeLabel: '配色主题：',
    loadingHighlight: '正在加载代码高亮...',
    toc: '目录',
    programmingLanguage: '编程语言：'
  }
}
