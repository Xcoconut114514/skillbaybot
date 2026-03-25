import { Bot, webhookCallback, InlineKeyboard } from 'grammy';
import OpenAI from 'openai';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// ============ 配置 ============

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ACTIVATION_SECRET = process.env.ACTIVATION_SECRET || '';
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || process.env.WEBAPP_URL || 'https://skills-1i1wni3v3-leafs-projects-bc05a6b5.vercel.app';

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
  if (!openai) return '❌ OpenAI API Key not configured';
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
  skill_news_001: `You are a professional global news editor AI. Output today's Top 10 global news in English:
Each item includes: number, one-line headline, 50-word summary, source.
End with a one-sentence global situation summary. Clear format, professional and objective tone.`,

  skill_weather_002: `You are a smart weather assistant AI. Based on the city name provided:
1. Give a 3-day weather forecast (temperature, conditions, precipitation probability)
2. Provide practical advice (umbrella, clothing, outdoor activities)
3. Special alerts for extreme weather
Friendly tone in English, like a helpful life assistant.`,

  skill_tech_003: `You are a tech trend analyst AI. Output the top 10 hottest tech trends right now in English:
Each item includes: number, tech/project name, why it's hot (one sentence), heat rating (🔥-🔥🔥🔥🔥🔥).
End with a one-sentence weekly tech trend summary. Aimed at developers, professional and insightful tone.`,
};

const SKILL_NAMES: Record<string, string> = {
  skill_news_001: '📰 Global News Top 10',
  skill_weather_002: '🌤️ Smart Weather Assistant',
  skill_tech_003: '🔥 Geek Tech Trends',
};

const SKILL_COMMANDS: Record<string, string> = {
  skill_news_001: '/news',
  skill_weather_002: '/weather London',
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
      .webApp('📰 Global News Top 10 - 0.01 TON', `${WEBAPP_URL}/skill-payment?testnet=true&startapp=skill_news_001`).row()
      .webApp('🌤️ Smart Weather Assistant - 0.01 TON', `${WEBAPP_URL}/skill-payment?testnet=true&startapp=skill_weather_002`).row()
      .webApp('🔥 Geek Tech Trends - 0.01 TON', `${WEBAPP_URL}/skill-payment?testnet=true&startapp=skill_tech_003`);

    await ctx.reply(
      `🛍️ *Welcome to SkillsBay AI Skill Market!*\n\n` +
      `3 powerful AI skills waiting to be unlocked:\n\n` +
      `📰 *Global News Top 10* — Today's world at a glance\n` +
      `🌤️ *Smart Weather Assistant* — Your personal life companion\n` +
      `🔥 *Geek Tech Trends* — Hottest picks from GitHub & HN\n\n` +
      `👇 Tap a button to purchase, or send /skills for details`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  // /skills
  bot.command('skills', async (ctx) => {
    const skills = [
      { id: 'skill_news_001', icon: '📰', name: 'Global Daily News Top 10', price: '0.01 TON', desc: 'Cut through the noise, global insights in seconds' },
      { id: 'skill_weather_002', icon: '🌤️', name: 'Smart Weather Assistant', price: '0.01 TON', desc: 'Your personalized daily life companion' },
      { id: 'skill_tech_003', icon: '🔥', name: 'Geek Tech Trends', price: '0.01 TON', desc: 'Deep dives into the hottest tech this week' },
    ];

    for (const skill of skills) {
      const keyboard = new InlineKeyboard()
        .webApp('🛒 Buy & Activate', `${WEBAPP_URL}/skill-payment?testnet=true&startapp=${skill.id}`);

      await ctx.reply(
        `${skill.icon} *${skill.name}*\n💰 Price: ${skill.price}\n📝 ${skill.desc}`,
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
        '❌ Please provide an activation code\n\n' +
        'Usage: `/activate YOUR_CODE`\n\n' +
        'Demo codes:\n' +
        '`NEWS2026` — 📰 Global News\n' +
        '`WEATHER2026` — 🌤️ Weather Assistant\n' +
        '`TECH2026` — 🔥 Tech Trends',
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
        await ctx.reply('ℹ️ This skill is already activated! Just use the corresponding command.');
        return;
      }
      activateSkill(userId, fixedSkillId);
      const name = SKILL_NAMES[fixedSkillId] || fixedSkillId;
      const cmd = SKILL_COMMANDS[fixedSkillId] || '';
      await ctx.reply(
        `✅ *Skill Activated!*\n\nSkill: ${name}\n\nSend \`${cmd}\` to use it now!`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // 再尝试 AES 加密激活码（支付流程生成的）
    const decoded = decodeActivationCode(code);
    if (!decoded) {
      await ctx.reply('❌ Invalid activation code. Please check and try again.');
      return;
    }

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - decoded.timestamp > sevenDays) {
      await ctx.reply('❌ Activation code expired (valid for 7 days). Please purchase again.');
      return;
    }

    if (hasSkill(userId, decoded.skillId)) {
      await ctx.reply('ℹ️ This skill is already activated! Just use the corresponding command.');
      return;
    }

    activateSkill(userId, decoded.skillId);
    const name = SKILL_NAMES[decoded.skillId] || decoded.skillId;
    const cmd = SKILL_COMMANDS[decoded.skillId] || '';

    await ctx.reply(
      `✅ *Skill Activated!*\n\nSkill: ${name}\n\nSend \`${cmd}\` to use it now!`,
      { parse_mode: 'Markdown' }
    );
  });

  // 技能使用
  async function handleUseSkill(ctx: any, skillId: string) {
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    if (!hasSkill(userId, skillId)) {
      await ctx.reply(
        `❌ You haven't activated *${SKILL_NAMES[skillId]}* yet\n\nSend /skills to purchase, or use /activate with your code`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let userMessage = 'Start';
    if (skillId === 'skill_weather_002') {
      const city = ctx.message?.text?.replace('/weather', '').trim();
      if (!city) {
        await ctx.reply('Please provide a city name, e.g.: `/weather London`', { parse_mode: 'Markdown' });
        return;
      }
      userMessage = `City: ${city}`;
    }

    await ctx.reply('⏳ AI is working, please wait...');
    const result = await callSkillAI(SKILL_PROMPTS[skillId], userMessage);

    if (result) {
      const truncated = result.length > 4000 ? result.substring(0, 4000) + '\n\n...(content truncated)' : result;
      await ctx.reply(truncated);
    } else {
      await ctx.reply('❌ AI service temporarily unavailable. Please try again later.');
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
        await ctx.reply('❌ Activation failed: invalid code');
        return;
      }

      if (hasSkill(userId, decoded.skillId)) {
        await ctx.reply('ℹ️ Skill already activated! Just use the corresponding command.');
        return;
      }

      activateSkill(userId, decoded.skillId);

      const cmdHint: Record<string, string> = {
        'skill_news_001': '📰 Global News Top 10 → /news',
        'skill_weather_002': '🌤️ Smart Weather Assistant → /weather London',
        'skill_tech_003': '🔥 Geek Tech Trends → /tech',
      };

      await ctx.reply(
        `✅ *Payment successful! Skill activated!*\n\n${cmdHint[decoded.skillId] || decoded.skillId}\n\nGive it a try now 👆`,
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
