import 'dotenv/config';
import { Bot } from 'grammy';
import { handleStart } from './commands/start.js';
import { handleSkills } from './commands/skills.js';
import { handleActivate } from './commands/activate.js';
import { handleUseSkill } from './commands/use-skill.js';
import { handleWebAppData } from './callback-handlers.js';

const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN is required in .env');

const bot = new Bot(token);

// 命令
bot.command('start', handleStart);
bot.command('skills', handleSkills);
bot.command('activate', handleActivate);
bot.command('news', (ctx) => handleUseSkill(ctx, 'skill_news_001'));
bot.command('weather', (ctx) => handleUseSkill(ctx, 'skill_weather_002'));
bot.command('tech', (ctx) => handleUseSkill(ctx, 'skill_tech_003'));

// Mini App 回传数据（主方案自动激活）
bot.on('message:web_app_data', handleWebAppData);

// 启动
bot.start();
console.log('🤖 SkillsBay Bot is running...');
