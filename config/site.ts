export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "SkillsBay",
  description: "Telegram 技能市场 - 购买和激活 AI 技能",
  navItems: [
    {
      label: "技能市场",
      href: "/skills",
    },
    {
      label: "我的技能",
      href: "/profile",
    },
    {
      label: "质押",
      href: "/staking",
    },
  ],
  navMenuItems: [
    {
      label: "技能市场",
      href: "/skills",
    },
    {
      label: "我的技能",
      href: "/profile",
    },
    {
      label: "质押",
      href: "/staking",
    },
  ],
  links: {
    github: "https://github.com/skillsbay",
    twitter: "https://twitter.com/skillsbay",
    docs: "https://docs.skillsbay.io",
    discord: "https://discord.gg/skillsbay",
  },
};
