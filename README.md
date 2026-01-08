# JSONL Viewer - Chrome Extension

[English](./README_EN.md) | 简体中文

**智能 JSONL 查看器** - 支持 100MB+ 大文件，拖放快速打开，智能解码嵌套 JSON/Markdown/Code，高级过滤功能

## ✨ 核心亮点

- 🚀 **高性能加载**：支持 100MB+ 超大 JSONL 文件，首屏秒开
- 📁 **拖放上传**：直接拖拽文件到浏览器窗口，无需点击按钮
- 🔍 **智能解码**：自动识别并解码嵌套 JSON、Markdown、代码（支持语法高亮）
- 🎯 **高级过滤**：支持模糊搜索、完整匹配、JSONPath 查询
- 🌓 **多主题配色**：内置 8 种代码主题，支持亮色/暗色模式
- 🌍 **多语言支持**：中文简体、中文繁体、English、Deutsch、Français、Español

## 功能特性

### 1. 🚀 高性能大文件支持

- **快速加载**：100MB 文件秒开，增量解析不阻塞界面
- **低内存占用**：智能缓存机制，优化内存使用
- **流畅滚动**：虚拟列表渲染，支持数十万行数据
- **后台解析**：首屏快速显示，剩余内容后台加载

### 2. 📂 便捷的文件管理

- **拖放上传**：直接拖拽 `.jsonl`、`.json`、`.ndjson` 文件到窗口
- **点击上传**：支持传统文件选择器
- **新标签页打开**：占满整个浏览器窗口，最大化显示空间
- **导出功能**：导出过滤后的数据为 JSONL/JSON 格式

### 3. 🔍 智能字符串解码

- **递归解码**：自动识别并递归解码嵌套的 JSON 字符串
- **转义字符**：支持 `\n`, `\"`, `\t`, `\\` 等转义字符解码
- **Markdown 预览**：自动检测并渲染 Markdown 内容（支持代码高亮、表格、目录）
- **代码高亮**：支持 100+ 编程语言语法高亮（Shiki 引擎）
- **原始/解码切换**：一键切换查看原始内容或解码后内容
- **一键复制**：复制解码后的内容到剪贴板

### 4. 🎯 强大的搜索过滤

- **三种匹配模式**：
  - 模糊匹配：包含即可
  - 完整匹配：完整单词匹配
  - JSONPath：使用 JSONPath 表达式精确查询
- **两种过滤范围**：
  - 按行过滤：显示包含关键字的整行
  - 按节点过滤：只显示匹配的叶子节点及其路径
- **搜索历史**：自动保存搜索记录，支持快速复用
- **所看即所得**：自动解码模式下，搜索解码后的内容

### 5. 📊 展开/折叠控制

- **行级展开**：JSON Lines 行级展开/折叠
- **节点展开**：JSON 对象/数组层次结构展开/折叠
- **深度控制**：可设置展开深度（1-5 层或全部）
- **全部操作**：一键全部展开/折叠

### 6. 🎨 主题与界面

- **8 种代码主题**：
  - GitHub Light/Dark
  - Monokai
  - Dracula
  - Nord
  - One Dark Pro
  - Solarized Light/Dark
- **亮色/暗色模式**：跟随系统或手动切换
- **VSCode 风格**：熟悉的语法高亮配色
- **实时统计**：显示总行数、过滤后行数等信息

### 7. 🌍 国际化支持

- 中文简体 (zh-CN)
- 中文繁体 (zh-TW)
- English (en)
- Deutsch (de)
- Français (fr)
- Español (es)

### 8. 🌐 网页拦截

- 自动识别并美化网页中的 JSONL/JSON API 响应
- 类似 JSONView 的无缝集成体验
- 支持所有查看器功能进行分析

## 安装

### 从 Chrome Web Store 安装（推荐）

*即将上线...*

### 从源码安装

1. 克隆仓库：
```bash
git clone https://github.com/your-username/jsonline-viewer.git
cd jsonline-viewer
```

2. 安装依赖：
```bash
npm install
```

3. 构建扩展：
```bash
npm run build
```

4. 在 Chrome 中加载扩展：
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `dist` 目录

## 使用方法

### 查看本地文件

**方式一：拖放上传（推荐）**
1. 点击扩展图标打开查看器
2. 直接拖拽 JSONL/JSON 文件到窗口
3. 文件自动解析并显示

**方式二：点击上传**
1. 点击扩展图标打开查看器
2. 点击"打开文件"按钮
3. 选择 `.jsonl`、`.json`、`.ndjson` 文件

### 查看网页响应

1. 访问返回 JSONL/JSON 的网页
2. 扩展会自动识别并美化显示
3. 使用所有查看器功能进行分析

### 搜索技巧

**基础搜索**
- 输入关键字，自动模糊匹配
- 勾选"自动解码"在解码后的内容中搜索

**JSONPath 查询**
```
$.user.name              # 查找所有 user.name 字段
$.data[0]                # 查找 data 数组的第一个元素
$.items[*]               # 查找 items 数组的所有元素
$..content               # 递归查找所有 content 字段
```

**过滤范围**
- **按行过滤**：快速找到包含关键字的行
- **按节点过滤**：精确定位到特定字段，隐藏无关数据

## 开发

### 开发模式

```bash
npm run dev
```

在浏览器中加载 `dist` 目录，修改代码后会自动重新构建。

### 构建生产版本

```bash
npm run build
```

### 项目结构

```
jsonline-viewer/
├── src/
│   ├── viewer/                 # 查看器主界面
│   │   ├── components/        # Vue 组件
│   │   │   ├── JsonLineItem.vue    # 单行 JSON 组件
│   │   │   ├── JsonTree.vue        # JSON 树形结构
│   │   │   ├── StringDecoder.vue   # 字符串解码器
│   │   │   └── SearchFilter.vue    # 搜索过滤器
│   │   ├── stores/            # Pinia 状态管理
│   │   │   └── jsonlStore.ts       # 核心状态管理
│   │   ├── utils/             # 工具函数
│   │   │   ├── decoder.ts          # 解码逻辑
│   │   │   ├── filter.ts           # 过滤逻辑
│   │   │   ├── parser.ts           # JSONL 解析
│   │   │   └── markdown.ts         # Markdown 渲染
│   │   ├── i18n/              # 国际化
│   │   ├── App.vue            # 主应用
│   │   └── main.ts            # 入口文件
│   ├── content/               # Content Script
│   │   └── content.ts         # 网页拦截脚本
│   └── background/            # Background Script
│       └── background.ts      # 后台服务
├── public/
│   ├── manifest.json          # Chrome 扩展配置
│   ├── viewer.html            # 查看器 HTML
│   └── icons/                 # 图标资源
├── docs/                      # 文档
│   └── 技术方案.md            # 技术设计文档
└── dist/                      # 构建输出
```

## 技术栈

- **框架**: Vue 3 (Composition API) + TypeScript
- **构建**: Vite 5
- **状态管理**: Pinia
- **国际化**: Vue I18n
- **Markdown**: Marked + Highlight.js + Mermaid
- **代码高亮**: Shiki (VS Code 引擎)
- **样式**: 原生 CSS (轻量级，< 500KB)

## 性能优化

- **增量解析**：首批 100 行立即显示，剩余后台解析
- **懒加载解码**：仅在展开节点时才解析子节点
- **虚拟滚动**：仅渲染可见区域的 DOM 节点
- **缓存机制**：预计算解码结果，避免重复解析
- **Web Worker**：后台线程处理大文件解析

## 浏览器兼容性

- Chrome 88+
- Edge 88+
- 其他基于 Chromium 的浏览器

## 已知问题

- 单个 JSON 对象超过 10MB 可能导致解码缓慢
- 超过 1000 层嵌套的 JSON 会被截断（防止栈溢出）

## 路线图

- [ ] 支持 CSV 格式
- [ ] Diff 模式（对比两个 JSONL 文件）
- [ ] 自定义配色方案
- [ ] 导出为 Excel/CSV
- [ ] 支持更多编程语言语法高亮

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 致谢

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Shiki](https://shiki.matsu.io/) - 语法高亮引擎
- [Marked](https://marked.js.org/) - Markdown 解析器
- [Mermaid](https://mermaid.js.org/) - 图表渲染引擎

---

📝 更多技术细节请查看 [docs/技术方案.md](docs/技术方案.md)

💡 使用技巧和最佳实践请查看 [Wiki](https://github.com/your-username/jsonline-viewer/wiki)
