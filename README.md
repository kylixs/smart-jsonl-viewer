# JSONL Viewer - Chrome Extension

智能 JSONL 查看器 Chrome 扩展，支持字符串解码和高级过滤功能。

## 功能特性

### ✨ 核心功能

1. **展开/折叠**
   - JSON Lines 行级展开/折叠
   - JSON 对象/数组层次结构展开/折叠
   - 🆕 **深度控制**：可设置展开深度（1-5 层或全部）
   - 全部展开/折叠快捷操作

2. **智能字符串解码**
   - 自动识别并递归解码嵌套的 JSON 字符串
   - 支持转义字符解码（`\n`, `\"`, `\t` 等）
   - 原始/解码模式一键切换
   - 可视化标记解码内容
   - 🆕 **一键复制**：复制解码后的内容到剪贴板

3. **强大的搜索过滤**
   - **按行过滤**：显示包含关键字的整行
   - **按节点过滤**：只显示匹配的叶子节点及其路径
   - 支持搜索解码后的内容
   - 实时过滤，即时反馈

4. **双场景支持**
   - 📂 本地文件：上传或拖拽 `.jsonl`、`.json`、`.ndjson` 文件
   - 🌐 网页拦截：自动美化网页中的 JSONL/JSON API 响应

5. **友好的用户体验**
   - 🌙 亮色/暗色主题切换
   - 💾 导出过滤后的数据
   - 🎨 VSCode 风格的语法高亮
   - 📊 实时显示统计信息
   - 🆕 **新标签页打开**：占满整个浏览器窗口
   - 🆕 **快速复制**：整行或单个字段的解码内容

## 安装

### 从源码安装

1. 克隆仓库：
```bash
git clone <repository-url>
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

## 开发

### 开发模式

```bash
npm run dev
```

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
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── utils/             # 工具函数
│   │   ├── App.vue           # 主应用
│   │   └── main.ts           # 入口文件
│   ├── content/              # Content Script
│   └── background/           # Background Script
├── public/
│   ├── manifest.json         # Chrome 扩展配置
│   └── icons/                # 图标资源
├── docs/                     # 文档
└── dist/                     # 构建输出
```

## 使用方法

### 查看本地文件

1. 点击扩展图标打开查看器
2. 拖拽或选择 JSONL/JSON 文件
3. 使用搜索框进行过滤
4. 点击行号展开/折叠内容

### 查看网页响应

1. 访问返回 JSONL/JSON 的网页
2. 扩展会自动识别并美化显示
3. 使用所有查看器功能进行分析

### 搜索技巧

- **按行过滤**：快速找到包含关键字的行
- **按节点过滤**：精确定位到特定字段
- **解码内容搜索**：在转义字符串内部搜索

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建**: Vite
- **状态管理**: Pinia
- **样式**: 原生 CSS (轻量级)

## 浏览器兼容性

- Chrome 88+
- Edge 88+
- 其他基于 Chromium 的浏览器

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

📝 更多文档请查看 [docs/技术方案.md](docs/技术方案.md)
