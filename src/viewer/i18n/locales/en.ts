export default {
  app: {
    title: 'Smart JSONL Viewer',
    home: 'Home',
    help: 'Help',
    settings: 'Settings',
    export: 'Export',
    github: 'GitHub Project'
  },
  upload: {
    title: 'Drag & drop file here',
    subtitle: 'Supports .jsonl, .json, .ndjson formats',
    button: 'Click to select file',
    or: 'or',
    paste: 'Press Ctrl+V to paste content'
  },
  search: {
    placeholder: 'Search keywords...',
    mode: {
      fuzzy: 'Fuzzy Match',
      exact: 'Exact Match',
      regex: 'Regular Expression',
      jsonpath: 'JSON Path'
    },
    typeFilter: 'Type Filter',
    types: {
      all: 'All',
      string: 'String',
      number: 'Number',
      boolean: 'Boolean',
      object: 'Object',
      array: 'Array'
    }
  },
  settings: {
    title: 'Settings',
    close: 'Close',
    maxLines: 'Preview Lines',
    indentSize: 'Indent Size',
    unlimited: 'Unlimited',
    lines: 'lines',
    spaces: 'spaces'
  },
  theme: {
    toggle: 'Toggle Theme',
    light: 'Switch to Light Theme',
    dark: 'Switch to Dark Theme',
    selectColor: 'Select Theme Color',
    colors: {
      ocean: 'Ocean Blue',
      forest: 'Forest Green',
      sunset: 'Sunset Orange',
      purple: 'Lavender Purple',
      ruby: 'Ruby Red'
    }
  },
  help: {
    title: 'Smart JSONL Viewer Help',
    close: 'Close',
    fileLoading: {
      title: '📁 File Loading',
      feature1: 'Quickly open 100MB+ large files with background async loading',
      feature2: 'Support drag & drop, click to select, or paste content',
      feature3: 'Auto-detect .jsonl, .json, .ndjson formats'
    },
    searchFilter: {
      title: '🔍 Search & Filter',
      feature1: 'Filter scope: By line / By node',
      feature2: 'Match mode: Fuzzy / Exact / JSONPath',
      feature3: 'JSONPath examples: $.user.name, $.data[0], $..content',
      feature4: 'Search in decoded content',
      feature5: 'Search history for quick repeated queries'
    },
    smartDecoding: {
      title: '✨ Smart Decoding',
      feature1: 'Auto-detect and decode nested JSON strings',
      feature2: 'Base64 encoding/decoding',
      feature3: 'URL encoding/decoding',
      feature4: 'Click 👁 icon next to fields to view decoded content'
    },
    themesSettings: {
      title: '🎨 Themes & Settings',
      feature1: 'Quick toggle between light/dark themes',
      feature2: '5 color schemes: Ocean Blue, Forest Green, Sunset Orange, Lavender Purple, Ruby Red',
      feature3: 'Customize preview lines and indent size',
      feature4: 'Flexible expand depth control (0-5 levels or full expand)'
    },
    moreFeatures: {
      title: '🚀 More Features',
      feature1: 'Export filtered results as JSONL or JSON format',
      feature2: 'Batch loading with "Load More" support',
      feature3: 'Quick scroll to top/bottom',
      feature4: 'Multi-language support: Chinese, English, German, French, Spanish'
    },
    moreInfo: {
      title: '📖 More Information',
      content: 'Visit GitHub Wiki for detailed documentation'
    }
  },
  loading: {
    title: 'Loading JSONL file...',
    subtitle: 'Please wait',
    progress: 'Loading...',
    rendering: 'Rendering...'
  },
  result: {
    noResults: 'No matching results found',
    hint: 'Try using other keywords or switch filter mode',
    displayed: 'Displayed',
    of: '/',
    lines: 'lines',
    loadMore: 'Load More',
    loadMoreCount: 'lines'
  },
  paste: {
    title: 'Paste JSONL Content',
    placeholder: 'Paste JSONL content here...\nOne JSON object per line, for example:\n{"name": "Alice", "age": 25}\n{"name": "Bob", "age": 30}',
    submit: 'Submit',
    cancel: 'Cancel'
  },
  drag: {
    title: 'Drag file here',
    subtitle: 'Will load new file'
  },
  scroll: {
    toTop: 'To Top',
    toBottom: 'To Bottom'
  },
  confirm: {
    goHome: 'Are you sure to return to home? Current data will be cleared.'
  },
  error: {
    fileRead: 'File read failed: ',
    parse: 'Unable to parse file content: ',
    pasteContent: 'Unable to parse pasted content: '
  },
  language: {
    select: 'Select Language',
    current: 'Current Language'
  }
}
