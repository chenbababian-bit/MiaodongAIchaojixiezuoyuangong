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

// 今日头条细粒度类型
export type ToutiaoType =
  | 'toutiao-article'
  | 'toutiao-title'
  | 'toutiao-qa'
  | 'toutiao-micro'
  | 'toutiao-outline';

// 微博细粒度类型
export type WeiboType =
  | 'weibo-short'     // 401: 微博短推文
  | 'weibo-long'      // 402: 微博长文
  | 'weibo-title'     // 403: 微博爆款标题
  | 'weibo-name'      // 404: 微博账号名称
  | 'weibo-hotspot'   // 405: 微博热点分析
  | 'weibo-bio'       // 406: 微博账号简介
  | 'weibo-tweet';    // 407: 微博推文

// 知乎细粒度类型
export type ZhihuType =
  | 'zhihu-qa'           // 501: 知乎高赞问答
  | 'zhihu-answer'       // 502: 知乎高赞回答仿写
  | 'zhihu-bio'          // 503: 知乎账号个人简介
  | 'zhihu-tagline'      // 504: 知乎一句话简介
  | 'zhihu-username';    // 505: 知乎账号名称

// 视频文案细粒度类型
export type VideoType =
  | 'video-script-outline'      // 1001: 短视频脚本大纲
  | 'video-viral-copy'          // 1002: 短视频爆款文案
  | 'video-viral-title'         // 1003: 短视频爆款标题
  | 'video-storyboard'          // 1004: 短视频分镜头脚本
  | 'video-golden-3sec'         // 1005: 短视频黄金3秒开头
  | 'video-sales-script'        // 1006: 短视频带货口播文案
  | 'video-soft-ad'             // 1007: 短视频软广脚本
  | 'video-selling-point'       // 1008: 短视频卖点脚本
  | 'video-hard-ad'             // 1009: 短视频硬广脚本
  | 'video-hook-script'         // 1010: 短视频钩子脚本
  | 'video-question-method'     // 1011: 短视频抛问题法
  | 'video-technique-amplify'   // 1012: 短视频技巧放大法
  | 'video-data-proof'          // 1013: 短视频数据佐证法
  | 'video-error-point'         // 1014: 短视频指出错误法
  | 'video-list-method';        // 1015: 短视频列举法

// 私域运营细粒度类型
export type PrivateType =
  | 'private-daily'        // 601: 私域日常文案库
  | 'private-moments'      // 602: 私域朋友圈发文计划库
  | 'private-value'        // 603: 私域价值感文案库
  | 'private-marketing'    // 604: 私域产品营销文案库
  | 'private-reply'        // 605: 私域客户回复助手
  | 'private-event'        // 606: 私域社群活动策划
  | 'private-rules';       // 607: 私域社群规则生成库

// 对话类型
export type ConversationType = 'qa' | 'role' | XiaohongshuType | WechatType | ToutiaoType | WeiboType | ZhihuType | VideoType | PrivateType;

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
    // 新ID (101-108)
    101: 'xiaohongshu-travel',        // 旅游攻略
    102: 'xiaohongshu-copywriting',   // 爆款文案
    103: 'xiaohongshu-title',         // 爆款标题
    104: 'xiaohongshu-profile',       // 个人简介
    105: 'xiaohongshu-seo',           // SEO优化
    106: 'xiaohongshu-style',         // 风格改写
    107: 'xiaohongshu-product',       // 产品种草
    108: 'xiaohongshu-recommendation', // 好物推荐
    // 旧ID (1-8) - 向后兼容
    1: 'xiaohongshu-travel',          // 旧ID: 旅游攻略
    2: 'xiaohongshu-copywriting',     // 旧ID: 爆款文案
    3: 'xiaohongshu-title',           // 旧ID: 爆款标题
    4: 'xiaohongshu-profile',         // 旧ID: 个人简介
    5: 'xiaohongshu-seo',             // 旧ID: SEO优化
    6: 'xiaohongshu-style',           // 旧ID: 风格改写
    7: 'xiaohongshu-product',         // 旧ID: 产品种草
    8: 'xiaohongshu-recommendation',  // 旧ID: 好物推荐
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

/**
 * 根据今日头条模板ID获取对应的对话类型
 * @param templateId 模板ID
 * @returns 对应的今日头条对话类型
 */
export function getToutiaoTypeByTemplateId(templateId: number): ToutiaoType {
  const templateMap: Record<number, ToutiaoType> = {
    301: 'toutiao-article',   // 头条爆文
    302: 'toutiao-title',     // 头条爆款标题
    303: 'toutiao-qa',        // 头条问答
    304: 'toutiao-micro',     // 微头条文案
    305: 'toutiao-outline',   // 头条文章大纲
  };

  const type = templateMap[templateId];
  if (!type) {
    console.warn(`未知的今日头条模板ID: ${templateId}，使用默认类型 toutiao-article`);
    return 'toutiao-article';
  }

  return type;
}

/**
 * 根据微博模板ID获取对应的对话类型
 * @param templateId 模板ID
 * @returns 对应的微博对话类型
 */
export function getWeiboTypeByTemplateId(templateId: number): WeiboType {
  const templateMap: Record<number, WeiboType> = {
    401: 'weibo-short',    // 微博短推文
    402: 'weibo-long',     // 微博长文
    403: 'weibo-title',    // 微博爆款标题
    404: 'weibo-name',     // 微博账号名称
    405: 'weibo-hotspot',  // 微博热点分析
    406: 'weibo-bio',      // 微博账号简介
    407: 'weibo-tweet',    // 微博推文
  };

  const type = templateMap[templateId];
  if (!type) {
    console.warn(`未知的微博模板ID: ${templateId}，使用默认类型 weibo-short`);
    return 'weibo-short';
  }

  return type;
}

/**
 * 根据知乎模板ID获取对应的对话类型
 * @param templateId 模板ID
 * @returns 对应的知乎对话类型
 */
export function getZhihuTypeByTemplateId(templateId: number): ZhihuType {
  const templateMap: Record<number, ZhihuType> = {
    501: 'zhihu-qa',       // 知乎高赞问答
    502: 'zhihu-answer',   // 知乎高赞回答仿写
    503: 'zhihu-bio',      // 知乎账号个人简介
    504: 'zhihu-tagline',  // 知乎一句话简介
    505: 'zhihu-username', // 知乎账号名称
  };

  const type = templateMap[templateId];
  if (!type) {
    console.warn(`未知的知乎模板ID: ${templateId}，使用默认类型 zhihu-qa`);
    return 'zhihu-qa';
  }

  return type;
}

/**
 * 根据视频文案模板ID获取对应的对话类型
 * @param templateId 模板ID
 * @returns 对应的视频对话类型
 */
export function getVideoTypeByTemplateId(templateId: number): VideoType {
  const templateMap: Record<number, VideoType> = {
    1001: 'video-script-outline',      // 短视频脚本大纲
    1002: 'video-viral-copy',          // 短视频爆款文案
    1003: 'video-viral-title',         // 短视频爆款标题
    1004: 'video-storyboard',          // 短视频分镜头脚本
    1005: 'video-golden-3sec',         // 短视频黄金3秒开头
    1006: 'video-sales-script',        // 短视频带货口播文案
    1007: 'video-soft-ad',             // 短视频软广脚本
    1008: 'video-selling-point',       // 短视频卖点脚本
    1009: 'video-hard-ad',             // 短视频硬广脚本
    1010: 'video-hook-script',         // 短视频钩子脚本
    1011: 'video-question-method',     // 短视频抛问题法
    1012: 'video-technique-amplify',   // 短视频技巧放大法
    1013: 'video-data-proof',          // 短视频数据佐证法
    1014: 'video-error-point',         // 短视频指出错误法
    1015: 'video-list-method',         // 短视频列举法
  };

  const type = templateMap[templateId];
  if (!type) {
    console.warn(`未知的视频文案模板ID: ${templateId}，使用默认类型 video-viral-copy`);
    return 'video-viral-copy';
  }

  return type;
}
