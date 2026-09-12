import type { Language } from "../types";

const copy = {
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

export const AboutPage = ({ language }: { language: Language }) => {
  const labels = copy[language];

  return (
    <main className="page-shell">
      <section className="site-section">
        <div className="site-section__heading">
          <p className="landing-eyebrow">{labels.eyebrow}</p>
          <h2>{labels.title}</h2>
          <p>{labels.desc}</p>
        </div>
        <div className="about-grid">
          <div>
            <p>{labels.p1}</p>
            <p>{labels.p2}</p>
            <p>{labels.p3}</p>
          </div>
          <aside className="about-note">
            <strong>{labels.noteTitle}</strong>
            <span>{labels.noteBody}</span>
          </aside>
        </div>
      </section>
    </main>
  );
};
