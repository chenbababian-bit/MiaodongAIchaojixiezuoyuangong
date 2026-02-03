/**
 * 清理文本中的markdown格式，但保留emoji
 * @param text 原始文本
 * @returns 清理后的文本
 */
export function cleanMarkdown(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // 删除markdown标题标记 (###, ##, #)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // 删除粗体标记 (**)
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');

  // 删除斜体标记 (*)
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');

  // 删除删除线标记 (~~)
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');

  // 删除行内代码标记 (`)
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');

  // 删除代码块标记 (```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // 删除水平分隔线 (---, ___, ***)
  cleaned = cleaned.replace(/^[\-_*]{3,}\s*$/gm, '');

  // 删除引用标记 (>)
  cleaned = cleaned.replace(/^>\s+/gm, '');

  // 删除无序列表标记 (-, *, +)
  cleaned = cleaned.replace(/^[\-\*\+]\s+/gm, '');

  // 删除有序列表标记 (1., 2., etc.)
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

  // 删除链接，保留链接文本 [text](url)
  cleaned = cleaned.replace(/\[(.+?)\]\(.+?\)/g, '$1');

  // 删除图片标记 ![alt](url)
  cleaned = cleaned.replace(/!\[.*?\]\(.+?\)/g, '');

  return cleaned;
}
