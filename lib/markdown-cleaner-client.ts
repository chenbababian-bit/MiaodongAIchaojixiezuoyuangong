/**
 * 客户端版本：清理文本中的markdown格式，但保留emoji
 * @param text 原始文本
 * @returns 清理后的文本
 */
export function cleanMarkdownClient(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // 删除代码块标记 (```) - 先处理以避免代码块内容被误处理
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // 删除行内代码标记 (`)
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // 删除粗体标记 (**) - 使用更强大的正则，处理所有情况
  // 多次运行以确保嵌套的粗体标记也被清理
  for (let i = 0; i < 3; i++) {
    cleaned = cleaned.replace(/\*\*([^*]+?)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*\*\s+([^*]+?)\s+\*\*/g, '$1');
    cleaned = cleaned.replace(/\*\*([^*]*?)\*\*/g, '$1');
  }

  // 删除斜体标记 (*) - 处理单个星号
  cleaned = cleaned.replace(/\*([^*\s][^*]*?)\*/g, '$1');
  cleaned = cleaned.replace(/\*\s+([^*]+?)\s+\*/g, '$1');

  // 删除删除线标记 (~~)
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');

  // 删除markdown标题标记 (###, ##, #) - 支持标题后紧跟其他内容
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');

  // 删除水平分隔线 (---, ___, ***)
  cleaned = cleaned.replace(/^[\-_*]{3,}\s*$/gm, '');
  // 删除单独一行的 ---
  cleaned = cleaned.replace(/^\s*---\s*$/gm, '');

  // 删除引用标记 (>)
  cleaned = cleaned.replace(/^>\s*/gm, '');

  // 删除无序列表标记 (-, *, +) - 只删除行首的
  cleaned = cleaned.replace(/^[\-\*\+]\s+/gm, '');

  // 删除有序列表标记 (1., 2., etc.)
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

  // 删除链接，保留链接文本 [text](url)
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 删除图片标记 ![alt](url)
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

  // 清理多余的空行（超过2个连续空行的情况）
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 最后再清理一次可能残留的星号
  cleaned = cleaned.replace(/\*\*/g, '');

  return cleaned;
}
