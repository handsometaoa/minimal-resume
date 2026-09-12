import { NavLink } from "react-router-dom";
import { getLocalizedText, themePresets } from "../lib/themePresets";
import type { Language } from "../types";

const copy = {
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

export const TemplatesPage = ({ language }: { language: Language }) => {
  const labels = copy[language];

  return (
    <main className="page-shell">
      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">{labels.eyebrow}</p>
          <h2>{labels.title}</h2>
          <p>{labels.desc}</p>
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
              <span className="template-card__cta">{labels.cta}</span>
            </NavLink>
          ))}
        </div>
      </section>

      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">GUIDE</p>
          <h2>{labels.guideTitle}</h2>
          <p>{labels.guideDesc}</p>
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
