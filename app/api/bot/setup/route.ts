import { NextRequest, NextResponse } from 'next/server';

// 调用此 API 来设置/删除 Telegram Webhook
// GET /api/bot/setup?action=set   → 注册 webhook
// GET /api/bot/setup?action=delete → 删除 webhook
// GET /api/bot/setup?action=info  → 查看当前 webhook 信息
export async function GET(req: NextRequest) {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BOT_TOKEN not configured' }, { status: 500 });
  }

  const action = req.nextUrl.searchParams.get('action') || 'set';
  const baseUrl = req.nextUrl.origin; // e.g. https://skillbaybot.vercel.app
  const webhookUrl = `${baseUrl}/api/bot`;

  const telegramApi = `https://api.telegram.org/bot${token}`;

  if (action === 'set') {
    const res = await fetch(`${telegramApi}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });
    const data = await res.json();
    return NextResponse.json({ action: 'setWebhook', webhookUrl, result: data });
  }

  if (action === 'delete') {
    const res = await fetch(`${telegramApi}/deleteWebhook`);
    const data = await res.json();
    return NextResponse.json({ action: 'deleteWebhook', result: data });
  }

  if (action === 'info') {
    const res = await fetch(`${telegramApi}/getWebhookInfo`);
    const data = await res.json();
    return NextResponse.json({ action: 'getWebhookInfo', result: data });
  }

  return NextResponse.json({ error: 'Unknown action. Use: set, delete, info' }, { status: 400 });
}
