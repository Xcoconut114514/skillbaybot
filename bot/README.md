# SkillsBay Telegram Bot

Telegram Bot for SkillsBay AI Skill Marketplace — purchase AI skills via TON payment, activate with activation codes, and use skills powered by OpenAI.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your real values
npm start
```

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + skill buttons |
| `/skills` | Browse skill marketplace |
| `/activate <code>` | Activate a skill with activation code |
| `/news` | Use Global News Top 10 skill |
| `/weather <city>` | Use Smart Weather skill |
| `/tech` | Use Tech Trends skill |

## Architecture

```
bot/
├── index.ts              # Entry point (grammY bot init)
├── commands/
│   ├── start.ts          # /start command
│   ├── skills.ts         # /skills - show skill cards
│   ├── activate.ts       # /activate - verify activation code
│   └── use-skill.ts      # /news, /weather, /tech - call OpenAI
├── services/
│   ├── openai.ts         # OpenAI API wrapper
│   ├── storage.ts        # JSON file storage for user skills
│   ├── activation.ts     # Activation code decoder entry
│   └── activation-shared.ts  # AES-256-CBC decrypt logic
└── callback-handlers.ts  # Mini App web_app_data auto-activation
```
