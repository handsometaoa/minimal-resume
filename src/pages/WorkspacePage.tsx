import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { EditorPane } from "../editor/EditorPane";
import { defaultSectionConfigs, reorderSection } from "../lib/sectionConfigs";
import { getThemePreset, isThemeId } from "../lib/themePresets";
import { PreviewPane } from "../preview/PreviewPane";
import { ResumeStateProvider, useResumeState } from "../state/resumeState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { BrandMark, LanguageSwitch, ModeSwitch } from "@/components/shell-controls";
import type { Language, ManagedSectionId, SectionConfig } from "../types";

const UI_STORAGE_KEY = "minimal-resume:ui";

interface StoredUiState {
  activeSectionId: ManagedSectionId | null;
  sectionConfigs: SectionConfig[];
}

const pageCopy = {
  zh: {
    back: "返回选模板",
    sample: "载入示例",
    clear: "清空内容",
    export: "导出 PDF",
    clearConfirmTitle: "清空全部内容？",
    clearConfirmBody: "将恢复为空白简历（保留当前模板与版式设置），此操作不可撤销。",
    cancel: "取消",
    confirmClear: "确认清空",
    embeddedHint:
      "内嵌浏览器无法直接打印，已复制本页地址。请在 Edge / Chrome 中打开后点击“导出 PDF”。",
    embeddedHintFallback: "内嵌浏览器无法直接打印，请复制地址栏链接到 Edge / Chrome 打开后导出。",
    printTipTitle: "打印设置提醒",
    printTipTarget: "目标选择“另存为 PDF”",
    printTipMargins: "边距选择“无”（页面已内置 A4 版式边距）",
    printTipBackground: "若 PDF 缺少色块，展开“更多设置”勾选“背景图形”",
    printTipScale: "缩放保持“默认”，不要选“适合页面宽度”",
    continuePrint: "继续打印",
  },
  en: {
    back: "Back to Templates",
    sample: "Load Sample",
    clear: "Clear",
    export: "Export PDF",
    clearConfirmTitle: "Clear all content?",
    clearConfirmBody:
      "This restores a blank resume (keeping the current template and layout settings) and cannot be undone.",
    cancel: "Cancel",
    confirmClear: "Clear",
    embeddedHint:
      "The embedded browser cannot print directly. The page link is copied — open it in Edge / Chrome and export there.",
    embeddedHintFallback:
      "The embedded browser cannot print directly. Copy the address into Edge / Chrome and export there.",
    printTipTitle: "Print settings reminder",
    printTipTarget: "Set the destination to “Save as PDF”",
    printTipMargins: "Set margins to “None” (A4 layout margins are built in)",
    printTipBackground:
      "If colors are missing in the PDF, expand “More settings” and enable “Background graphics”",
    printTipScale: "Keep scale “Default”; do not use “Fit to page width”",
    continuePrint: "Continue to Print",
  },
} satisfies Record<Language, Record<string, string>>;

const defaultUiState = (): StoredUiState => ({
  activeSectionId: "profile",
  sectionConfigs: defaultSectionConfigs(),
});

const loadUiState = (): StoredUiState => {
  try {
    const raw = window.localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) {
      return defaultUiState();
    }

    const parsed = JSON.parse(raw) as Partial<StoredUiState>;
    const fallback = defaultSectionConfigs();
    const nextConfigs = fallback.map((item) => {
      const matched = parsed.sectionConfigs?.find((config) => config.id === item.id);
      return matched ? { ...item, visible: matched.visible } : item;
    });
    const ordered = (parsed.sectionConfigs ?? [])
      .map((config) => nextConfigs.find((item) => item.id === config.id))
      .filter(Boolean) as SectionConfig[];

    return {
      activeSectionId: parsed.activeSectionId ?? "profile",
      sectionConfigs: ordered.concat(
        nextConfigs.filter((item) => !ordered.some((orderedItem) => orderedItem.id === item.id)),
      ),
    };
  } catch {
    return defaultUiState();
  }
};

// Electron 等内嵌 WebView 的 window.print() 走系统原生打印通路，
// 已知会输出空白页；导出必须引导到真实浏览器完成。
const isEmbeddedWebview = (): boolean =>
  typeof navigator !== "undefined" && /electron/i.test(navigator.userAgent);

const WorkspaceContent = ({ language }: { language: Language }) => {
  const { resume, dispatch, loadSample, clearResume } = useResumeState();
  const [searchParams] = useSearchParams();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorSectionRefs = useRef<Partial<Record<ManagedSectionId, HTMLElement | null>>>({});
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [{ activeSectionId, sectionConfigs }, setUiState] = useState(loadUiState);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const copy = pageCopy[language];

  useEffect(() => {
    window.localStorage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({ activeSectionId, sectionConfigs } satisfies StoredUiState),
    );
  }, [activeSectionId, sectionConfigs]);

  useEffect(() => {
    const theme = searchParams.get("theme");
    if (!isThemeId(theme) || theme === resume.theme.themeId) {
      return;
    }

    dispatch({ type: "apply-theme", theme: getThemePreset(theme).values });
  }, [dispatch, resume.theme.themeId, searchParams]);

  const visiblePreviewSections = useMemo(
    () => sectionConfigs.filter((item) => item.visible),
    [sectionConfigs],
  );

  const activateSection = useCallback((sectionId: ManagedSectionId) => {
    const target = editorSectionRefs.current[sectionId];
    const container = editorContainerRef.current;
    // 展开一节会收起上一节，上方内容高度变化会让视口跳到内容尾部；
    // 记录标题点击前的视口位置，DOM 更新后按偏移补偿 scrollTop，保持标题原位
    const beforeTop = target?.getBoundingClientRect().top ?? null;

    flushSync(() => {
      setUiState((current) => ({
        ...current,
        activeSectionId: current.activeSectionId === sectionId ? null : sectionId,
      }));
    });

    if (target && container && beforeTop !== null) {
      const delta = target.getBoundingClientRect().top - beforeTop;
      if (Math.abs(delta) > 1) {
        container.scrollTop += delta;
      }
    }
  }, []);

  const registerEditorSectionRef = useCallback(
    (sectionId: ManagedSectionId) => (element: HTMLElement | null) => {
      editorSectionRefs.current[sectionId] = element;
    },
    [],
  );

  const activateSectionFromPreview = useCallback((sectionId: ManagedSectionId) => {
    // 先同步提交展开，再基于更新后的布局滚动定位，避免按旧布局滚动到内容尾部
    flushSync(() => {
      setUiState((current) => ({ ...current, activeSectionId: sectionId }));
    });

    const container = editorContainerRef.current;
    const target = editorSectionRefs.current[sectionId];
    if (!container || !target) {
      return;
    }

    const delta = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({
      top: Math.max(0, container.scrollTop + delta - 10),
      behavior: "smooth",
    });
  }, []);

  const handleMoveSection = useCallback((sectionId: ManagedSectionId, direction: "up" | "down") => {
    setUiState((current) => {
      const currentIndex = current.sectionConfigs.findIndex((item) => item.id === sectionId);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= current.sectionConfigs.length) {
        return current;
      }

      const targetSectionId = current.sectionConfigs[targetIndex]?.id;
      if (!targetSectionId) {
        return current;
      }

      return {
        ...current,
        sectionConfigs: reorderSection(current.sectionConfigs, sectionId, targetSectionId),
      };
    });
  }, []);

  const handleToggleSectionVisibility = useCallback((sectionId: ManagedSectionId) => {
    if (sectionId === "profile") {
      return;
    }

    setUiState((current) => {
      const nextConfigs = current.sectionConfigs.map((item) =>
        item.id === sectionId ? { ...item, visible: !item.visible } : item,
      );
      const nextActive =
        nextConfigs.find((item) => item.id === current.activeSectionId)?.visible === false
          ? nextConfigs.find((item) => item.visible)?.id ?? "profile"
          : current.activeSectionId;

      return { activeSectionId: nextActive, sectionConfigs: nextConfigs };
    });
  }, []);

  const handleExportPdf = useCallback(async () => {
    if (!isEmbeddedWebview()) {
      // 先展示打印设置提醒（背景图形等），用户确认后再调起打印
      setPrintDialogOpen(true);
      return;
    }

    // 内嵌 WebView：复制地址并尝试唤起系统浏览器，打印必须在真实浏览器中完成
    let copied = false;
    try {
      await navigator.clipboard.writeText(window.location.href);
      copied = true;
    } catch {
      copied = false;
    }
    window.open(window.location.href, "_blank");
    toast(copied ? copy.embeddedHint : copy.embeddedHintFallback, { duration: 10000 });
  }, [copy.embeddedHint, copy.embeddedHintFallback]);

  const handleContinuePrint = useCallback(() => {
    setPrintDialogOpen(false);
    // 等弹窗关闭（含退出动画）后再调起打印，避免把弹窗打进 PDF
    window.setTimeout(() => window.print(), 250);
  }, []);

  const printTips = [
    copy.printTipTarget,
    copy.printTipMargins,
    copy.printTipBackground,
    copy.printTipScale,
  ];

  return (
    <main className="flex flex-col lg:h-dvh lg:overflow-hidden print:block print:h-auto print:overflow-visible">
      <header className="app-chrome flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card/70 px-3 backdrop-blur print:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <BrandMark language={language} />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link to="/">
              <ArrowLeft className="size-3.5" />
              {copy.back}
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={loadSample}>
            {copy.sample}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setClearDialogOpen(true)}
          >
            {copy.clear}
          </Button>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <div className="hidden items-center gap-2 sm:flex">
            <LanguageSwitch />
            <ModeSwitch />
            <Separator orientation="vertical" className="mx-1 h-5" />
          </div>
          <Button size="sm" onClick={handleExportPdf}>
            <Printer className="size-3.5" />
            {copy.export}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row print:block">
        <EditorPane
          language={language}
          resume={resume}
          editorContainerRef={editorContainerRef}
          registerEditorSectionRef={registerEditorSectionRef}
          sectionConfigs={sectionConfigs}
          activeSectionId={activeSectionId}
          onSectionInteract={activateSection}
          onMoveSection={handleMoveSection}
          onToggleSectionVisibility={handleToggleSectionVisibility}
        />
        <div className="flex min-h-0 min-w-0 flex-1 print:block">
          <PreviewPane
            language={language}
            resume={resume}
            previewContainerRef={previewContainerRef}
            orderedSections={visiblePreviewSections}
            onSectionInteract={activateSectionFromPreview}
          />
        </div>
      </div>

      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.printTipTitle}</DialogTitle>
            <DialogDescription>{copy.printTipTarget}</DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {printTips.slice(1).map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="text-border">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
              {copy.cancel}
            </Button>
            <Button onClick={handleContinuePrint}>{copy.continuePrint}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{copy.clearConfirmTitle}</DialogTitle>
            <DialogDescription>{copy.clearConfirmBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              {copy.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearResume();
                setClearDialogOpen(false);
              }}
            >
              {copy.confirmClear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export const WorkspacePage = ({ language }: { language: Language }) => (
  <ResumeStateProvider language={language}>
    <WorkspaceContent language={language} />
  </ResumeStateProvider>
);
