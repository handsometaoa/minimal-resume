import type { Language, LocalizedText, ResumeThemeId, ThemePreset } from "../types";

export const THEME_IDS: ResumeThemeId[] = [
  "classic",
  "minimal",
  "tech",
  "executive",
  "creative",
  "serif",
];

export const isThemeId = (value: string | null | undefined): value is ResumeThemeId =>
  typeof value === "string" && THEME_IDS.includes(value as ResumeThemeId);

export const getLocalizedText = (text: LocalizedText, language: Language): string => text[language];

export const themePresets: ThemePreset[] = [
  {
    id: "classic",
    name: { zh: "经典商务", en: "Classic Business" },
    description: {
      zh: "稳重、清晰、正式，适合大多数中文岗位与通用投递场景。",
      en: "Balanced and formal for general applications, corporate roles, and campus recruiting.",
    },
    values: {
      themeId: "classic",
      accentColor: "#6b7280",
      density: "balanced",
      showAvatar: true,
      showDividers: true,
      headingSize: "38",
      infoLineHeight: "1.75",
      sectionSpacing: "18",
      avatarStyle: "square",
    },
  },
  {
    id: "minimal",
    name: { zh: "极简留白", en: "Minimal Air" },
    description: {
      zh: "强调留白与节奏，视觉更安静，适合内容表达型简历。",
      en: "Light and restrained, with more whitespace for content-driven resumes.",
    },
    values: {
      themeId: "minimal",
      accentColor: "#52525b",
      density: "airy",
      showAvatar: false,
      showDividers: false,
      headingSize: "40",
      infoLineHeight: "1.9",
      sectionSpacing: "22",
      avatarStyle: "rounded",
    },
  },
  {
    id: "tech",
    name: { zh: "技术蓝图", en: "Tech Blueprint" },
    description: {
      zh: "层级鲜明，重点突出，适合技术岗与项目较多的履历。",
      en: "Sharper hierarchy for engineering resumes, technical portfolios, and project-heavy profiles.",
    },
    values: {
      themeId: "tech",
      accentColor: "#2563eb",
      density: "compact",
      showAvatar: true,
      showDividers: true,
      headingSize: "36",
      infoLineHeight: "1.68",
      sectionSpacing: "16",
      avatarStyle: "rounded",
    },
  },
  {
    id: "executive",
    name: { zh: "高管深色", en: "Executive Slate" },
    description: {
      zh: "深色强调与成熟对比，适合管理岗、咨询、战略方向投递。",
      en: "A more premium executive tone for leadership, consulting, and strategy roles.",
    },
    values: {
      themeId: "executive",
      accentColor: "#1f2937",
      density: "balanced",
      showAvatar: true,
      showDividers: true,
      headingSize: "39",
      infoLineHeight: "1.78",
      sectionSpacing: "18",
      avatarStyle: "rounded",
    },
  },
  {
    id: "creative",
    name: { zh: "创意暖色", en: "Creative Warm" },
    description: {
      zh: "暖色点缀与更柔和的结构，适合设计、品牌、市场与内容岗位。",
      en: "Warmer accents and softer structure for design, branding, marketing, and content roles.",
    },
    values: {
      themeId: "creative",
      accentColor: "#ea580c",
      density: "airy",
      showAvatar: true,
      showDividers: false,
      headingSize: "41",
      infoLineHeight: "1.88",
      sectionSpacing: "24",
      avatarStyle: "rounded",
    },
  },
  {
    id: "serif",
    name: { zh: "文档衬线", en: "Editorial Serif" },
    description: {
      zh: "更像出版文档的阅读节奏，适合研究、教育、写作与学术方向。",
      en: "Editorial and text-friendly, suited to research, education, writing, and academic applications.",
    },
    values: {
      themeId: "serif",
      accentColor: "#7c3f00",
      density: "balanced",
      showAvatar: false,
      showDividers: true,
      headingSize: "40",
      infoLineHeight: "1.82",
      sectionSpacing: "20",
      avatarStyle: "square",
    },
  },
];

export const getThemePreset = (themeId: ResumeThemeId): ThemePreset =>
  themePresets.find((item) => item.id === themeId) ?? themePresets[0];
