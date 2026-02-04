import { supabase } from './supabase';

// ============================================
// 类型定义
// ============================================

// 小红书细粒度类型
export type XiaohongshuType =
  | 'xiaohongshu-travel'
  | 'xiaohongshu-copywriting'
  | 'xiaohongshu-title'
  | 'xiaohongshu-profile'
  | 'xiaohongshu-seo'
  | 'xiaohongshu-style'
  | 'xiaohongshu-product'
  | 'xiaohongshu-recommendation';

// 公众号细粒度类型
export type WechatType =
  | 'wechat-article'
  | 'wechat-continue'
  | 'wechat-title'
  | 'wechat-clickbait';

// 对话类型
export type ConversationType = 'qa' | 'role' | XiaohongshuType | WechatType;

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  type: ConversationType;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// ============================================
// 对话（Conversation）相关函数
// ============================================

/**
 * 创建新对话
 */
export async function createConversation(
  userId: string,
  title: string,
  type: ConversationType = 'qa'
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title,
        type,
      })
      .select()
      .single();

    if (error) {
      console.error('创建对话失败:', error);
      throw new Error('创建对话失败');
    }

    return data.id;
  } catch (error) {
    console.error('创建对话异常:', error);
    throw error;
  }
}

/**
 * 获取用户的所有对话列表
 * @param userId 用户ID
 * @param type 精确匹配的对话类型（可选）
 * @param typePrefix 类型前缀过滤（可选），例如 'xiaohongshu' 会匹配所有 xiaohongshu-* 类型
 */
export async function getConversations(
  userId: string,
  type?: ConversationType,
  typePrefix?: string
): Promise<Conversation[]> {
  try {
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    } else if (typePrefix) {
      query = query.like('type', `${typePrefix}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取对话列表失败:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('获取对话列表异常:', error);
    return [];
  }
}

/**
 * 获取单个对话详情（包含消息）
 */
export async function getConversationWithMessages(
  conversationId: string
): Promise<ConversationWithMessages | null> {
  try {
    // 获取对话信息
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('获取对话失败:', convError);
      return null;
    }

    // 获取对话的所有消息
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('获取消息失败:', msgError);
      return null;
    }

    return {
      ...conversation,
      messages: messages || [],
    };
  } catch (error) {
    console.error('获取对话详情异常:', error);
    return null;
  }
}

/**
 * 更新对话标题
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) {
      console.error('更新对话标题失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('更新对话标题异常:', error);
    return false;
  }
}

/**
 * 删除对话（会级联删除所有消息）
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('删除对话失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('删除对话异常:', error);
    return false;
  }
}

/**
 * 删除所有对话
 * @param userId 用户ID
 * @param type 精确匹配的对话类型（可选）
 * @param typePrefix 类型前缀过滤（可选），例如 'xiaohongshu' 会匹配所有 xiaohongshu-* 类型
 */
export async function deleteAllConversations(
  userId: string,
  type?: ConversationType,
  typePrefix?: string
): Promise<boolean> {
  try {
    let query = supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    } else if (typePrefix) {
      query = query.like('type', `${typePrefix}%`);
    }

    const { error } = await query;

    if (error) {
      console.error('删除所有对话失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('删除所有对话异常:', error);
    return false;
  }
}

// ============================================
// 消息（Message）相关函数
// ============================================

/**
 * 添加消息到对话
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('添加消息失败:', error);
      return null;
    }

    // 更新对话的 updated_at 时间
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('添加消息异常:', error);
    return null;
  }
}

/**
 * 批量添加消息
 */
export async function addMessages(
  conversationId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<Message[]> {
  try {
    const messagesToInsert = messages.map(msg => ({
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
    }));

    const { data, error } = await supabase
      .from('messages')
      .insert(messagesToInsert)
      .select();

    if (error) {
      console.error('批量添加消息失败:', error);
      return [];
    }

    // 更新对话的 updated_at 时间
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data || [];
  } catch (error) {
    console.error('批量添加消息异常:', error);
    return [];
  }
}

/**
 * 获取对话的所有消息
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('获取消息失败:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('获取消息异常:', error);
    return [];
  }
}

// ============================================
// 工具函数
// ============================================

/**
 * 根据第一条用户消息生成对话标题
 */
export function generateConversationTitle(firstMessage: string): string {
  // 取前30个字符作为标题
  const maxLength = 30;
  if (firstMessage.length <= maxLength) {
    return firstMessage;
  }
  return firstMessage.substring(0, maxLength) + '...';
}

/**
 * 根据小红书模板ID获取对应的对话类型
 * @param templateId 模板ID
 * @returns 对应的小红书对话类型
 */
export function getXiaohongshuTypeByTemplateId(templateId: number): XiaohongshuType {
  const templateMap: Record<number, XiaohongshuType> = {
    101: 'xiaohongshu-travel',        // 旅游攻略
    102: 'xiaohongshu-copywriting',   // 爆款文案
    103: 'xiaohongshu-title',         // 爆款标题
    104: 'xiaohongshu-profile',       // 个人简介
    105: 'xiaohongshu-seo',           // SEO优化
    106: 'xiaohongshu-style',         // 风格改写
    107: 'xiaohongshu-product',       // 产品种草
    108: 'xiaohongshu-recommendation', // 好物推荐
  };

  const type = templateMap[templateId];
  if (!type) {
    console.warn(`未知的小红书模板ID: ${templateId}，使用默认类型 xiaohongshu-copywriting`);
    return 'xiaohongshu-copywriting';
  }

  return type;
}

/**
 * 根据公众号模板ID获取对应的对话类型
 * @param templateId 模板ID
 * @returns 对应的公众号对话类型
 */
export function getWechatTypeByTemplateId(templateId: number): WechatType {
  const templateMap: Record<number, WechatType> = {
    201: 'wechat-article',    // 公众号文章撰写
    202: 'wechat-continue',   // 公众号文本续写
    203: 'wechat-title',      // 公众号标题
    205: 'wechat-clickbait',  // 公众号标题党
  };

  const type = templateMap[templateId];
  if (!type) {
    console.warn(`未知的公众号模板ID: ${templateId}，使用默认类型 wechat-article`);
    return 'wechat-article';
  }

  return type;
}
