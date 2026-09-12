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

const PAGE_MAX_WIDTH = 820;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PAGE_PADDING_TOP_MM = 11;
const PAGE_PADDING_RIGHT_MM = 12;
const PAGE_PADDING_BOTTOM_MM = 10;
const PAGE_PADDING_LEFT_MM = 12;
const PAGE_CONTENT_HEIGHT_RATIO = (PAGE_HEIGHT_MM - PAGE_PADDING_TOP_MM - PAGE_PADDING_BOTTOM_MM) / PAGE_WIDTH_MM;

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
  const [pageWidth, setPageWidth] = useState(PAGE_MAX_WIDTH);
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
        "--accent-color": theme.accentColor,
        "--heading-size": `${theme.headingSize}px`,
        "--info-line-height": theme.infoLineHeight,
        "--section-spacing": `${theme.sectionSpacing}px`,
        "--page-width": `${pageWidth}px`,
        "--page-padding-top": `${(pageWidth * PAGE_PADDING_TOP_MM) / PAGE_WIDTH_MM}px`,
        "--page-padding-right": `${(pageWidth * PAGE_PADDING_RIGHT_MM) / PAGE_WIDTH_MM}px`,
        "--page-padding-bottom": `${(pageWidth * PAGE_PADDING_BOTTOM_MM) / PAGE_WIDTH_MM}px`,
        "--page-padding-left": `${(pageWidth * PAGE_PADDING_LEFT_MM) / PAGE_WIDTH_MM}px`,
      }) as CSSProperties,
    [pageWidth, theme.accentColor, theme.headingSize, theme.infoLineHeight, theme.sectionSpacing],
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

    const updateWidth = () => {
      const nextWidth = Math.min(PAGE_MAX_WIDTH, Math.max(320, Math.floor(node.clientWidth - 24)));
      setPageWidth(nextWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, [previewContainerRef]);

  useLayoutEffect(() => {
    const layer = measureLayerRef.current;
    if (!layer) {
      return;
    }

    const nextProfileHeight =
      layer.querySelector<HTMLElement>("[data-measure-profile]")?.offsetHeight ?? FALLBACK_PROFILE_HEIGHT;

    const nextHeaderHeights = visibleSections.reduce<Partial<Record<PreviewSectionId, number>>>((acc, section) => {
      acc[section.id] =
        layer.querySelector<HTMLElement>(`[data-measure-header="${section.id}"]`)?.offsetHeight ??
        FALLBACK_HEADER_HEIGHT;
      return acc;
    }, {});

    const nextItemHeights = visibleSections.reduce<Record<string, number>>((acc, section) => {
      section.items.forEach((item) => {
        acc[item.key] =
          layer.querySelector<HTMLElement>(`[data-measure-item="${item.key}"]`)?.offsetHeight ??
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
        maxContentHeight: Math.max(480, Math.round(pageWidth * PAGE_CONTENT_HEIGHT_RATIO)),
        sectionSpacing: Number(theme.sectionSpacing) || 18,
        blockGap: densityGapMap[theme.density],
      }),
    [
      headerHeights,
      itemHeights,
      orderedSections,
      pageWidth,
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
            <article key={`page-${index}`} className="resume-page-sheet">
              <div className="resume-page-sheet__meta">{buildPageLabel(language, index)}</div>
              <div
                className={pageClassName}
                style={pageStyle}
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
            </article>
          ))}
        </div>

        <div className="resume-measure-layer" aria-hidden="true">
          <div ref={measureLayerRef} className="resume-measure-frame" style={{ width: `${pageWidth}px` }}>
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
