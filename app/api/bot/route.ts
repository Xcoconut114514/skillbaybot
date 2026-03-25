import { Bot, webhookCallback, InlineKeyboard } from 'grammy';
import OpenAI from 'openai';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// ============ 配置 ============

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ACTIVATION_SECRET = process.env.ACTIVATION_SECRET || '';
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || process.env.WEBAPP_URL || 'https://skills-bay2-pu6f-el35q0x83-leafs-projects-bc05a6b5.vercel.app';

// ============ 存储（Vercel 无状态，用全局变量临时存） ============
// 生产环境应用数据库，hackathon 用内存存储够了
const userSkills: Record<string, string[]> = {};

function activateSkill(userId: string, skillId: string) {
  if (!userSkills[userId]) userSkills[userId] = [];
  if (!userSkills[userId].includes(skillId)) {
    userSkills[userId].push(skillId);
  }
}

function hasSkill(userId: string, skillId: string): boolean {
  return userSkills[userId]?.includes(skillId) ?? false;
}

// ============ 激活码解密 ============

interface DecodedCode {
  skillId: string;
  userId: string;
  timestamp: number;
}

function deriveKey(secret: string): Uint8Array {
  return new Uint8Array(crypto.createHash('sha256').update(secret).digest());
}

function decodeActivationCode(code: string): DecodedCode | null {
  if (!ACTIVATION_SECRET) return null;
  try {
    const key = deriveKey(ACTIVATION_SECRET);
    const raw = Buffer.from(code, 'base64url');
    const hex = raw.toString('hex');
    const iv = new Uint8Array(Buffer.from(hex.substring(0, 32), 'hex'));
    const encryptedHex = hex.substring(32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const [skillId, userId, ts] = decrypted.split(':');
    if (!skillId || !userId || !ts) return null;
    return { skillId, userId, timestamp: parseInt(ts) };
  } catch {
    return null;
  }
}

// ============ OpenAI ============

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

async function callSkillAI(systemPrompt: string, userMessage: string): Promise<string | null> {
  if (!openai) return '❌ OpenAI API Key 未配置';
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI error:', error);
    return null;
  }
}

// ============ 技能配置 ============

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

const SKILL_COMMANDS: Record<string, string> = {
  skill_news_001: '/news',
  skill_weather_002: '/weather 北京',
  skill_tech_003: '/tech',
};

// ============ Bot 实例 ============

let bot: Bot | null = null;

function getBot(): Bot {
  if (bot) return bot;
  if (!BOT_TOKEN) throw new Error('BOT_TOKEN not configured');

  bot = new Bot(BOT_TOKEN);

  // /start
  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .webApp('📰 全球新闻 Top 10 - 0.5 TON', `${WEBAPP_URL}/skill-payment?testnet=true&startapp=skill_news_001`).row()
      .webApp('🌤️ 智能天气管家 - 0.3 TON', `${WEBAPP_URL}/skill-payment?testnet=true&startapp=skill_weather_002`).row()
      .webApp('🔥 极客技术热点 - 0.5 TON', `${WEBAPP_URL}/skill-payment?testnet=true&startapp=skill_tech_003`);

    await ctx.reply(
      `🛍️ *欢迎来到 SkillsBay AI 技能市场！*\n\n` +
      `这里有 3 个强大的 AI 技能等你解锁：\n\n` +
      `📰 *全球新闻 Top 10* — 一键获取今日全球局势\n` +
      `🌤️ *智能天气管家* — 带伞建议，人性化生活助理\n` +
      `🔥 *极客技术热点* — GitHub/HN 最火技术速递\n\n` +
      `👇 点击下方按钮购买技能，或发送 /skills 查看详情`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  // /skills
  bot.command('skills', async (ctx) => {
    const skills = [
      { id: 'skill_news_001', icon: '📰', name: '全球每日新闻 Top 10', price: '0.5 TON', desc: '信息降噪，一键获取全球局势' },
      { id: 'skill_weather_002', icon: '🌤️', name: '智能天气管家', price: '0.3 TON', desc: '决策辅助，人性化生活助理' },
      { id: 'skill_tech_003', icon: '🔥', name: '极客技术热点', price: '0.5 TON', desc: '专业深度，解决技术焦虑' },
    ];

    for (const skill of skills) {
      const keyboard = new InlineKeyboard()
        .webApp('🛒 购买并激活', `${WEBAPP_URL}/skill-payment?testnet=true&startapp=${skill.id}`);

      await ctx.reply(
        `${skill.icon} *${skill.name}*\n💰 价格: ${skill.price}\n📝 ${skill.desc}`,
        { parse_mode: 'Markdown', reply_markup: keyboard }
      );
    }
  });

  // /activate — 支持硬编码激活码 + AES 加密激活码
  const FIXED_CODES: Record<string, string> = {
    'NEWS2026': 'skill_news_001',
    'WEATHER2026': 'skill_weather_002',
    'TECH2026': 'skill_tech_003',
  };

  bot.command('activate', async (ctx) => {
    const code = ctx.match?.toString().trim();
    if (!code) {
      await ctx.reply(
        '❌ 请提供激活码\n\n' +
        '用法: `/activate 激活码`\n\n' +
        '示例激活码：\n' +
        '`NEWS2026` — 📰 全球新闻\n' +
        '`WEATHER2026` — 🌤️ 天气管家\n' +
        '`TECH2026` — 🔥 技术热点',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const userId = ctx.from?.id.toString();
    if (!userId) return;

    // 先检查硬编码激活码
    const fixedSkillId = FIXED_CODES[code.toUpperCase()];
    if (fixedSkillId) {
      if (hasSkill(userId, fixedSkillId)) {
        await ctx.reply('ℹ️ 该技能已经激活过了，直接使用对应命令即可！');
        return;
      }
      activateSkill(userId, fixedSkillId);
      const name = SKILL_NAMES[fixedSkillId] || fixedSkillId;
      const cmd = SKILL_COMMANDS[fixedSkillId] || '';
      await ctx.reply(
        `✅ *激活成功！*\n\n技能: ${name}\n\n现在发送 \`${cmd}\` 即可使用！`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // 再尝试 AES 加密激活码（支付流程生成的）
    const decoded = decodeActivationCode(code);
    if (!decoded) {
      await ctx.reply('❌ 无效的激活码，请检查是否输入正确。');
      return;
    }

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
    const name = SKILL_NAMES[decoded.skillId] || decoded.skillId;
    const cmd = SKILL_COMMANDS[decoded.skillId] || '';

    await ctx.reply(
      `✅ *激活成功！*\n\n技能: ${name}\n\n现在发送 \`${cmd}\` 即可使用！`,
      { parse_mode: 'Markdown' }
    );
  });

  // 技能使用
  async function handleUseSkill(ctx: any, skillId: string) {
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    if (!hasSkill(userId, skillId)) {
      await ctx.reply(
        `❌ 你还没有激活 *${SKILL_NAMES[skillId]}* 技能\n\n发送 /skills 前往购买，或使用 /activate 输入激活码`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let userMessage = '请开始';
    if (skillId === 'skill_weather_002') {
      const city = ctx.message?.text?.replace('/weather', '').trim();
      if (!city) {
        await ctx.reply('请提供城市名，例如: `/weather 北京`', { parse_mode: 'Markdown' });
        return;
      }
      userMessage = `城市: ${city}`;
    }

    await ctx.reply('⏳ AI 正在工作中，请稍候...');
    const result = await callSkillAI(SKILL_PROMPTS[skillId], userMessage);

    if (result) {
      const truncated = result.length > 4000 ? result.substring(0, 4000) + '\n\n...(内容已截断)' : result;
      await ctx.reply(truncated);
    } else {
      await ctx.reply('❌ AI 服务暂时不可用，请稍后再试。');
    }
  }

  bot.command('news', (ctx) => handleUseSkill(ctx, 'skill_news_001'));
  bot.command('weather', (ctx) => handleUseSkill(ctx, 'skill_weather_002'));
  bot.command('tech', (ctx) => handleUseSkill(ctx, 'skill_tech_003'));

  // Mini App 自动激活
  bot.on('message:web_app_data', async (ctx) => {
    const data = ctx.message?.web_app_data?.data;
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      if (parsed.action !== 'activate' || !parsed.code) return;

      const userId = ctx.from?.id.toString();
      if (!userId) return;

      const decoded = decodeActivationCode(parsed.code);
      if (!decoded) {
        await ctx.reply('❌ 激活失败：无效的激活码');
        return;
      }

      if (hasSkill(userId, decoded.skillId)) {
        await ctx.reply('ℹ️ 该技能已激活，直接使用对应命令即可！');
        return;
      }

      activateSkill(userId, decoded.skillId);

      const cmdHint: Record<string, string> = {
        'skill_news_001': '📰 全球新闻 Top 10 → /news',
        'skill_weather_002': '🌤️ 智能天气管家 → /weather 城市名',
        'skill_tech_003': '🔥 极客技术热点 → /tech',
      };

      await ctx.reply(
        `✅ *支付成功，技能已自动激活！*\n\n${cmdHint[decoded.skillId] || decoded.skillId}\n\n现在就试试吧 👆`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      console.error('handleWebAppData error:', e);
    }
  });

  return bot;
}

// ============ Webhook Handler ============

const handleUpdate = async (req: NextRequest) => {
  try {
    const b = getBot();
    const handler = webhookCallback(b, 'std/http');
    return handler(req);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Bot error' }, { status: 500 });
  }
};

export const POST = handleUpdate;

// GET 用于健康检查
export async function GET() {
  return NextResponse.json({ status: 'SkillsBay Bot webhook is active' });
}
