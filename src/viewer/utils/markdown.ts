/**
 * Markdown 检测和渲染工具
 * 使用 markdown-it 作为核心渲染器，支持 Mermaid 图表
 * 优化策略：按需加载 markdown-it，提升初始加载速度
 */

import type MarkdownIt from 'markdown-it'

/**
 * 标题项接口
 */
export interface TocItem {
  id: string
  text: string
  level: number
}

/**
 * markdown-it 实例（延迟加载）
 */
let mdInstance: MarkdownIt | null = null

/**
 * 获取或创建 markdown-it 实例（仅在首次调用时加载）
 */
async function getMarkdownInstance(): Promise<MarkdownIt> {
  if (!mdInstance) {
    const MarkdownItModule = await import('markdown-it')
    const MarkdownIt = MarkdownItModule.default

    mdInstance = new MarkdownIt({
      html: true, // 允许HTML标签
      linkify: true, // 自动转换URL为链接
      typographer: true, // 启用智能引号和其他排版替换
      breaks: false, // 不将单个换行符转换为<br>（符合标准Markdown）
    })

    // 自定义渲染规则：为标题添加ID
    mdInstance.renderer.rules.heading_open = (tokens, idx) => {
      const token = tokens[idx]
      const nextToken = tokens[idx + 1]

      if (nextToken && nextToken.type === 'inline') {
        const text = nextToken.content
        const id = generateHeadingId(text)
        const level = token.markup.length
        return `<h${level} id="${id}">`
      }

      const level = token.markup.length
      return `<h${level}>`
    }

    // 自定义代码块渲染：标记 Mermaid 代码块
    const defaultFence = mdInstance.renderer.rules.fence!
    mdInstance.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx]
      const lang = token.info.trim()

      // 如果是 mermaid 代码块，添加特殊标记
      if (lang === 'mermaid') {
        return `<pre class="mermaid">${token.content}</pre>`
      }

      // 其他代码块使用默认渲染
      return defaultFence(tokens, idx, options, env, self)
    }
  }

  return mdInstance
}

/**
 * 生成目录结构（异步）
 */
export async function generateToc(markdown: string): Promise<TocItem[]> {
  if (!markdown) return []

  const md = await getMarkdownInstance()
  const toc: TocItem[] = []
  const tokens = md.parse(markdown, {})

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.substring(1)) // h1 -> 1, h2 -> 2, etc.
      const nextToken = tokens[i + 1]

      if (nextToken && nextToken.type === 'inline') {
        const rawText = nextToken.content
        const text = stripMarkdownFormatting(rawText)
        const id = generateHeadingId(rawText)

        toc.push({ id, text, level })
      }
    }
  }

  return toc
}

/**
 * 从文本生成标题 ID
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留字母、数字、中文、空格和连字符
    .replace(/\s+/g, '-') // 空格转连字符
    .replace(/-+/g, '-') // 多个连字符合并为一个
    .replace(/^-|-$/g, '') // 移除首尾连字符
    || 'heading'
}

/**
 * 清理标题文本中的 Markdown 格式标记
 * 用于目录显示，去除粗体、斜体、代码等格式
 */
function stripMarkdownFormatting(text: string): string {
  let cleaned = text

  // 移除图片 ![alt](url)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

  // 移除链接 [text](url)，保留文本
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // 移除粗体 **text** 和 __text__
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1')
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1')

  // 移除斜体 *text* 和 _text_
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1')
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1')

  // 移除删除线 ~~text~~
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1')

  // 移除行内代码 `code`
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1')

  return cleaned.trim()
}

/**
 * 检测文本是否可能是 Markdown 格式
 */
export function isMarkdown(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }

  const trimmed = text.trim()
  const firstLine = trimmed.split('\n')[0] || ''

  // 如果以 shebang 开头，肯定不是 Markdown，而是脚本代码
  if (firstLine.startsWith('#!')) {
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
 * 使用 markdown-it 渲染 Markdown（异步）
 * 支持 Mermaid 图表（需要配合前端 mermaid 库渲染）
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  if (!markdown) return ''

  try {
    const md = await getMarkdownInstance()
    return md.render(markdown)
  } catch (err) {
    console.error('Markdown rendering error:', err)
    return `<p>Markdown 渲染错误: ${(err as Error).message}</p>`
  }
}
