import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import type { Language } from "./types";

const LANGUAGE_STORAGE_KEY = "minimal-resume:language";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const navLabels: Record<Language, Record<"home" | "templates" | "workspace" | "about", string>> = {
  zh: { home: "首页", templates: "模板", workspace: "工作台", about: "关于" },
  en: { home: "Home", templates: "Templates", workspace: "Workspace", about: "About" },
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

  const navItems: NavItem[] = [
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
