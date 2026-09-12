import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EditorPane } from "../editor/EditorPane";
import { defaultSectionConfigs, reorderSection } from "../lib/sectionConfigs";
import { getThemePreset, isThemeId } from "../lib/themePresets";
import { PreviewPane } from "../preview/PreviewPane";
import { ResumeStateProvider, useResumeState } from "../state/resumeState";
import type { Language, ManagedSectionId, SectionConfig } from "../types";

const UI_STORAGE_KEY = "minimal-resume:ui";

interface StoredUiState {
  activeSectionId: ManagedSectionId | null;
  sectionConfigs: SectionConfig[];
}

const pageCopy = {
  zh: {
    back: "返回模板页",
    sample: "载入示例",
    clear: "清空内容",
    export: "导出 PDF",
    embeddedHint:
      "内嵌浏览器无法直接打印，已复制本页地址。请在 Edge / Chrome 中打开后点击“导出 PDF”。",
    embeddedHintFallback: "内嵌浏览器无法直接打印，请复制地址栏链接到 Edge / Chrome 打开后导出。",
    gotIt: "知道了",
    printTipTitle: "打印设置提醒",
    printTipTarget: "目标选择“另存为 PDF”",
    printTipMargins: "边距选择“无”（页面已内置 A4 版式边距）",
    printTipBackground: "展开“更多设置”，勾选“背景图形”——否则模块标题色块与主题色不会出现在 PDF 中",
    printTipScale: "缩放保持“默认”，不要选“适合页面宽度”",
    continuePrint: "继续打印",
    cancel: "取消",
  },
  en: {
    back: "Back to Templates",
    sample: "Load Sample",
    clear: "Clear",
    export: "Export PDF",
    embeddedHint:
      "The embedded browser cannot print directly. The page link is copied — open it in Edge / Chrome and export there.",
    embeddedHintFallback:
      "The embedded browser cannot print directly. Copy the address into Edge / Chrome and export there.",
    gotIt: "OK",
    printTipTitle: "Print settings reminder",
    printTipTarget: "Set the destination to “Save as PDF”",
    printTipMargins: "Set margins to “None” (A4 layout margins are built in)",
    printTipBackground:
      "Expand “More settings” and enable “Background graphics”, otherwise section bars and accent colors will be missing",
    printTipScale: "Keep scale “Default”; do not use “Fit to page width”",
    continuePrint: "Continue to Print",
    cancel: "Cancel",
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
  const [hint, setHint] = useState<"none" | "embedded-copied" | "embedded-fallback" | "print-settings">("none");
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
    setUiState((current) => ({
      ...current,
      activeSectionId: current.activeSectionId === sectionId ? null : sectionId,
    }));
  }, []);

  const registerEditorSectionRef = useCallback(
    (sectionId: ManagedSectionId) => (element: HTMLElement | null) => {
      editorSectionRefs.current[sectionId] = element;
    },
    [],
  );

  const activateSectionFromPreview = useCallback((sectionId: ManagedSectionId) => {
    setUiState((current) => ({ ...current, activeSectionId: sectionId }));

    const container = editorContainerRef.current;
    const target = editorSectionRefs.current[sectionId];
    if (!container || !target) {
      return;
    }

    const nextTop = target.offsetTop - 10;
    container.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
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
      setHint("print-settings");
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
    setHint(copied ? "embedded-copied" : "embedded-fallback");
  }, []);

  const handleContinuePrint = useCallback(() => {
    setHint("none");
    window.print();
  }, []);

  // 弹窗打开期间支持 Esc 关闭
  useEffect(() => {
    if (hint !== "print-settings") {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHint("none");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hint]);

  return (
    <main className="page-shell page-shell--workspace">
      <section className="workspace-section">
        <div className="workspace-utilitybar panel">
          <Link to="/templates" className="landing-secondary workspace-backlink">
            {copy.back}
          </Link>
          <div className="workspace-toolbar">
            <button type="button" className="secondary-button" onClick={loadSample}>
              {copy.sample}
            </button>
            <button type="button" className="ghost-button" onClick={clearResume}>
              {copy.clear}
            </button>
            <button type="button" className="primary-button" onClick={handleExportPdf}>
              {copy.export}
            </button>
          </div>
        </div>

        {(hint === "embedded-copied" || hint === "embedded-fallback") && (
          <div className="workspace-utilitybar panel workspace-printhint">
            <span>{hint === "embedded-copied" ? copy.embeddedHint : copy.embeddedHintFallback}</span>
            <button type="button" className="ghost-button" onClick={() => setHint("none")}>
              {copy.gotIt}
            </button>
          </div>
        )}

        {hint === "print-settings" ? (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={copy.printTipTitle}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setHint("none");
              }
            }}
          >
            <div className="workspace-printmodal">
              <h2>{copy.printTipTitle}</h2>
              <ul>
                <li>{copy.printTipTarget}</li>
                <li>{copy.printTipMargins}</li>
                <li>{copy.printTipBackground}</li>
                <li>{copy.printTipScale}</li>
              </ul>
              <div className="inline-actions">
                <button type="button" className="ghost-button" onClick={() => setHint("none")}>
                  {copy.cancel}
                </button>
                <button type="button" className="primary-button" onClick={handleContinuePrint}>
                  {copy.continuePrint}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="app-shell app-shell--workspace-clean">
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
          <PreviewPane
            language={language}
            resume={resume}
            previewContainerRef={previewContainerRef}
            orderedSections={visiblePreviewSections}
            onSectionInteract={activateSectionFromPreview}
          />
        </div>
      </section>
    </main>
  );
};

export const WorkspacePage = ({ language }: { language: Language }) => (
  <ResumeStateProvider language={language}>
    <WorkspaceContent language={language} />
  </ResumeStateProvider>
);
