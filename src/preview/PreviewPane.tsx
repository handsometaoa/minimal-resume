import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  parseMarkdown,
  renderMarkdown,
  renderMarkdownBlock,
  renderMarkdownListItem,
} from "../lib/renderMarkdown";
import { getThemePreset } from "../lib/themePresets";
import type { Language, PreviewSectionId, ResumeData, SectionConfig } from "../types";
import { buildPageLabel, previewCopy } from "./copy";
import { packFlowPages, type FlowBlock, type FlowPiece } from "./flowEngine";

interface PreviewPaneProps {
  language: Language;
  resume: ResumeData;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  orderedSections: SectionConfig[];
  onSectionInteract: (sectionId: PreviewSectionId) => void;
}

const densityClassMap = {
  compact: "density-compact",
  balanced: "density-balanced",
  airy: "density-airy",
} as const;

const densityGapMap = {
  compact: 8,
  balanced: 10,
  airy: 14,
} as const;

const MM_TO_PX = 96 / 25.4;
// 页面几何固定为真实打印尺寸（A4），预览只做等比缩放，
// 保证导出 PDF 时的排版与分页测量完全一致。
const PAGE_WIDTH_PX = Math.round(210 * MM_TO_PX);
// 可打印内容高度 297 - 11 - 10 = 276mm，预留 4px 取整/亚像素余量
const PAGE_CONTENT_HEIGHT_PX = Math.floor(276 * MM_TO_PX) - 4;

const LIST_ITEM_GAP = 4; // .markdown-content li + li 间距
const ENTRY_PART_GAP = 6; // 经历标题与第一块内容之间（原 resume-entry flex gap）
const MARKDOWN_BLOCK_GAP = 8; // markdown 块之间（原 markdown-content flex gap）

const FALLBACK_BLOCK_HEIGHT = 40;
const FALLBACK_ITEM_HEIGHT = 24;

// offsetHeight 不含外边距，测量时一并计入，保证与真实占位一致
const measureHeightWithMargins = (element: HTMLElement | null): number | null => {
  if (!element) return null;
  const style = window.getComputedStyle(element);
  const marginTop = Number.parseFloat(style.marginTop) || 0;
  const marginBottom = Number.parseFloat(style.marginBottom) || 0;
  return element.offsetHeight + marginTop + marginBottom;
};

const SectionBar = ({ title }: { title: string }) => (
  <div className="resume-section__bar">
    <span className="resume-section__marker" />
    <h3>{title}</h3>
  </div>
);

const InfoRow = ({ items }: { items: string[] }) => (
  <div className="resume-info-row">
    {items.filter(Boolean).map((item, index) => (
      <span key={`${item}-${index}`}>{item}</span>
    ))}
  </div>
);

const EntryHeader = ({
  title,
  subtitle,
  date,
  extra,
}: {
  title: string;
  subtitle: string;
  date: string;
  extra?: string;
}) => (
  <div className="resume-entry">
    <div className="resume-entry__header">
      <div className="resume-entry__title">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <span className="resume-entry__date">{date}</span>
    </div>
    {extra ? <p className="resume-entry__location">{extra}</p> : null}
  </div>
);

export const PreviewPane = ({
  language,
  resume,
  previewContainerRef,
  orderedSections,
  onSectionInteract,
}: PreviewPaneProps) => {
  const { profile, theme } = resume;
  const labels = previewCopy[language];
  const themePreset = getThemePreset(theme.themeId);
  const measureLayerRef = useRef<HTMLDivElement>(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [blockHeights, setBlockHeights] = useState<Record<string, number>>({});
  const [itemHeights, setItemHeights] = useState<Record<string, number>>({});

  const pageClassName = [
    "resume-page",
    densityClassMap[theme.density],
    `resume-page--${themePreset.id}`,
    `resume-page--avatar-${theme.avatarStyle}`,
    theme.showDividers ? "resume-page--with-dividers" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const pageStyle = useMemo(
    () =>
      ({
        "--page-width": `${PAGE_WIDTH_PX}px`,
        "--page-padding-top": "11mm",
        "--page-padding-right": "12mm",
        "--page-padding-bottom": "10mm",
        "--page-padding-left": "12mm",
        "--accent-color": theme.accentColor,
        "--heading-size": `${theme.headingSize}px`,
        "--info-line-height": theme.infoLineHeight,
        "--section-spacing": `${theme.sectionSpacing}px`,
      }) as CSSProperties,
    [theme.accentColor, theme.headingSize, theme.infoLineHeight, theme.sectionSpacing],
  );

  const profileNode = useMemo(
    () => (
      <header className="resume-header">
        <div className="resume-header__title-block">
          <div className="resume-header__title-text">
            <h1>{profile.fullName || labels.profileName}</h1>
            <p className="resume-header__title">{profile.title || labels.profileTitle}</p>
          </div>
          {theme.showAvatar ? (
            profile.avatarUrl ? (
              <img className="resume-avatar" src={profile.avatarUrl} alt={profile.fullName} />
            ) : (
              <div className="resume-avatar resume-avatar--placeholder">{labels.avatar}</div>
            )
          ) : null}
        </div>
        <InfoRow
          items={[
            profile.phone ? `${labels.phone}: ${profile.phone}` : "",
            profile.email ? `${labels.email}: ${profile.email}` : "",
            profile.website ? `${labels.website}: ${profile.website}` : "",
            profile.location ? `${labels.location}: ${profile.location}` : "",
          ]}
        />
        <InfoRow
          items={[
            profile.age ? `${labels.age}: ${profile.age}` : "",
            profile.gender ? `${labels.gender}: ${profile.gender}` : "",
            profile.ethnicity ? `${labels.ethnicity}: ${profile.ethnicity}` : "",
            profile.politicalStatus ? `${labels.politicalStatus}: ${profile.politicalStatus}` : "",
          ]}
        />
        <InfoRow
          items={[
            profile.currentStatus ? `${labels.currentStatus}: ${profile.currentStatus}` : "",
            profile.jobIntent ? `${labels.jobIntent}: ${profile.jobIntent}` : "",
          ]}
        />
        {profile.summary ? (
          <div className="resume-summary markdown-content">{renderMarkdown(profile.summary)}</div>
        ) : null}
      </header>
    ),
    [labels, profile, theme.showAvatar],
  );

  const flowBlocks = useMemo<FlowBlock[]>(() => {
    const result: FlowBlock[] = [];
    const sectionGap = Number(theme.sectionSpacing) || 18;
    const entryGap = densityGapMap[theme.density];

    const pushBar = (group: string, sectionId: PreviewSectionId, title: string) => {
      result.push({
        key: `bar-${group}`,
        kind: "section-bar",
        group,
        sectionId,
        entryId: group,
        node: <SectionBar title={title} />,
        spaceBefore: sectionGap,
        keepWithNext: true,
      });
    };

    const pushContentBlocks = (
      group: string,
      sectionId: PreviewSectionId,
      entryId: string,
      content: string,
    ) => {
      parseMarkdown(content).forEach((mb, i) => {
        const key = `md-${entryId}-${i}`;
        if (mb.kind === "list") {
          // 列表按项拆分：引擎可在列表项边界断页
          result.push({
            key,
            kind: "content",
            group,
            sectionId,
            entryId,
            spaceBefore: i === 0 ? ENTRY_PART_GAP : MARKDOWN_BLOCK_GAP,
            keepWithNext: false,
            items: mb.items.map((text, idx) => ({
              key: `${key}-li-${idx}`,
              node: renderMarkdownListItem(text, `${key}-li-${idx}`),
            })),
            itemGap: LIST_ITEM_GAP,
          });
          return;
        }
        result.push({
          key,
          kind: "content",
          group,
          sectionId,
          entryId,
          node: <div className="markdown-content">{renderMarkdownBlock(mb, key)}</div>,
          spaceBefore: i === 0 ? ENTRY_PART_GAP : MARKDOWN_BLOCK_GAP,
          keepWithNext: mb.kind === "heading",
        });
      });
    };

    const pushEntry = (
      group: string,
      sectionId: PreviewSectionId,
      entryId: string,
      header: ReactNode,
      content: string,
    ) => {
      result.push({
        key: `head-${entryId}`,
        kind: "entry-header",
        group,
        sectionId,
        entryId,
        node: header,
        spaceBefore: entryGap,
        keepWithNext: true,
      });
      pushContentBlocks(group, sectionId, entryId, content);
    };

    orderedSections.forEach((section) => {
      switch (section.id) {
        case "profile":
          result.push({
            key: "profile",
            kind: "profile",
            group: "profile",
            sectionId: "profile",
            entryId: "profile",
            node: profileNode,
            spaceBefore: 0,
            keepWithNext: false,
          });
          break;
        case "education":
          if (resume.education.length) {
            pushBar("education", "education", labels.education);
            resume.education.forEach((item) => {
              pushEntry(
                "education",
                "education",
                item.id,
                <EntryHeader
                  title={item.school || labels.school}
                  subtitle={[item.degree, item.major].filter(Boolean).join(" / ")}
                  date={item.dateRange}
                />,
                item.details,
              );
            });
          }
          break;
        case "experience":
          if (resume.experience.length) {
            pushBar("experience", "experience", labels.experience);
            resume.experience.forEach((item) => {
              pushEntry(
                "experience",
                "experience",
                item.id,
                <EntryHeader
                  title={item.company || labels.company}
                  subtitle={item.role || labels.role}
                  date={item.dateRange}
                  extra={item.location}
                />,
                item.content,
              );
            });
          }
          break;
        case "projects":
          if (resume.projects.length) {
            pushBar("projects", "projects", labels.projects);
            resume.projects.forEach((item) => {
              pushEntry(
                "projects",
                "projects",
                item.id,
                <EntryHeader
                  title={item.name || labels.project}
                  subtitle={item.role || labels.projectRole}
                  date={item.dateRange}
                  extra={item.link}
                />,
                item.content,
              );
            });
          }
          break;
        case "skills":
          if (resume.skills.length) {
            pushBar("skills", "skills", labels.skills);
            resume.skills.forEach((item) => {
              result.push({
                key: `skill-${item.id}`,
                kind: "content",
                group: "skills",
                sectionId: "skills",
                entryId: "skills",
                node: (
                  <div className="resume-skill-item">
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                ),
                spaceBefore: entryGap,
                keepWithNext: false,
              });
            });
          }
          break;
        case "customSections":
          resume.customSections.forEach((item) => {
            const group = `custom-${item.id}`;
            pushBar(group, "customSections", item.title || labels.custom);
            pushContentBlocks(group, "customSections", group, item.content);
          });
          break;
      }
    });

    return result;
  }, [orderedSections, resume, labels, profileNode, theme.density, theme.sectionSpacing]);

  const flowBlockByKey = useMemo(
    () => new Map(flowBlocks.map((block) => [block.key, block])),
    [flowBlocks],
  );

  useLayoutEffect(() => {
    const node = previewContainerRef.current;
    if (!node) {
      return;
    }

    const updateScale = () => {
      const available = Math.max(320, Math.floor(node.clientWidth - 24));
      setDisplayScale(Math.min(1, available / PAGE_WIDTH_PX));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(node);

    return () => observer.disconnect();
  }, [previewContainerRef]);

  useLayoutEffect(() => {
    const layer = measureLayerRef.current;
    if (!layer) {
      return;
    }

    const nextBlockHeights: Record<string, number> = {};
    layer.querySelectorAll<HTMLElement>("[data-measure-block]").forEach((el) => {
      const key = el.getAttribute("data-measure-block");
      if (key) {
        nextBlockHeights[key] = measureHeightWithMargins(el) ?? FALLBACK_BLOCK_HEIGHT;
      }
    });

    const nextItemHeights: Record<string, number> = {};
    layer.querySelectorAll<HTMLElement>("[data-measure-item]").forEach((el) => {
      const key = el.getAttribute("data-measure-item");
      if (key) {
        nextItemHeights[key] = measureHeightWithMargins(el) ?? FALLBACK_ITEM_HEIGHT;
      }
    });

    setBlockHeights(nextBlockHeights);
    setItemHeights(nextItemHeights);
  }, [pageClassName, pageStyle, profileNode, flowBlocks]);

  const pages = useMemo(
    () =>
      packFlowPages({
        blocks: flowBlocks,
        heights: blockHeights,
        itemHeights,
        maxContentHeight: PAGE_CONTENT_HEIGHT_PX,
        dividerGap: theme.showDividers ? 2 : 0,
      }),
    [blockHeights, flowBlocks, itemHeights, theme.showDividers],
  );

  const renderPiece = (piece: FlowPiece): ReactNode => {
    if (piece.type === "node") {
      return piece.node;
    }
    const block = flowBlockByKey.get(piece.blockKey);
    const items = (block?.items ?? []).slice(piece.from, piece.to);
    return (
      <div className="markdown-content">
        <ul>{items.map((item) => item.node)}</ul>
      </div>
    );
  };

  return (
    <section className="preview-shell">
      <div ref={previewContainerRef} className="preview-canvas">
        <div className="preview-pages">
          {pages.map((page, index) => (
            <article
              key={`page-${index}`}
              className="resume-page-sheet"
              style={{ width: `${PAGE_WIDTH_PX * displayScale}px` }}
            >
              <div className="resume-page-sheet__meta">{buildPageLabel(language, index)}</div>
              <div className="resume-page-frame">
                <div
                  className={pageClassName}
                  style={{ ...pageStyle, transform: `scale(${displayScale})` } as CSSProperties}
                >
                  <div className="resume-page__pattern" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>

                  {page.pieces.map((piece) => (
                    <div
                      key={piece.key}
                      className="resume-block"
                      style={{ marginTop: piece.spaceBefore }}
                      data-section-id={piece.sectionId}
                      onPointerDown={() => onSectionInteract(piece.sectionId)}
                    >
                      {renderPiece(piece)}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="resume-measure-layer" aria-hidden="true">
          <div ref={measureLayerRef} className="resume-measure-frame" style={{ width: `${PAGE_WIDTH_PX}px` }}>
            <div className={pageClassName} style={pageStyle}>
              {flowBlocks.map((block) => (
                <div key={block.key} data-measure-block={block.key} className="resume-block">
                  {block.items ? (
                    <div className="markdown-content">
                      <ul>{block.items.map((item) => item.node)}</ul>
                    </div>
                  ) : (
                    block.node
                  )}
                </div>
              ))}
              {flowBlocks.map((block) =>
                (block.items ?? []).map((item) => (
                  <div key={item.key} data-measure-item={item.key} className="resume-block">
                    <div className="markdown-content">
                      <ul>{item.node}</ul>
                    </div>
                  </div>
                )),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
