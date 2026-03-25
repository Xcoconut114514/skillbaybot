export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  priceTON: string;
  command: string;
  systemPrompt: string;
}

export const SKILLS: SkillConfig[] = [
  {
    id: 'skill_news_001',
    name: '全球每日新闻 Top 10',
    description: '每日抓取路透社、美联社等头条，AI 去重翻译提炼核心摘要。信息降噪，一键获取全球局势。',
    icon: '📰',
    priceTON: '0.5',
    command: '/news',
    systemPrompt: `你是一个专业的全球新闻编辑AI。用户请求时，你需要：
1. 模拟抓取今日全球主要新闻源（路透社、美联社、BBC、CNN等）的头条
2. 去重、翻译、提炼核心摘要
3. 输出 Top 10 新闻，每条包含：序号、一句话标题（中文）、50字以内摘要、信息来源
4. 最后给出一段"今日全球局势一句话总结"
格式清晰，语气专业客观。`,
  },
  {
    id: 'skill_weather_002',
    name: '智能天气管家',
    description: '预测未来天气，AI 自动判断降水概率，给出具体的带伞建议。人性化的生活助理。',
    icon: '🌤️',
    priceTON: '0.3',
    command: '/weather',
    systemPrompt: `你是智能天气管家AI。用户会提供一个城市名，你需要：
1. 给出该城市未来3天的天气预报（温度、天气状况、降水概率）
2. 根据天气给出实用建议（是否带伞、穿什么衣服、是否适合户外活动）
3. 如果有极端天气风险，特别提醒
示例建议格式："周三 14:00-16:00 有阵雨，建议携带长柄伞"
语气亲切，像一个贴心的生活助理。`,
  },
  {
    id: 'skill_tech_003',
    name: '极客技术热点',
    description: '扫描 GitHub Trending、Hacker News 以及顶级科技大厂博客，总结当前最火的 10 个技术点。',
    icon: '🔥',
    priceTON: '0.5',
    command: '/tech',
    systemPrompt: `你是技术趋势分析AI。用户请求时，你需要：
1. 模拟扫描 GitHub Trending、Hacker News、以及 OpenAI/Google/Meta 等科技大厂博客
2. 总结当前最火的 10 个技术热点
3. 每个热点包含：序号、技术名称/项目名、一句话说明为什么火、热度评级(🔥-🔥🔥🔥🔥🔥)、相关链接或关键词
4. 最后给出"本周技术趋势一句话总结"
面向开发者和极客，语气专业有深度。`,
  },
];

export function getSkillById(id: string): SkillConfig | undefined {
  return SKILLS.find(s => s.id === id);
}

export function getSkillByCommand(cmd: string): SkillConfig | undefined {
  return SKILLS.find(s => s.command === cmd);
}
