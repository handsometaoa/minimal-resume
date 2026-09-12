import { NavLink } from "react-router-dom";
import type { Language } from "../types";

const SHOWCASE_TONES = ["cyan", "green", "black", "blue", "orange", "mint"] as const;

const copy = {
  zh: {
    eyebrow: "MINIMAL RESUME BUILDER",
    title: "极简历，让简历制作回到清晰与效率",
    desc: "从模板选择、内容编辑到导出投递，整个流程围绕正式简历交付设计。你只需要专注内容，版式、预览与打印由工作台实时处理。",
    primary: "选择模板开始制作",
    secondary: "直接进入工作台",
    tags: ["中英文模式", "多模板选择", "模块折叠排序", "实时联动预览"],
    featureTitle: "首页负责建立产品认知",
    featureDesc: "先说明网站能做什么，再引导用户去模板页选风格、去工作台完成编辑。",
    featureA: "中英文双语站点",
    featureADesc: "站点品牌、导航、模板说明与编辑器界面均支持中英文切换。",
    featureB: "模板先行，再进入制作",
    featureBDesc: "先比较不同模板的气质和信息层级，再带着模板进入工作台继续完成简历。",
    featureC: "编辑与预览双向联动",
    featureCDesc: "点击左侧模块自动定位右侧预览，点击右侧内容也会反向展开对应编辑区域。",
    featureD: "不强制单页排版",
    featureDDesc: "预览和导出支持自然分页，更贴近真实求职中的投递场景。",
    processTitle: "清晰的页面职责",
    processDesc: "首页建立认知，模板页做选择，工作台负责生产，关于页解释产品理念。",
    step1: "浏览模板",
    step1Desc: "先看风格差异，快速锁定最适合当前岗位方向的模板。",
    step2: "进入工作台编辑",
    step2Desc: "调整内容、顺序、显隐和版式参数，并实时查看最终效果。",
    step3: "导出并投递",
    step3Desc: "确认版式后直接打印或导出 PDF，减少额外排版整理成本。",
  },
  en: {
    eyebrow: "MINIMAL RESUME BUILDER",
    title: "Minimal Resume, built for clear and fast resume production",
    desc: "From template selection to editing and export, the workflow is designed around producing a polished resume quickly. You focus on content, and the workspace handles layout, preview, and print output.",
    primary: "Choose a Template",
    secondary: "Open Workspace",
    tags: ["Chinese / English", "More Templates", "Collapsible Sections", "Live Synced Preview"],
    featureTitle: "The home page explains the product clearly",
    featureDesc: "It establishes what the product does, then routes users to templates for selection and to the workspace for production.",
    featureA: "Bilingual experience",
    featureADesc: "Branding, navigation, template copy, and editor interface all switch between Chinese and English.",
    featureB: "Template-first workflow",
    featureBDesc: "Users compare visual styles first, then continue editing inside the workspace with the selected template.",
    featureC: "Two-way sync between editor and preview",
    featureCDesc: "Selecting a section on either side scrolls and opens the corresponding area automatically.",
    featureD: "No forced single-page output",
    featureDDesc: "Preview and export support natural multi-page resumes for realistic application workflows.",
    processTitle: "Pages with clear responsibilities",
    processDesc: "Home builds understanding, Templates handles selection, Workspace handles production, and About explains the product logic.",
    step1: "Browse Templates",
    step1Desc: "Compare visual styles and pick the layout that fits your target role.",
    step2: "Edit in Workspace",
    step2Desc: "Refine content, order, visibility, and layout settings with live preview feedback.",
    step3: "Export and Apply",
    step3Desc: "Print or export a polished PDF without extra manual layout cleanup.",
  },
} satisfies Record<Language, Record<string, string | string[]>>;

export const HomePage = ({ language }: { language: Language }) => {
  const labels = copy[language];
  const tags = labels.tags as string[];

  return (
    <main className="page-shell">
      <section className="marketing-hero landing-hero landing-hero--showcase">
        <div className="landing-hero__content">
          <p className="landing-eyebrow">{labels.eyebrow}</p>
          <h1>{labels.title}</h1>
          <p className="landing-copy">{labels.desc}</p>
          <div className="landing-actions">
            <NavLink className="landing-primary" to="/templates">
              {labels.primary}
            </NavLink>
            <NavLink className="landing-secondary" to="/workspace">
              {labels.secondary}
            </NavLink>
          </div>
          <div className="hero-highlight">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="resume-showcase" aria-hidden="true">
          {SHOWCASE_TONES.map((tone) => (
            <article key={tone} className={`resume-showcase__card resume-showcase__card--${tone}`}>
              <div className="resume-showcase__card-header" />
              <div className="resume-showcase__line resume-showcase__line--long" />
              <div className="resume-showcase__line" />
              <div className="resume-showcase__grid">
                <span />
                <span />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">FEATURES</p>
          <h2>{labels.featureTitle}</h2>
          <p>{labels.featureDesc}</p>
        </div>
        <div className="feature-grid feature-grid--home">
          <article className="feature-card feature-card--highlight">
            <h3>{labels.featureA}</h3>
            <p>{labels.featureADesc}</p>
          </article>
          <article className="feature-card">
            <h3>{labels.featureB}</h3>
            <p>{labels.featureBDesc}</p>
          </article>
          <article className="feature-card">
            <h3>{labels.featureC}</h3>
            <p>{labels.featureCDesc}</p>
          </article>
          <article className="feature-card">
            <h3>{labels.featureD}</h3>
            <p>{labels.featureDDesc}</p>
          </article>
        </div>
      </section>

      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">PROCESS</p>
          <h2>{labels.processTitle}</h2>
          <p>{labels.processDesc}</p>
        </div>
        <div className="step-grid">
          <article className="step-card">
            <span>01</span>
            <h3>{labels.step1}</h3>
            <p>{labels.step1Desc}</p>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>{labels.step2}</h3>
            <p>{labels.step2Desc}</p>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>{labels.step3}</h3>
            <p>{labels.step3Desc}</p>
          </article>
        </div>
      </section>
    </main>
  );
};
