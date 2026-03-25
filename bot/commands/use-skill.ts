import { Context } from 'grammy';
import { hasSkill } from '../services/storage.js';
import { callSkillAI } from '../services/openai.js';

const SKILL_PROMPTS: Record<string, string> = {
  skill_news_001: `你是一个专业的全球新闻编辑AI。请输出今日全球 Top 10 新闻：
每条包含：序号、一句话标题（中文）、50字内摘要、信息来源。
最后给出"今日全球局势一句话总结"。格式清晰，语气专业客观。`,

  skill_weather_002: `你是智能天气管家AI。根据用户提供的城市名：
1. 给出该城市未来3天天气预报（温度、天气、降水概率）
2. 给出实用建议（带伞、穿衣、户外活动）
3. 极端天气特别提醒
语气亲切，像贴心的生活助理。`,

  skill_tech_003: `你是技术趋势分析AI。请输出当前最火的 10 个技术热点：
每个包含：序号、技术/项目名、为什么火（一句话）、热度评级(🔥-🔥🔥🔥🔥🔥)。
最后给出"本周技术趋势一句话总结"。面向开发者，语气专业有深度。`,
};

const SKILL_NAMES: Record<string, string> = {
  skill_news_001: '📰 全球新闻 Top 10',
  skill_weather_002: '🌤️ 智能天气管家',
  skill_tech_003: '🔥 极客技术热点',
};

export async function handleUseSkill(ctx: Context, skillId: string) {
  const userId = ctx.from?.id.toString();
  if (!userId) return;

  // 检查是否已激活
  if (!hasSkill(userId, skillId)) {
    await ctx.reply(
      `❌ 你还没有激活 *${SKILL_NAMES[skillId]}* 技能\n\n` +
      `发送 /skills 前往购买，或使用 /activate 输入激活码`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // 获取用户输入（weather 需要城市参数）
  let userMessage = '请开始';
  if (skillId === 'skill_weather_002') {
    const city = ctx.message?.text?.replace('/weather', '').trim();
    if (!city) {
      await ctx.reply('请提供城市名，例如: `/weather 北京`', { parse_mode: 'Markdown' });
      return;
    }
    userMessage = `城市: ${city}`;
  }

  const prompt = SKILL_PROMPTS[skillId];
  if (!prompt) {
    await ctx.reply('❌ 未知技能');
    return;
  }

  await ctx.reply('⏳ AI 正在工作中，请稍候...');

  const result = await callSkillAI(prompt, userMessage);

  if (result) {
    const truncated = result.length > 4000 ? result.substring(0, 4000) + '\n\n...(内容已截断)' : result;
    await ctx.reply(truncated);
  } else {
    await ctx.reply('❌ AI 服务暂时不可用，请稍后再试。');
  }
}
