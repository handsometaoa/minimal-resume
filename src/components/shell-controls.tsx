import { createContext, useContext, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

export type ColorMode = "auto" | "light" | "dark";

export const COLOR_MODES: ColorMode[] = ["auto", "light", "dark"];

const modeLabels = {
  zh: { auto: "跟随系统", light: "浅色", dark: "深色" },
  en: { auto: "System", light: "Light", dark: "Dark" },
} as const;

interface ShellValue {
  language: Language;
  setLanguage: (language: Language) => void;
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
}

const ShellContext = createContext<ShellValue | null>(null);

export const ShellProvider = ({
  value,
  children,
}: {
  value: ShellValue;
  children: ReactNode;
}) => <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;

export const useShell = (): ShellValue => {
  const value = useContext(ShellContext);
  if (!value) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return value;
};

/** 品牌标识：原版 favicon + 字标，点击回首页 */
export const BrandMark = ({ language }: { language: Language }) => (
  <Link to="/" className="flex shrink-0 items-center gap-2.5">
    <img className="size-8" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
    <span className="text-sm font-semibold tracking-wide">
      {language === "zh" ? "极简历" : "Minimal Resume"}
    </span>
  </Link>
);

export const LanguageSwitch = () => {
  const { language, setLanguage } = useShell();

  return (
    <div
      className="flex items-center rounded-md border p-0.5"
      role="group"
      aria-label="language"
    >
      {(["zh", "en"] as const).map((item) => (
        <Button
          key={item}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2.5 text-xs",
            language === item && "bg-primary/10 font-medium text-primary",
          )}
          onClick={() => setLanguage(item)}
        >
          {item === "zh" ? "中文" : "EN"}
        </Button>
      ))}
    </div>
  );
};

export const ModeSwitch = () => {
  const { language, mode, setMode } = useShell();
  const labels = modeLabels[language];
  const icons: Record<ColorMode, ReactNode> = {
    auto: <Monitor className="size-3.5" />,
    light: <Sun className="size-3.5" />,
    dark: <Moon className="size-3.5" />,
  };

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border p-0.5"
      role="group"
      aria-label={language === "zh" ? "颜色模式" : "Color mode"}
    >
      {COLOR_MODES.map((item) => (
        <Button
          key={item}
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            "size-7",
            mode === item && "bg-primary/10 text-primary",
          )}
          aria-label={labels[item]}
          title={labels[item]}
          onClick={() => setMode(item)}
        >
          {icons[item]}
        </Button>
      ))}
    </div>
  );
};
