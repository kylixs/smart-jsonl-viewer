# 发布 Smart JSONL Viewer 到 Chrome Web Store

本文档详细说明如何将 Smart JSONL Viewer 发布到 Chrome Web Store。

## 📋 前期准备

### 1. 注册开发者账号

- 访问 [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole/)
- 使用 Google 账号登录
- 首次使用需要支付一次性注册费用：**$5 USD**

### 2. 构建和打包扩展

```bash
# 1. 构建生产版本
npm run build

# 2. 打包扩展（创建 ZIP 文件）
cd dist
zip -r ../smart-jsonl-viewer-v1.1.0.zip *
cd ..
```

或者使用项目提供的打包脚本：

```bash
chmod +x package-extension.sh
./package-extension.sh
```

## 🎨 准备宣传材料

### 必需的图片和截图

1. **应用图标**（已准备）
   - 128x128px：`public/icons/icon128.png`
   - 已自动包含在构建中

2. **商店截图**（需要准备）
   - 数量：至少 1 张，最多 5 张
   - 尺寸：1280x800 或 640x400
   - 建议截图内容：
     - 主界面展示 JSONL 文件加载
     - 搜索和过滤功能演示
     - 主题切换展示
     - 智能解码功能演示
     - 大文件快速加载演示

3. **宣传图片**（可选但推荐）
   - 小宣传图：440x280px
   - 大宣传图：920x680px
   - 侯爵图（Marquee）：1400x560px

### 截图建议

建议准备以下主题的截图：
1. **首页**：展示拖拽上传文件的界面
2. **主功能**：展示 JSON 数据展开的列表视图
3. **搜索功能**：展示关键字搜索和高亮
4. **过滤功能**：展示 JSONPath 和类型过滤
5. **主题切换**：展示暗色主题下的界面

## 📝 商店信息准备

### 扩展名称
```
Smart JSONL Viewer
```

### 简短描述（132 字符以内）
```
Quickly open 100MB+ JSONL files with smart decoding of nested JSON/Markdown/Code, advanced filtering (fuzzy/exact/jsonpath), multiple themes
```

### 详细描述（英文）

```markdown
Smart JSONL Viewer is a powerful Chrome extension designed for developers and data analysts who work with JSONL (JSON Lines) files.

## 🚀 Key Features

### Lightning-Fast Performance
- Quickly open and view 100MB+ JSONL files
- Background asynchronous loading with progress indicator
- Optimized memory management for large datasets

### Smart Decoding
- Automatically decode nested JSON strings
- Support Markdown and code block rendering
- URL encoding/decoding
- Base64 encoding/decoding

### Advanced Filtering
- Fuzzy search with keyword highlighting
- Exact match mode
- Regular expression support
- JSONPath queries (e.g., `user.name`, `items[0].id`)
- Type filtering (string, number, boolean, object, array)

### Rich User Experience
- Multiple color themes (Ocean Blue, Forest Green, Sunset Orange, etc.)
- Light/Dark mode toggle
- Customizable display settings
- Export filtered results to JSONL or JSON format
- Drag & drop file upload
- Paste content directly

## 💡 Perfect For

- Log file analysis
- API response debugging
- Large dataset inspection
- ML training data review
- JSON data exploration
- Development and testing

## 🔒 Privacy & Security

- No data upload - Everything runs locally in your browser
- No data collection - We respect your privacy
- Open source - Transparent and trustworthy

## 📖 How to Use

1. Click the extension icon or open a .jsonl file
2. Drag & drop your JSONL file or paste content
3. Use search and filter tools to find what you need
4. Export filtered results if needed

Visit our [GitHub Wiki](https://github.com/kylixs/smart-jsonl-viewer) for detailed documentation.
```

### 分类选择
- **主要类别**：Developer Tools（开发者工具）
- **次要类别**：Productivity（生产力）

### 语言支持
- 英语（English）
- 中文简体（简体中文）
- 德语（Deutsch）
- 法语（Français）
- 西班牙语（Español）

### 隐私声明

```
Privacy Policy

This extension does not collect, store, or transmit any user data. All file processing and data viewing happens entirely in your local browser. We respect your privacy and do not track your usage.

Features:
- No data collection
- No user tracking
- No external network requests
- All processing is local
- No cookies or analytics

Your files remain private and secure on your device.
```

## 📤 提交流程

### 1. 登录开发者控制台

访问 https://chrome.google.com/webstore/devconsole/

### 2. 创建新项目

1. 点击 "New item"（新建项）
2. 上传 `smart-jsonl-viewer-v1.1.0.zip`
3. 系统会自动验证 manifest.json

### 3. 填写商店信息

按照上面准备的内容填写：
- 扩展名称
- 简短描述
- 详细描述
- 分类
- 语言
- 隐私政策

### 4. 上传图片资源

1. 上传应用图标（已在 ZIP 中）
2. 上传至少 1 张截图
3. 上传宣传图片（可选）

### 5. 定价和分发

- **定价**：免费
- **地区**：所有地区（或选择特定地区）
- **可见性**：公开

### 6. 提交审核

1. 检查所有信息是否完整
2. 点击 "Submit for review"（提交审核）
3. 等待审核（通常 1-3 个工作日）

## 🔄 版本更新

### 更新扩展的步骤

1. 修改代码后，更新 `public/manifest.json` 中的版本号：
   ```json
   {
     "version": "1.2.0"
   }
   ```

2. 重新构建和打包：
   ```bash
   npm run build
   ./package-extension.sh
   ```

3. 在开发者控制台上传新的 ZIP 文件

4. 填写更新说明（Change Log）

5. 提交审核

### 版本号规则

遵循语义化版本（Semantic Versioning）：
- **主版本号**（Major）：重大功能变更或不兼容的 API 修改
- **次版本号**（Minor）：新增功能，向后兼容
- **修订号**（Patch）：Bug 修复和小改进

## 📊 发布后管理

### 监控和分析

在开发者控制台可以查看：
- 用户安装数量
- 用户评分和评论
- 崩溃报告
- 使用统计

### 回复用户评论

- 及时回复用户反馈
- 解决用户报告的问题
- 感谢积极的评价

### 持续改进

- 根据用户反馈优化功能
- 修复 Bug
- 添加新功能
- 保持与 Chrome 浏览器的兼容性

## 🚨 常见问题

### 审核被拒绝怎么办？

1. 仔细阅读拒绝原因
2. 根据要求修改代码或描述
3. 重新提交审核

### 常见拒绝原因

- 权限请求过多
- 描述与功能不符
- 违反内容政策
- 代码混淆或恶意代码
- 隐私政策不明确

### 如何加快审核速度？

- 提供清晰的描述和截图
- 确保代码质量
- 遵守所有政策
- 首次提交可能需要更长时间

## 📞 支持和帮助

- **GitHub Issues**：https://github.com/kylixs/smart-jsonl-viewer/issues
- **Chrome Web Store 帮助中心**：https://support.google.com/chrome_webstore/
- **开发者政策**：https://developer.chrome.com/docs/webstore/program-policies/

## 📄 相关链接

- [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole/)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [项目 GitHub](https://github.com/kylixs/smart-jsonl-viewer)

---

最后更新时间：2026-01-07
版本：1.1.0
