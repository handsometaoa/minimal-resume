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
  },
  en: {
    back: "Back to Templates",
    sample: "Load Sample",
    clear: "Clear",
    export: "Export PDF",
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

const WorkspaceContent = ({ language }: { language: Language }) => {
  const { resume, dispatch, loadSample, clearResume } = useResumeState();
  const [searchParams] = useSearchParams();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorSectionRefs = useRef<Partial<Record<ManagedSectionId, HTMLElement | null>>>({});
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [{ activeSectionId, sectionConfigs }, setUiState] = useState(loadUiState);
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
            <button type="button" className="primary-button" onClick={() => window.print()}>
              {copy.export}
            </button>
          </div>
        </div>

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
