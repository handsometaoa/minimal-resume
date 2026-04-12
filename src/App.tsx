import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { getLocalizedText, themePresets } from "./lib/themePresets";
import { WorkspacePage } from "./pages/WorkspacePage";
import type { Language } from "./types";

const LANGUAGE_STORAGE_KEY = "minimal-resume:language";

const navLabels = {
  zh: { home: "首页", templates: "模板", workspace: "工作台", about: "关于" },
  en: { home: "Home", templates: "Templates", workspace: "Workspace", about: "About" },
} satisfies Record<Language, Record<string, string>>;

const homeCopy = {
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

const templatesCopy = {
  zh: {
    eyebrow: "TEMPLATES",
    title: "先选模板，再开始制作",
    desc: "点击模板卡片即可带着当前风格进入工作台。模板是起点，后续仍可继续微调颜色、密度、行距和头像样式。",
    cta: "使用这个模板",
    guideTitle: "更多模板，覆盖更多投递场景",
    guideDesc: "不同模板面向不同岗位气质。你可以把模板当作一套更高效的起始版式，而不是一次性决定。",
  },
  en: {
    eyebrow: "TEMPLATES",
    title: "Pick a template before you start editing",
    desc: "Click any template card to open the workspace with that style applied. A template is only the starting point, and you can still tune spacing, color, density, and avatar style later.",
    cta: "Use This Template",
    guideTitle: "More templates for more resume scenarios",
    guideDesc: "Each template targets a different tone. Treat them as stronger starting layouts rather than one-time locked choices.",
  },
} satisfies Record<Language, Record<string, string>>;

const aboutCopy = {
  zh: {
    eyebrow: "ABOUT",
    title: "关于 极简历",
    desc: "极简历是一套面向正式求职场景的简历制作网站，重点不是复杂花样，而是帮助用户更快完成一份清晰、完整、可投递的简历。",
    p1: "我们把首页、模板页、工作台和关于页拆开，是为了让每个页面只承载一种任务。用户先认识产品，再选择模板，最后进入工作台集中完成编辑和导出。",
    p2: "工作台支持模块排序、显示隐藏、单模块展开、左右联动定位、Markdown 长文本编辑和多页导出，覆盖从初稿到正式投递的完整制作流程。",
    p3: "网站现在支持中英文模式，也提供更多模板，以适配中文求职、英文简历与跨语言投递的不同需求。",
    noteTitle: "适合谁使用",
    noteBody: "校招、社招、技术岗、产品岗、运营岗、设计岗，以及需要快速完成中英文简历制作与导出的求职者。",
  },
  en: {
    eyebrow: "ABOUT",
    title: "About Minimal Resume",
    desc: "Minimal Resume is a resume production website built for serious job applications. The focus is not decoration for its own sake, but helping users produce a clear, complete, and deliverable resume faster.",
    p1: "Home, Templates, Workspace, and About are separated intentionally so each page has one clear job. Users understand the product first, choose a style next, and then edit in a focused workspace.",
    p2: "The workspace supports section ordering, visibility control, single-section expansion, linked navigation, Markdown editing for long text, and multi-page export in one flow.",
    p3: "The site now supports both Chinese and English modes and includes a broader template library for bilingual and cross-border job applications.",
    noteTitle: "Who It Is For",
    noteBody: "Campus hires, experienced professionals, engineers, product managers, operators, designers, and anyone who needs to build polished resumes quickly.",
  },
} satisfies Record<Language, Record<string, string>>;

const HomePage = ({ language }: { language: Language }) => {
  const copy = homeCopy[language];
  const tags = copy.tags as string[];

  return (
    <main className="page-shell">
      <section className="marketing-hero landing-hero landing-hero--showcase">
        <div className="landing-hero__content">
          <p className="landing-eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="landing-copy">{copy.desc}</p>
          <div className="landing-actions">
            <NavLink className="landing-primary" to="/templates">
              {copy.primary}
            </NavLink>
            <NavLink className="landing-secondary" to="/workspace">
              {copy.secondary}
            </NavLink>
          </div>
          <div className="hero-highlight">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="resume-showcase" aria-hidden="true">
          {["cyan", "green", "black", "blue", "orange", "mint"].map((tone) => (
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
          <h2>{copy.featureTitle}</h2>
          <p>{copy.featureDesc}</p>
        </div>
        <div className="feature-grid feature-grid--home">
          <article className="feature-card feature-card--highlight">
            <h3>{copy.featureA}</h3>
            <p>{copy.featureADesc}</p>
          </article>
          <article className="feature-card">
            <h3>{copy.featureB}</h3>
            <p>{copy.featureBDesc}</p>
          </article>
          <article className="feature-card">
            <h3>{copy.featureC}</h3>
            <p>{copy.featureCDesc}</p>
          </article>
          <article className="feature-card">
            <h3>{copy.featureD}</h3>
            <p>{copy.featureDDesc}</p>
          </article>
        </div>
      </section>

      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">PROCESS</p>
          <h2>{copy.processTitle}</h2>
          <p>{copy.processDesc}</p>
        </div>
        <div className="step-grid">
          <article className="step-card">
            <span>01</span>
            <h3>{copy.step1}</h3>
            <p>{copy.step1Desc}</p>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>{copy.step2}</h3>
            <p>{copy.step2Desc}</p>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>{copy.step3}</h3>
            <p>{copy.step3Desc}</p>
          </article>
        </div>
      </section>
    </main>
  );
};

const TemplatesPage = ({ language }: { language: Language }) => {
  const copy = templatesCopy[language];

  return (
    <main className="page-shell">
      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.desc}</p>
        </div>
        <div className="template-grid">
          {themePresets.map((preset) => (
            <NavLink
              key={preset.id}
              className={`template-card template-card--link template-card--${preset.id}`}
              to={`/workspace?theme=${preset.id}`}
            >
              <div className="template-card__preview">
                <div className="template-card__header" />
                <div className="template-card__line" />
                <div className="template-card__section" />
                <div className="template-card__section template-card__section--small" />
              </div>
              <h3>{getLocalizedText(preset.name, language)}</h3>
              <p>{getLocalizedText(preset.description, language)}</p>
              <span className="template-card__cta">{copy.cta}</span>
            </NavLink>
          ))}
        </div>
      </section>

      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">GUIDE</p>
          <h2>{copy.guideTitle}</h2>
          <p>{copy.guideDesc}</p>
        </div>
        <div className="feature-grid">
          {themePresets.map((preset) => (
            <article key={preset.id} className="feature-card">
              <h3>{getLocalizedText(preset.name, language)}</h3>
              <p>{getLocalizedText(preset.description, language)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

const AboutPage = ({ language }: { language: Language }) => {
  const copy = aboutCopy[language];

  return (
    <main className="page-shell">
      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.desc}</p>
        </div>
        <div className="about-grid">
          <div>
            <p>{copy.p1}</p>
            <p>{copy.p2}</p>
            <p>{copy.p3}</p>
          </div>
          <aside className="about-note">
            <strong>{copy.noteTitle}</strong>
            <span>{copy.noteBody}</span>
          </aside>
        </div>
      </section>
    </main>
  );
};

const SiteLayout = () => {
  const location = useLocation();
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === "en" ? "en" : "zh";
  });

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.title = language === "zh" ? "极简历" : "Minimal Resume";
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const navItems = [
    { to: "/", label: navLabels[language].home, end: true },
    { to: "/templates", label: navLabels[language].templates },
    { to: "/workspace", label: navLabels[language].workspace },
    { to: "/about", label: navLabels[language].about },
  ];
  const siteShellClassName =
    location.pathname.startsWith("/workspace") ? "site-shell site-shell--workspace-route" : "site-shell";

  return (
    <div className={siteShellClassName}>
      <header className="site-header">
        <div className="site-brand">
          <img className="site-brand__mark" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
          <div>
            <strong>{language === "zh" ? "极简历" : "Minimal Resume"}</strong>
            <span>
              {language === "zh"
                ? "中英文简历制作网站"
                : "A bilingual resume builder for polished applications"}
            </span>
          </div>
        </div>
        <div className="site-header__actions">
          <nav className="site-nav">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="language-switch" aria-label="language switch">
            <button
              type="button"
              className={language === "zh" ? "language-switch__button active" : "language-switch__button"}
              onClick={() => setLanguage("zh")}
            >
              中文
            </button>
            <button
              type="button"
              className={language === "en" ? "language-switch__button active" : "language-switch__button"}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage language={language} />} />
        <Route path="/templates" element={<TemplatesPage language={language} />} />
        <Route path="/workspace" element={<WorkspacePage language={language} />} />
        <Route path="/about" element={<AboutPage language={language} />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return <SiteLayout />;
}
