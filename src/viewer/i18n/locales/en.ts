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
      title: 'File Loading',
      feature1: 'Support 100MB+ large files with fast loading',
      feature2: 'Drag & drop files to open',
      feature3: 'Auto-detect .jsonl, .ndjson files'
    },
    searchFilter: {
      title: 'Search & Filter',
      feature1: 'Keyword Search: Support multiple keywords separated by spaces',
      feature2: 'Regular Expression: Click .* to enable regex mode',
      feature3: 'JSON Path: Use path syntax like user.name',
      feature4: 'Type Filter: Filter by string, number, boolean, object, array'
    },
    smartDecoding: {
      title: 'Smart Decoding',
      feature1: 'Auto-decode nested JSON strings',
      feature2: 'URL encoding/decoding',
      feature3: 'Base64 encoding/decoding',
      feature4: 'Click 👁 icon next to fields to view decoded content'
    },
    themesSettings: {
      title: 'Themes & Settings',
      feature1: 'Light/Dark theme toggle',
      feature2: 'Multiple color schemes (click palette icon)',
      feature3: 'Customize expand depth and indentation'
    },
    moreInfo: {
      title: 'More Information',
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
