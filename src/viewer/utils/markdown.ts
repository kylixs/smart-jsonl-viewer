/**
 * Markdown 检测和渲染工具
 * 轻量级实现，无需额外依赖
 */

/**
 * 检测文本是否可能是 Markdown 格式
 */
export function isMarkdown(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }

  // Markdown 特征模式
  const markdownPatterns = [
    /^#{1,6}\s+.+$/m, // 标题 (# Header)
    /^\*{3,}$|^-{3,}$|^_{3,}$/m, // 分隔线
    /^\s*[-*+]\s+.+$/m, // 无序列表
    /^\s*\d+\.\s+.+$/m, // 有序列表
    /\[.+\]\(.+\)/, // 链接 [text](url)
    /!\[.*\]\(.+\)/, // 图片 ![alt](url)
    /`{1,3}[^`]+`{1,3}/, // 代码 `code` 或 ```code```
    /^\s*>\s+.+$/m, // 引用
    /\*\*.+\*\*|\*\*.+\*\*/, // 加粗 **text**
    /\*.+\*|_.+_/, // 斜体 *text* 或 _text_
    /^\s*\|.+\|.+\|$/m, // 表格
  ]

  // 计算匹配到的模式数量
  let matchCount = 0
  for (const pattern of markdownPatterns) {
    if (pattern.test(text)) {
      matchCount++
    }
  }

  // 如果匹配到 2 个或更多特征，认为是 Markdown
  return matchCount >= 2
}

/**
 * 简单的 Markdown 渲染器
 * 支持常见的 Markdown 语法
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''

  let html = markdown

  // 转义 HTML 特殊字符（在处理其他语法之前）
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 代码块（三个反引号）- 必须先处理，避免干扰其他语法
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
  })

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 标题
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // 分隔线
  html = html.replace(/^\s*[-*_]{3,}\s*$/gm, '<hr>')

  // 图片（必须在链接之前处理）
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // 加粗
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  // 斜体
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')

  // 删除线
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')

  // 引用块
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')

  // 无序列表
  const ulRegex = /^(\s*[-*+]\s+.+\n?)+/gm
  html = html.replace(ulRegex, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => {
        const content = line.replace(/^\s*[-*+]\s+/, '')
        return `<li>${content}</li>`
      })
      .join('\n')
    return `<ul>\n${items}\n</ul>`
  })

  // 有序列表
  const olRegex = /^(\s*\d+\.\s+.+\n?)+/gm
  html = html.replace(olRegex, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => {
        const content = line.replace(/^\s*\d+\.\s+/, '')
        return `<li>${content}</li>`
      })
      .join('\n')
    return `<ol>\n${items}\n</ol>`
  })

  // 表格
  const tableRegex = /^\|(.+)\|\n\|[\s:|-]+\|\n((?:\|.+\|\n?)+)/gm
  html = html.replace(tableRegex, (_match, header, rows) => {
    const headerCells = header
      .split('|')
      .filter((cell: string) => cell.trim())
      .map((cell: string) => `<th>${cell.trim()}</th>`)
      .join('')

    const rowsHtml = rows
      .trim()
      .split('\n')
      .map((row: string) => {
        const cells = row
          .split('|')
          .filter((cell: string) => cell.trim())
          .map((cell: string) => `<td>${cell.trim()}</td>`)
          .join('')
        return `<tr>${cells}</tr>`
      })
      .join('\n')

    return `<table>
<thead><tr>${headerCells}</tr></thead>
<tbody>
${rowsHtml}
</tbody>
</table>`
  })

  // 段落 - 将双换行符转换为段落
  html = html.replace(/\n\n+/g, '</p><p>')
  html = `<p>${html}</p>`

  // 清理空段落
  html = html.replace(/<p>\s*<\/p>/g, '')
  html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1')
  html = html.replace(/<p>\s*(<hr>)/g, '$1')
  html = html.replace(/(<hr>)\s*<\/p>/g, '$1')
  html = html.replace(/<p>\s*(<ul>)/g, '$1')
  html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1')
  html = html.replace(/<p>\s*(<ol>)/g, '$1')
  html = html.replace(/(<\/ol>)\s*<\/p>/g, '$1')
  html = html.replace(/<p>\s*(<blockquote>)/g, '$1')
  html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1')
  html = html.replace(/<p>\s*(<pre>)/g, '$1')
  html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1')
  html = html.replace(/<p>\s*(<table>)/g, '$1')
  html = html.replace(/(<\/table>)\s*<\/p>/g, '$1')

  // 单换行符转换为 <br>（在段落内）
  html = html.replace(/\n/g, '<br>')

  return html
}
