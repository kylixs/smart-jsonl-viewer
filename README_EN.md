# JSONL Viewer - Chrome Extension

English | [简体中文](./README.md)

**Smart JSONL Viewer** - Support 100MB+ large files, drag & drop to open, intelligent decoding of nested JSON/Markdown/Code, advanced filtering

## ✨ Key Features

- 🚀 **High Performance Loading**: Support 100MB+ super large JSONL files, instant first screen
- 📁 **Drag & Drop Upload**: Directly drag files to browser window, no button clicking required
- 🔍 **Smart Decoding**: Auto-detect and decode nested JSON, Markdown, code (with syntax highlighting)
- 🎯 **Advanced Filtering**: Support fuzzy search, exact match, JSONPath query
- 🌓 **Multiple Themes**: 8 built-in code themes, light/dark mode support
- 🌍 **Multi-language**: 简体中文, 繁體中文, English, Deutsch, Français, Español

## Features

### 1. 🚀 High Performance Large File Support

- **Fast Loading**: 100MB files open instantly, incremental parsing without blocking UI
- **Low Memory Usage**: Smart caching mechanism, optimized memory consumption
- **Smooth Scrolling**: Virtual list rendering, support for hundreds of thousands of rows
- **Background Parsing**: Fast first screen display, remaining content loaded in background

### 2. 📂 Convenient File Management

- **Drag & Drop Upload**: Drag `.jsonl`, `.json`, `.ndjson` files directly to window
- **Click Upload**: Support traditional file picker
- **New Tab Opening**: Fill entire browser window, maximize display space
- **Export Function**: Export filtered data as JSONL/JSON format

### 3. 🔍 Smart String Decoding

- **Recursive Decoding**: Auto-detect and recursively decode nested JSON strings
- **Escape Characters**: Support `\n`, `\"`, `\t`, `\\` and other escape character decoding
- **Markdown Preview**: Auto-detect and render Markdown content (code highlighting, tables, TOC)
- **Code Highlighting**: Support 100+ programming languages syntax highlighting (Shiki engine)
- **Original/Decoded Toggle**: One-click switch between original and decoded content
- **One-click Copy**: Copy decoded content to clipboard

### 4. 🎯 Powerful Search & Filter

- **Three Match Modes**:
  - Fuzzy match: Contains keyword
  - Exact match: Full word match
  - JSONPath: Use JSONPath expression for precise query
- **Two Filter Scopes**:
  - Filter by line: Show entire lines containing keyword
  - Filter by node: Show only matching leaf nodes and their paths
- **Search History**: Auto-save search records, quick reuse
- **WYSIWYG**: In auto-decode mode, search in decoded content

### 5. 📊 Expand/Collapse Control

- **Line-level Expand**: JSON Lines row-level expand/collapse
- **Node Expand**: JSON object/array hierarchical expand/collapse
- **Depth Control**: Set expand depth (1-5 levels or all)
- **Batch Operations**: One-click expand/collapse all

### 6. 🎨 Themes & Interface

- **8 Code Themes**:
  - GitHub Light/Dark
  - Monokai
  - Dracula
  - Nord
  - One Dark Pro
  - Solarized Light/Dark
- **Light/Dark Mode**: Follow system or manual toggle
- **VSCode Style**: Familiar syntax highlighting colors
- **Real-time Stats**: Display total lines, filtered lines, etc.

### 7. 🌍 Internationalization

- 简体中文 (zh-CN)
- 繁體中文 (zh-TW)
- English (en)
- Deutsch (de)
- Français (fr)
- Español (es)

### 8. 🌐 Web Interception

- Auto-detect and beautify JSONL/JSON API responses in web pages
- JSONView-like seamless integration experience
- Support all viewer features for analysis

## Installation

### Install from Chrome Web Store (Recommended)

*Coming soon...*

### Install from Source

1. Clone repository:
```bash
git clone https://github.com/your-username/jsonline-viewer.git
cd jsonline-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Build extension:
```bash
npm run build
```

4. Load extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

## Usage

### View Local Files

**Method 1: Drag & Drop (Recommended)**
1. Click extension icon to open viewer
2. Directly drag JSONL/JSON files to window
3. Files auto-parsed and displayed

**Method 2: Click Upload**
1. Click extension icon to open viewer
2. Click "Open File" button
3. Select `.jsonl`, `.json`, `.ndjson` files

### View Web Response

1. Visit web pages returning JSONL/JSON
2. Extension auto-detects and beautifies display
3. Use all viewer features for analysis

### Search Tips

**Basic Search**
- Enter keyword for auto fuzzy match
- Check "Auto Decode" to search in decoded content

**JSONPath Query**
```
$.user.name              # Find all user.name fields
$.data[0]                # Find first element of data array
$.items[*]               # Find all elements of items array
$..content               # Recursively find all content fields
```

**Filter Scope**
- **Filter by Line**: Quickly find lines containing keyword
- **Filter by Node**: Precisely locate specific fields, hide irrelevant data

## Development

### Development Mode

```bash
npm run dev
```

Load the `dist` directory in browser, code changes will auto-rebuild.

### Build Production

```bash
npm run build
```

### Project Structure

```
jsonline-viewer/
├── src/
│   ├── viewer/                 # Main viewer interface
│   │   ├── components/        # Vue components
│   │   │   ├── JsonLineItem.vue    # Single JSON line component
│   │   │   ├── JsonTree.vue        # JSON tree structure
│   │   │   ├── StringDecoder.vue   # String decoder
│   │   │   └── SearchFilter.vue    # Search filter
│   │   ├── stores/            # Pinia state management
│   │   │   └── jsonlStore.ts       # Core state management
│   │   ├── utils/             # Utility functions
│   │   │   ├── decoder.ts          # Decoding logic
│   │   │   ├── filter.ts           # Filter logic
│   │   │   ├── parser.ts           # JSONL parser
│   │   │   └── markdown.ts         # Markdown renderer
│   │   ├── i18n/              # Internationalization
│   │   ├── App.vue            # Main app
│   │   └── main.ts            # Entry file
│   ├── content/               # Content Script
│   │   └── content.ts         # Web interception script
│   └── background/            # Background Script
│       └── background.ts      # Background service
├── public/
│   ├── manifest.json          # Chrome extension config
│   ├── viewer.html            # Viewer HTML
│   └── icons/                 # Icon resources
├── docs/                      # Documentation
│   └── 技术方案.md            # Technical design doc
└── dist/                      # Build output
```

## Tech Stack

- **Framework**: Vue 3 (Composition API) + TypeScript
- **Build**: Vite 5
- **State Management**: Pinia
- **I18n**: Vue I18n
- **Markdown**: Marked + Highlight.js + Mermaid
- **Code Highlighting**: Shiki (VS Code engine)
- **Styles**: Native CSS (lightweight, < 500KB)

## Performance Optimization

- **Incremental Parsing**: First 100 rows displayed immediately, rest parsed in background
- **Lazy Loading**: Only parse child nodes when expanded
- **Virtual Scrolling**: Only render visible DOM nodes
- **Caching Mechanism**: Pre-compute decode results, avoid repeated parsing
- **Web Worker**: Background thread for large file parsing

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Known Issues

- Single JSON object over 10MB may cause slow decoding
- JSON with over 1000 nested levels will be truncated (prevent stack overflow)

## Roadmap

- [ ] Support CSV format
- [ ] Diff mode (compare two JSONL files)
- [ ] Custom color schemes
- [ ] Export to Excel/CSV
- [ ] Support more programming language syntax highlighting

## License

MIT License - See [LICENSE](LICENSE) file for details

## Contributing

Issues and Pull Requests are welcome!

### Contributing Guide

1. Fork this repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Acknowledgments

- [Vue 3](https://vuejs.org/) - Progressive JavaScript Framework
- [Vite](https://vitejs.dev/) - Next Generation Frontend Build Tool
- [Shiki](https://shiki.matsu.io/) - Syntax Highlighter
- [Marked](https://marked.js.org/) - Markdown Parser
- [Mermaid](https://mermaid.js.org/) - Diagram Rendering Engine

---

📝 For more technical details, see [docs/技术方案.md](docs/技术方案.md)

💡 For usage tips and best practices, see [Wiki](https://github.com/your-username/jsonline-viewer/wiki)
