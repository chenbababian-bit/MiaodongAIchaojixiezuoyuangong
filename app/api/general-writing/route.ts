import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// 模板ID到API路由的映射
const TEMPLATE_API_MAP: Record<number, string> = {
  // 沟通协作模板 (1001-1013)
  1001: '/api/communication/meeting-invitation',
  1002: '/api/communication/meeting-minutes',
  1003: '/api/communication/work-email',
  1004: '/api/communication/internal-notice',
  1005: '/api/communication/external-notice',
  1006: '/api/communication/customer-feedback',
  1007: '/api/communication/employee-satisfaction',
  1008: '/api/communication/emergency-contact',
  1009: '/api/communication/daily-report',
  1010: '/api/communication/problem-solving',
  1011: '/api/communication/proposal',
  1012: '/api/communication/thank-you-letter',
  1013: '/api/communication/apology-letter',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, templateId, templateTitle, conversationHistory } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '请提供内容' },
        { status: 400 }
      );
    }

    const numericTemplateId = parseInt(templateId);

    // 根据templateId获取对应的API路由
    const apiPath = TEMPLATE_API_MAP[numericTemplateId];

    if (!apiPath) {
      return NextResponse.json(
        { error: `不支持的模板ID: ${templateId}` },
        { status: 400 }
      );
    }

    // 构建完整的API URL
    const baseUrl = request.nextUrl.origin;
    const apiUrl = `${baseUrl}${apiPath}`;

    // 转发请求到对应的API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: content,  // 用于新创建的API (problem-solving, proposal等)
        content: content, // 用于旧的API (meeting-invitation等)
        conversationHistory: conversationHistory || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || '生成失败' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 返回结果，保持与原API相同的格式
    return NextResponse.json({
      success: true,
      result: data.content || data.result,
      conversationHistory: data.conversationHistory,
    });

  } catch (error: unknown) {
    console.error('General writing API error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || '生成失败' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}

