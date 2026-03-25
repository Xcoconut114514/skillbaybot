import { Context } from 'grammy';
import { decodeActivationCode } from './services/activation.js';
import { activateSkill, hasSkill } from './services/storage.js';

export async function handleWebAppData(ctx: Context) {
  const data = ctx.message?.web_app_data?.data;
  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    if (parsed.action !== 'activate' || !parsed.code) return;

    const userId = ctx.from?.id.toString();
    if (!userId) return;

    const decoded = await decodeActivationCode(parsed.code);
    if (!decoded) {
      await ctx.reply('❌ 激活失败：无效的激活码');
      return;
    }

    if (hasSkill(userId, decoded.skillId)) {
      await ctx.reply('ℹ️ 该技能已激活，直接使用对应命令即可！');
      return;
    }

    activateSkill(userId, decoded.skillId);

    const names: Record<string, string> = {
      'skill_news_001': '📰 全球新闻 Top 10 → /news',
      'skill_weather_002': '🌤️ 智能天气管家 → /weather 城市名',
      'skill_tech_003': '🔥 极客技术热点 → /tech',
    };

    await ctx.reply(
      `✅ *支付成功，技能已自动激活！*\n\n` +
      `${names[decoded.skillId] || decoded.skillId}\n\n` +
      `现在就试试吧 👆`,
      { parse_mode: 'Markdown' }
    );
  } catch (e) {
    console.error('handleWebAppData error:', e);
  }
}
