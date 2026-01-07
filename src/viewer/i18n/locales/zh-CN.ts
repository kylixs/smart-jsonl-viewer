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
    }
  },
  settings: {
    title: '设置',
    close: '关闭',
    maxLines: '预览行数',
    indentSize: '缩进字符数',
    unlimited: '不限制',
    lines: '行',
    spaces: '个空格'
  },
  theme: {
    toggle: '切换主题',
    light: '切换到亮色主题',
    dark: '切换到暗色主题',
    selectColor: '选择主题配色',
    colors: {
      ocean: '海洋蓝',
      forest: '森林绿',
      sunset: '日落橙',
      purple: '薰衣草紫',
      ruby: '宝石红'
    }
  },
  help: {
    title: 'Smart JSONL Viewer 帮助',
    close: '关闭',
    fileLoading: {
      title: '文件加载',
      feature1: '支持 100MB+ 大文件快速加载',
      feature2: '拖拽文件到页面即可打开',
      feature3: '自动识别 .jsonl、.ndjson 文件'
    },
    searchFilter: {
      title: '搜索与过滤',
      feature1: '关键字搜索：支持多个关键字，用空格分隔',
      feature2: '正则表达式：点击 .* 启用正则模式',
      feature3: 'JSON 路径：使用路径语法如 user.name',
      feature4: '类型过滤：筛选字符串、数字、布尔、对象、数组'
    },
    smartDecoding: {
      title: '智能解码',
      feature1: '自动解码嵌套的 JSON 字符串',
      feature2: 'URL 编码/解码',
      feature3: 'Base64 编码/解码',
      feature4: '点击字段旁的 👁 图标查看解码内容'
    },
    themesSettings: {
      title: '主题与设置',
      feature1: '亮色/暗色主题切换',
      feature2: '多种配色方案（点击调色板图标）',
      feature3: '自定义展开深度和缩进'
    },
    moreInfo: {
      title: '更多信息',
      content: '访问 GitHub Wiki 查看详细文档'
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
  }
}
