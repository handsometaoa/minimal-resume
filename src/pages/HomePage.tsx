import { Link, NavLink } from "react-router-dom";
import { ArrowRight, FileDown, MonitorPlay, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { themePresets } from "../lib/themePresets";
import type { Language, ThemePreset } from "../types";

const copy = {
  zh: {
    badge: "免费 · 无需注册 · 数据保存在本地",
    titleLead: "选一个模板，",
    titleAccent: "五分钟做好简历",
    desc: "浏览器里编辑，实时预览 A4 排版，一键导出 PDF。无需注册，数据保存在本地。",
    primary: "直接开始制作",
    secondary: "看看模板",
    steps: ["选模板", "填内容", "导出 PDF"],
    chipPreview: "实时 A4 预览",
    chipExport: "一键导出 PDF",
    sectionTitle: "选择模板",
    sectionDesc: "六套风格，点击卡片直接进入工作台",
    start: "开始使用",
    secondaryLink: "直接进入工作台",
    about: "关于 极简历",
    tagline: "为正式求职场景设计的简历工具",
  },
  en: {
    badge: "Free · No sign-up · Data stays local",
    titleLead: "Pick a template, ",
    titleAccent: "finish your resume in minutes",
    desc: "Edit in the browser with a live A4 preview and one-click PDF export. No sign-up — your data stays local.",
    primary: "Start Building",
    secondary: "Browse Templates",
    steps: ["Pick a template", "Fill in content", "Export PDF"],
    chipPreview: "Live A4 preview",
    chipExport: "One-click PDF",
    sectionTitle: "Choose a template",
    sectionDesc: "Six styles — click a card to jump straight into the workspace",
    start: "Start",
    secondaryLink: "Open Workspace",
    about: "About",
    tagline: "A resume builder for serious job applications",
  },
} satisfies Record<Language, Record<string, string | string[]>>;

/** 模板缩略示意：白纸 + 主题色点缀的抽象版式 */
const MiniPaper = ({ accentColor, className }: { accentColor: string; className?: string }) => (
  <div
    className={`aspect-[210/250] rounded-lg border border-zinc-200 bg-white p-4 ${className ?? ""}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 w-20 rounded-sm bg-zinc-700/85" />
        <div className="h-1.5 w-14 rounded-sm" style={{ backgroundColor: accentColor }} />
      </div>
      <div
        className="h-6 w-4.5 rounded-sm"
        style={{ backgroundColor: accentColor, opacity: 0.85 }}
      />
    </div>
    <div className="mt-3 flex flex-col gap-1">
      <div className="h-1 w-full rounded-sm bg-zinc-200" />
      <div className="h-1 w-3/4 rounded-sm bg-zinc-200" />
    </div>
    <div className="mt-3.5 flex items-center gap-1.5">
      <div className="h-3.5 w-1 rounded-[1px]" style={{ backgroundColor: accentColor }} />
      <div
        className="h-3.5 flex-1 rounded-sm"
        style={{ backgroundColor: accentColor, opacity: 0.1 }}
      />
    </div>
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="h-1 w-full rounded-sm bg-zinc-200" />
      <div className="h-1 w-full rounded-sm bg-zinc-200" />
      <div className="h-1 w-4/5 rounded-sm bg-zinc-200" />
    </div>
    <div className="mt-3.5 flex items-center gap-1.5">
      <div className="h-3.5 w-1 rounded-[1px]" style={{ backgroundColor: accentColor }} />
      <div
        className="h-3.5 flex-1 rounded-sm"
        style={{ backgroundColor: accentColor, opacity: 0.1 }}
      />
    </div>
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="h-1 w-full rounded-sm bg-zinc-200" />
      <div className="h-1 w-2/3 rounded-sm bg-zinc-200" />
    </div>
  </div>
);

const accentOf = (id: string) =>
  themePresets.find((preset) => preset.id === id)?.values.accentColor ?? "#2563eb";

/** hero 右侧：三张扇形排开的迷你纸张 */
const HeroVisual = ({ language }: { language: Language }) => {
  const chips = [
    { icon: <MonitorPlay className="size-3" />, text: copy[language].chipPreview },
    { icon: <FileDown className="size-3" />, text: copy[language].chipExport },
  ];

  return (
    <div className="relative mx-auto hidden h-[400px] w-full max-w-md select-none lg:block" aria-hidden="true">
      <div className="absolute left-0 top-16 w-[52%] -rotate-6">
        <MiniPaper accentColor={accentOf("creative")} className="shadow-lg" />
      </div>
      <div className="absolute right-0 top-14 w-[52%] rotate-6">
        <MiniPaper accentColor={accentOf("executive")} className="shadow-lg" />
      </div>
      <div className="absolute left-1/2 top-2 z-10 w-[56%] -translate-x-1/2">
        <MiniPaper accentColor={accentOf("tech")} className="shadow-2xl" />
      </div>
      <span className="absolute -left-2 bottom-8 z-20 flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-md">
        <span className="text-primary">{chips[0].icon}</span>
        {chips[0].text}
      </span>
      <span className="absolute -right-1 top-6 z-20 flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-md">
        <span className="text-primary">{chips[1].icon}</span>
        {chips[1].text}
      </span>
    </div>
  );
};

const TemplateCard = ({
  preset,
  language,
}: {
  preset: ThemePreset;
  language: Language;
}) => (
  <NavLink
    to={`/workspace?theme=${preset.id}`}
    className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-1 hover:ring-primary/45"
  >
    <div className="px-5 pt-5">
      <MiniPaper accentColor={preset.values.accentColor} className="shadow-sm" />
    </div>
    <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-4">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: preset.values.accentColor }}
          />
          {preset.name[language]}
        </span>
        <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {preset.description[language]}
        </span>
      </div>
      <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        {copy[language].start}
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  </NavLink>
);

export const HomePage = ({ language }: { language: Language }) => {
  const labels = copy[language];
  const steps = labels.steps as string[];

  const scrollToTemplates = () => {
    document.getElementById("templates")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="flex flex-1 flex-col">
      {/* hero：左文案 + 右视觉，品牌蓝辉光与点阵 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-brand-glow" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-dots opacity-70 [mask-image:radial-gradient(65%_65%_at_50%_15%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-14 pt-12 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-20 lg:pt-20">
          <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3 text-primary" />
              {labels.badge}
            </span>
            <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
              {labels.titleLead}
              <span className="text-brand-gradient">{labels.titleAccent}</span>
            </h1>
            <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {labels.desc}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="shadow-md shadow-primary/25" asChild>
                <Link to="/workspace">
                  <Sparkles className="size-4" />
                  {labels.primary}
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToTemplates}>
                {labels.secondary}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {steps.map((step, index) => (
                <span key={step} className="flex items-center gap-2">
                  {index > 0 ? <span className="text-border">→</span> : null}
                  <span className="flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    {step}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <HeroVisual language={language} />
        </div>
      </section>

      {/* 模板直选 */}
      <section id="templates" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-bold tracking-tight">{labels.sectionTitle}</h2>
          <p className="text-sm text-muted-foreground">{labels.sectionDesc}</p>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {themePresets.map((preset) => (
            <TemplateCard key={preset.id} preset={preset} language={language} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            to="/workspace"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {labels.secondaryLink}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      <footer className="mt-auto border-t bg-card/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 text-xs text-muted-foreground">
          <span>{labels.tagline}</span>
          <Link to="/about" className="underline-offset-4 hover:text-primary hover:underline">
            {labels.about}
          </Link>
        </div>
      </footer>
    </main>
  );
};
