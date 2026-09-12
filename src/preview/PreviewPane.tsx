import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { renderMarkdown } from "../lib/renderMarkdown";
import { getThemePreset } from "../lib/themePresets";
import type { Language, PreviewSectionId, ResumeData, SectionConfig } from "../types";
import { buildPageLabel, previewCopy } from "./copy";
import {
  FALLBACK_HEADER_HEIGHT,
  FALLBACK_ITEM_HEIGHT,
  FALLBACK_PROFILE_HEIGHT,
  paginateResume,
  type SectionDef,
} from "./paginate";

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

// offsetHeight 不含外边距，而模块条等元素的外边距会占用页面高度，
// 测量时必须一并计入，否则导出时内容会比测量值偏高。
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

const ResumeEntry = ({
  title,
  subtitle,
  date,
  extra,
  content,
}: {
  title: string;
  subtitle: string;
  date: string;
  extra?: string;
  content?: string;
}) => (
  <article className="resume-entry">
    <div className="resume-entry__header">
      <div className="resume-entry__title">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <span className="resume-entry__date">{date}</span>
    </div>
    {extra ? <p className="resume-entry__location">{extra}</p> : null}
    {content ? <div className="markdown-content">{renderMarkdown(content)}</div> : null}
  </article>
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
  const [profileHeight, setProfileHeight] = useState(FALLBACK_PROFILE_HEIGHT);
  const [headerHeights, setHeaderHeights] = useState<Partial<Record<PreviewSectionId, number>>>({});
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

  const primaryInfo = useMemo(
    () => [
      profile.phone ? `${labels.phone}: ${profile.phone}` : "",
      profile.email ? `${labels.email}: ${profile.email}` : "",
      profile.website ? `${labels.website}: ${profile.website}` : "",
      profile.location ? `${labels.location}: ${profile.location}` : "",
    ],
    [labels.email, labels.location, labels.phone, labels.website, profile.email, profile.location, profile.phone, profile.website],
  );
  const secondaryInfo = useMemo(
    () => [
      profile.age ? `${labels.age}: ${profile.age}` : "",
      profile.gender ? `${labels.gender}: ${profile.gender}` : "",
      profile.ethnicity ? `${labels.ethnicity}: ${profile.ethnicity}` : "",
      profile.politicalStatus ? `${labels.politicalStatus}: ${profile.politicalStatus}` : "",
    ],
    [labels.age, labels.ethnicity, labels.gender, labels.politicalStatus, profile.age, profile.ethnicity, profile.gender, profile.politicalStatus],
  );
  const tertiaryInfo = useMemo(
    () => [
      profile.currentStatus ? `${labels.currentStatus}: ${profile.currentStatus}` : "",
      profile.jobIntent ? `${labels.jobIntent}: ${profile.jobIntent}` : "",
    ],
    [labels.currentStatus, labels.jobIntent, profile.currentStatus, profile.jobIntent],
  );

  const profileNode = useMemo(
    () => (
      <header className="resume-header" onPointerDown={() => onSectionInteract("profile")}>
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
        <InfoRow items={primaryInfo} />
        <InfoRow items={secondaryInfo} />
        <InfoRow items={tertiaryInfo} />
        {profile.summary ? (
          <div className="resume-summary markdown-content">{renderMarkdown(profile.summary)}</div>
        ) : null}
      </header>
    ),
    [labels.avatar, labels.profileName, labels.profileTitle, onSectionInteract, primaryInfo, profile, secondaryInfo, tertiaryInfo, theme.showAvatar],
  );

  const visibleSections = useMemo<SectionDef[]>(() => {
    const result: SectionDef[] = [];

    orderedSections.forEach((section) => {
      switch (section.id) {
        case "profile":
          break;
        case "education":
          if (resume.education.length) {
            result.push({
              id: "education",
              title: labels.education,
              items: resume.education.map((item) => ({
                key: item.id,
                node: (
                  <ResumeEntry
                    title={item.school || labels.school}
                    subtitle={[item.degree, item.major].filter(Boolean).join(" / ")}
                    date={item.dateRange}
                    content={item.details}
                  />
                ),
              })),
            });
          }
          break;
        case "experience":
          if (resume.experience.length) {
            result.push({
              id: "experience",
              title: labels.experience,
              items: resume.experience.map((item) => ({
                key: item.id,
                node: (
                  <ResumeEntry
                    title={item.company || labels.company}
                    subtitle={item.role || labels.role}
                    date={item.dateRange}
                    extra={item.location}
                    content={item.content}
                  />
                ),
              })),
            });
          }
          break;
        case "projects":
          if (resume.projects.length) {
            result.push({
              id: "projects",
              title: labels.projects,
              items: resume.projects.map((item) => ({
                key: item.id,
                node: (
                  <ResumeEntry
                    title={item.name || labels.project}
                    subtitle={item.role || labels.projectRole}
                    date={item.dateRange}
                    extra={item.link}
                    content={item.content}
                  />
                ),
              })),
            });
          }
          break;
        case "skills":
          if (resume.skills.length) {
            result.push({
              id: "skills",
              title: labels.skills,
              items: resume.skills.map((item) => ({
                key: item.id,
                node: (
                  <div className="resume-skill-item">
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                ),
              })),
            });
          }
          break;
        case "customSections":
          if (resume.customSections.length) {
            resume.customSections.forEach((item) => {
              result.push({
                id: "customSections",
                title: item.title || labels.custom,
                items: [
                  {
                    key: item.id,
                    node: (
                      <article className="resume-entry">
                        <div className="markdown-content">{renderMarkdown(item.content)}</div>
                      </article>
                    ),
                  },
                ],
              });
            });
          }
          break;
      }
    });

    return result;
  }, [labels, orderedSections, resume.customSections, resume.education, resume.experience, resume.projects, resume.skills]);

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

    const nextProfileHeight =
      measureHeightWithMargins(layer.querySelector<HTMLElement>("[data-measure-profile]")) ??
      FALLBACK_PROFILE_HEIGHT;

    const nextHeaderHeights = visibleSections.reduce<Partial<Record<PreviewSectionId, number>>>((acc, section) => {
      acc[section.id] =
        measureHeightWithMargins(layer.querySelector<HTMLElement>(`[data-measure-header="${section.id}"]`)) ??
        FALLBACK_HEADER_HEIGHT;
      return acc;
    }, {});

    const nextItemHeights = visibleSections.reduce<Record<string, number>>((acc, section) => {
      section.items.forEach((item) => {
        acc[item.key] =
          measureHeightWithMargins(layer.querySelector<HTMLElement>(`[data-measure-item="${item.key}"]`)) ??
          FALLBACK_ITEM_HEIGHT;
      });
      return acc;
    }, {});

    setProfileHeight(nextProfileHeight);
    setHeaderHeights(nextHeaderHeights);
    setItemHeights(nextItemHeights);
  }, [pageClassName, pageStyle, profileNode, visibleSections]);

  const pages = useMemo(
    () =>
      paginateResume({
        profileNode,
        profileHeight,
        hasProfile: orderedSections.some((section) => section.id === "profile"),
        sections: visibleSections,
        headerHeights,
        itemHeights,
        maxContentHeight: PAGE_CONTENT_HEIGHT_PX,
        sectionSpacing: Number(theme.sectionSpacing) || 18,
        sectionDividerGap: theme.showDividers ? 2 : 0,
        blockGap: densityGapMap[theme.density],
      }),
    [
      headerHeights,
      itemHeights,
      orderedSections,
      profileHeight,
      profileNode,
      theme.density,
      theme.sectionSpacing,
      visibleSections,
    ],
  );

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

                  {page.chunks.map((chunk, chunkIndex) => {
                    if (chunk.kind === "profile") {
                      return <div key={`profile-${index}`}>{chunk.node}</div>;
                    }

                    return (
                      <section
                        key={`${chunk.sectionId}-${chunkIndex}`}
                        className="resume-section"
                        onPointerDown={() => onSectionInteract(chunk.sectionId)}
                      >
                        <SectionBar title={chunk.title} />
                        <div className="resume-section__content">
                          {chunk.items.map((item) => (
                            <div key={item.key}>{item.node}</div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="resume-measure-layer" aria-hidden="true">
          <div ref={measureLayerRef} className="resume-measure-frame" style={{ width: `${PAGE_WIDTH_PX}px` }}>
            <div
              className={pageClassName}
              style={pageStyle}
            >
              <div data-measure-profile>{profileNode}</div>
              {visibleSections.map((section) => (
                <div key={`measure-${section.id}`}>
                  <div data-measure-header={section.id}>
                    <SectionBar title={section.title} />
                  </div>
                  {section.items.map((item) => (
                    <div key={`measure-item-${item.key}`} data-measure-item={item.key}>
                      {item.node}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
