import { CommandContext, Context, InlineKeyboard } from 'grammy';

export async function handleStart(ctx: CommandContext<Context>) {
  const webappUrl = process.env.WEBAPP_URL || 'https://skillsbay.vercel.app';

  const keyboard = new InlineKeyboard()
    .webApp('📰 全球新闻 Top 10 - 0.5 TON', `${webappUrl}/skills?startapp=skill_news_001`).row()
    .webApp('🌤️ 智能天气管家 - 0.3 TON', `${webappUrl}/skills?startapp=skill_weather_002`).row()
    .webApp('🔥 极客技术热点 - 0.5 TON', `${webappUrl}/skills?startapp=skill_tech_003`);

  await ctx.reply(
    `🛍️ *欢迎来到 SkillsBay AI 技能市场！*\n\n` +
    `这里有 3 个强大的 AI 技能等你解锁：\n\n` +
    `📰 *全球新闻 Top 10* — 一键获取今日全球局势\n` +
    `🌤️ *智能天气管家* — 带伞建议，人性化生活助理\n` +
    `🔥 *极客技术热点* — GitHub/HN 最火技术速递\n\n` +
    `👇 点击下方按钮购买技能，或发送 /skills 查看详情`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
}
