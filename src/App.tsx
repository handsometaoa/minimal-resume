import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { Toaster } from "@/components/ui/sonner";
import {
  BrandMark,
  COLOR_MODES,
  LanguageSwitch,
  ModeSwitch,
  ShellProvider,
  type ColorMode,
} from "@/components/shell-controls";
import type { Language } from "./types";

const LANGUAGE_STORAGE_KEY = "minimal-resume:language";
const MODE_STORAGE_KEY = "minimal-resume:mode";

const loadColorMode = (): ColorMode => {
  const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
  return saved && COLOR_MODES.includes(saved as ColorMode) ? (saved as ColorMode) : "auto";
};

const applyColorMode = (mode: ColorMode) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = mode === "dark" || (mode === "auto" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
};

const SiteLayout = () => {
  const location = useLocation();
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === "en" ? "en" : "zh";
  });
  const [mode, setMode] = useState<ColorMode>(loadColorMode);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.title = language === "zh" ? "极简历" : "Minimal Resume";
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    applyColorMode(mode);
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    if (mode !== "auto") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyColorMode("auto");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  const isWorkspace = location.pathname.startsWith("/workspace");

  return (
    <ShellProvider value={{ language, setLanguage, mode, setMode }}>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        {isWorkspace ? null : (
          <header className="app-chrome sticky top-0 z-40 border-b bg-background/85 backdrop-blur print:hidden">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
            <BrandMark language={language} />
              <div className="flex items-center gap-2">
                <LanguageSwitch />
                <ModeSwitch />
              </div>
            </div>
          </header>
        )}

        <Routes>
          <Route path="/" element={<HomePage language={language} />} />
          <Route path="/workspace" element={<WorkspacePage language={language} />} />
          <Route path="/about" element={<AboutPage language={language} />} />
        </Routes>

        <Toaster position="top-center" />
      </div>
    </ShellProvider>
  );
};

export default function App() {
  return <SiteLayout />;
}
