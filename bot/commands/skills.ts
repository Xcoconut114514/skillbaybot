import { CommandContext, Context, InlineKeyboard } from 'grammy';

export async function handleSkills(ctx: CommandContext<Context>) {
  const webappUrl = process.env.WEBAPP_URL || 'https://skillsbay.vercel.app';

  const skills = [
    { id: 'skill_news_001', icon: '📰', name: '全球每日新闻 Top 10', price: '0.5 TON', desc: '信息降噪，一键获取全球局势' },
    { id: 'skill_weather_002', icon: '🌤️', name: '智能天气管家', price: '0.3 TON', desc: '决策辅助，人性化生活助理' },
    { id: 'skill_tech_003', icon: '🔥', name: '极客技术热点', price: '0.5 TON', desc: '专业深度，解决技术焦虑' },
  ];

  for (const skill of skills) {
    const keyboard = new InlineKeyboard()
      .webApp('🛒 购买并激活', `${webappUrl}/skills?startapp=${skill.id}`);

    await ctx.reply(
      `${skill.icon} *${skill.name}*\n` +
      `💰 价格: ${skill.price}\n` +
      `📝 ${skill.desc}`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  }
}
