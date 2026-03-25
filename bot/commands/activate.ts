import { CommandContext, Context } from 'grammy';
import { decodeActivationCode } from '../services/activation.js';
import { activateSkill, hasSkill } from '../services/storage.js';

export async function handleActivate(ctx: CommandContext<Context>) {
  const code = ctx.match?.toString().trim();

  if (!code) {
    await ctx.reply(
      '❌ 请提供激活码\n\n用法: `/activate 你的激活码`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const userId = ctx.from?.id.toString();
  if (!userId) return;

  const decoded = await decodeActivationCode(code);

  if (!decoded) {
    await ctx.reply('❌ 无效的激活码，请检查是否复制完整。');
    return;
  }

  // hackathon 宽松模式：userId 不严格匹配也允许激活
  if (decoded.userId !== userId && decoded.userId !== 'unknown') {
    console.log(`⚠️ userId mismatch: code=${decoded.userId}, current=${userId}`);
  }

  // 检查是否过期（7天有效期）
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - decoded.timestamp > sevenDays) {
    await ctx.reply('❌ 激活码已过期（有效期 7 天），请重新购买。');
    return;
  }

  if (hasSkill(userId, decoded.skillId)) {
    await ctx.reply('ℹ️ 该技能已经激活过了，直接使用对应命令即可！');
    return;
  }

  activateSkill(userId, decoded.skillId);

  const skillNames: Record<string, string> = {
    'skill_news_001': '📰 全球每日新闻 Top 10',
    'skill_weather_002': '🌤️ 智能天气管家',
    'skill_tech_003': '🔥 极客技术热点',
  };
  const skillCommands: Record<string, string> = {
    'skill_news_001': '/news',
    'skill_weather_002': '/weather 北京',
    'skill_tech_003': '/tech',
  };

  const name = skillNames[decoded.skillId] || decoded.skillId;
  const cmd = skillCommands[decoded.skillId] || '';

  await ctx.reply(
    `✅ *激活成功！*\n\n` +
    `技能: ${name}\n\n` +
    `现在发送 \`${cmd}\` 即可使用！`,
    { parse_mode: 'Markdown' }
  );
}
