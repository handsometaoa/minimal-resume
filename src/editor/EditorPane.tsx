import { useState, type ChangeEvent, type ReactNode, type RefObject } from "react";
import { useResumeState } from "../state/resumeState";
import type {
  CustomSection,
  EducationItem,
  ExperienceItem,
  Language,
  ManagedSectionId,
  ProjectItem,
  ResumeData,
  SectionConfig,
  SkillItem,
} from "../types";

interface SectionCardProps {
  title: string;
  sectionId: ManagedSectionId;
  subtitle?: string;
  hidden?: boolean;
  expanded: boolean;
  children: ReactNode;
  registerEditorSectionRef: (sectionId: ManagedSectionId) => (element: HTMLElement | null) => void;
  onActivate: (sectionId: ManagedSectionId) => void;
  onMove: (sectionId: ManagedSectionId, direction: "up" | "down") => void;
  onToggleVisibility: (sectionId: ManagedSectionId) => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
  lockVisibility?: boolean;
  labels: {
    moveUp: string;
    moveDown: string;
    show: string;
    hide: string;
  };
}

interface CollectionSectionProps<T> extends Omit<SectionCardProps, "children"> {
  collection: "education" | "experience" | "projects" | "skills" | "customSections";
  items: T[];
  renderFields: (item: T) => ReactNode;
  renderItemTitle?: (item: T, index: number) => string;
  addLabel: string;
  removeLabel: string;
}

interface EditorPaneProps {
  language: Language;
  resume: ResumeData;
  editorContainerRef: RefObject<HTMLDivElement | null>;
  registerEditorSectionRef: (sectionId: ManagedSectionId) => (element: HTMLElement | null) => void;
  sectionConfigs: SectionConfig[];
  activeSectionId: ManagedSectionId | null;
  onSectionInteract: (sectionId: ManagedSectionId) => void;
  onMoveSection: (sectionId: ManagedSectionId, direction: "up" | "down") => void;
  onToggleSectionVisibility: (sectionId: ManagedSectionId) => void;
}

const copy = {
  zh: {
    moveUp: "上移",
    moveDown: "下移",
    show: "显示",
    hide: "隐藏",
    remove: "删除",
    markdownHint: "支持 Markdown：标题、列表、粗体、斜体、链接与换行",
    total: "共 ",
    item: " 项",
    profile: "基本信息",
    education: "教育经历",
    experience: "工作经历",
    projects: "项目经历",
    skills: "技能标签",
    customSections: "自定义模块",
    profileSubtitle: "姓名、联系方式、求职意向等",
    addEducation: "新增教育经历",
    addExperience: "新增工作经历",
    addProject: "新增项目经历",
    addSkill: "新增技能标签",
    addCustom: "新增自定义模块",
    themeTitle: "版式微调",
    themeSubtitle: "模板已在模板页确定，这里只保留简历版式与样式参数微调。",
    themeColor: "主题色",
    density: "排版密度",
    compact: "紧凑",
    balanced: "均衡",
    airy: "舒展",
    headingSize: "姓名字号",
    lineHeight: "基础行距",
    sectionSpacing: "模块间距",
    avatarStyle: "头像样式",
    square: "直角",
    rounded: "圆角",
    showAvatar: "显示头像",
    showDividers: "显示模块分隔",
    fullName: "姓名",
    title: "求职方向",
    phone: "电话",
    email: "邮箱",
    website: "个人网站",
    location: "现居城市",
    age: "年龄",
    gender: "性别",
    ethnicity: "民族",
    politicalStatus: "政治面貌",
    currentStatus: "当前状态",
    jobIntent: "求职意向",
    summary: "个人简介",
    avatarUpload: "本地上传头像",
    avatarPreview: "当前头像",
    avatarClear: "清除头像",
    avatarInvalid: "请选择图片文件。",
    avatarReadError: "头像读取失败，请重试。",
    school: "学校",
    degree: "学历",
    major: "专业",
    dateRange: "时间",
    details: "补充说明",
    company: "公司",
    role: "岗位",
    projectName: "项目名称",
    link: "链接",
    skillName: "标签名称",
    skillDetail: "详细说明",
    customTitle: "模块标题",
    customContent: "模块内容",
    workContent: "工作描述",
    projectContent: "项目描述",
  },
  en: {
    moveUp: "Up",
    moveDown: "Down",
    show: "Show",
    hide: "Hide",
    remove: "Delete",
    markdownHint: "Markdown supported: headings, lists, bold, italic, links, and line breaks",
    total: "",
    item: " items",
    profile: "Profile",
    education: "Education",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    customSections: "Custom",
    profileSubtitle: "Name, contact info, and job target",
    addEducation: "Add Education",
    addExperience: "Add Experience",
    addProject: "Add Project",
    addSkill: "Add Skill",
    addCustom: "Add Custom Section",
    themeTitle: "Layout Settings",
    themeSubtitle: "The template is selected on the templates page. Only layout and visual fine-tuning remain here.",
    themeColor: "Accent Color",
    density: "Density",
    compact: "Compact",
    balanced: "Balanced",
    airy: "Airy",
    headingSize: "Name Size",
    lineHeight: "Line Height",
    sectionSpacing: "Section Gap",
    avatarStyle: "Avatar Style",
    square: "Square",
    rounded: "Rounded",
    showAvatar: "Show Avatar",
    showDividers: "Show Dividers",
    fullName: "Full Name",
    title: "Target Role",
    phone: "Phone",
    email: "Email",
    website: "Website",
    location: "Location",
    age: "Age",
    gender: "Gender",
    ethnicity: "Ethnicity",
    politicalStatus: "Political Status",
    currentStatus: "Availability",
    jobIntent: "Job Intent",
    summary: "Summary",
    avatarUpload: "Upload Avatar",
    avatarPreview: "Current Avatar",
    avatarClear: "Remove Avatar",
    avatarInvalid: "Please select an image file.",
    avatarReadError: "Unable to read the selected file.",
    school: "School",
    degree: "Degree",
    major: "Major",
    dateRange: "Date Range",
    details: "Details",
    company: "Company",
    role: "Role",
    projectName: "Project Name",
    link: "Link",
    skillName: "Skill",
    skillDetail: "Details",
    customTitle: "Section Title",
    customContent: "Section Content",
    workContent: "Work Content",
    projectContent: "Project Content",
  },
} satisfies Record<Language, Record<string, string>>;

const SectionCard = ({
  title,
  sectionId,
  subtitle,
  hidden = false,
  expanded,
  children,
  registerEditorSectionRef,
  onActivate,
  onMove,
  onToggleVisibility,
  disableMoveUp,
  disableMoveDown,
  lockVisibility = false,
  labels,
}: SectionCardProps) => (
  <section
    ref={registerEditorSectionRef(sectionId)}
    className={`panel section-card ${hidden ? "section-card--hidden" : ""}`}
  >
    <div className="section-card__header">
      <button
        type="button"
        className="section-card__trigger"
        onClick={() => onActivate(sectionId)}
      >
        <div className="section-card__heading">
          <h2>{title}</h2>
          {subtitle ? <p className="section-card__subtitle">{subtitle}</p> : null}
        </div>
      </button>
      <div className="section-card__actions">
        {lockVisibility ? null : (
          <button
            type="button"
            className={hidden ? "secondary-button" : "ghost-button"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleVisibility(sectionId);
            }}
          >
            {hidden ? labels.show : labels.hide}
          </button>
        )}
        {disableMoveUp && disableMoveDown ? null : (
          <>
            <button
              type="button"
              className="ghost-button"
              disabled={disableMoveUp}
              onClick={(event) => {
                event.stopPropagation();
                onMove(sectionId, "up");
              }}
            >
              {labels.moveUp}
            </button>
            <button
              type="button"
              className="ghost-button"
              disabled={disableMoveDown}
              onClick={(event) => {
                event.stopPropagation();
                onMove(sectionId, "down");
              }}
            >
              {labels.moveDown}
            </button>
          </>
        )}
      </div>
    </div>
    {expanded && !hidden ? <div className="section-card__body">{children}</div> : null}
  </section>
);

const LabeledField = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint ? <small className="field__hint">{hint}</small> : null}
  </label>
);

const CollectionSection = <T extends { id: string },>({
  collection,
  items,
  renderFields,
  renderItemTitle,
  addLabel,
  removeLabel,
  ...sectionProps
}: CollectionSectionProps<T>) => {
  const { dispatch } = useResumeState();

  return (
    <SectionCard {...sectionProps}>
      <div className="stack-gap">
        {items.map((item, index) => (
          <article className="item-card" key={item.id}>
            <div className="item-card__header">
              <strong>
                {renderItemTitle ? renderItemTitle(item, index) : `${sectionProps.title} ${index + 1}`}
              </strong>
              <div className="inline-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    dispatch({ type: "move-item", collection, id: item.id, direction: "up" })
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    dispatch({ type: "move-item", collection, id: item.id, direction: "down" })
                  }
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => dispatch({ type: "remove-item", collection, id: item.id })}
                >
                  {removeLabel}
                </button>
              </div>
            </div>
            {renderFields(item)}
          </article>
        ))}
        <button
          type="button"
          className="secondary-button"
          onClick={() => dispatch({ type: "add-item", collection })}
        >
          {addLabel}
        </button>
      </div>
    </SectionCard>
  );
};

const renderSectionSubtitle = (
  config: SectionConfig,
  resume: ResumeData,
  language: Language,
  labels: Record<string, string>,
): string => {
  switch (config.id) {
    case "profile":
      return labels.profileSubtitle;
    case "education":
      return language === "zh"
        ? `${labels.total}${resume.education.length}${labels.item}`
        : `${resume.education.length}${labels.item}`;
    case "experience":
      return language === "zh"
        ? `${labels.total}${resume.experience.length}${labels.item}`
        : `${resume.experience.length}${labels.item}`;
    case "projects":
      return language === "zh"
        ? `${labels.total}${resume.projects.length}${labels.item}`
        : `${resume.projects.length}${labels.item}`;
    case "skills":
      return language === "zh"
        ? `${labels.total}${resume.skills.length}${labels.item}`
        : `${resume.skills.length}${labels.item}`;
    case "customSections":
      return language === "zh"
        ? `${labels.total}${resume.customSections.length}${labels.item}`
        : `${resume.customSections.length}${labels.item}`;
  }
};

export const EditorPane = ({
  language,
  resume,
  editorContainerRef,
  registerEditorSectionRef,
  sectionConfigs,
  activeSectionId,
  onSectionInteract,
  onMoveSection,
  onToggleSectionVisibility,
}: EditorPaneProps) => {
  const { dispatch } = useResumeState();
  const labels = copy[language];
  const [avatarError, setAvatarError] = useState("");

  const updateProfile =
    (field: keyof typeof resume.profile) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch({ type: "update-profile", field, value: event.target.value });
    };

  const updateThemeValue =
    (field: keyof ResumeData["theme"]) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        event.target instanceof HTMLInputElement && event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      dispatch({ type: "update-theme", field, value });
    };

  const bindItem =
    <T extends EducationItem | ExperienceItem | ProjectItem | SkillItem | CustomSection>(
      collection: "education" | "experience" | "projects" | "skills" | "customSections",
      item: T,
      field: string,
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch({
        type: "update-item",
        collection,
        id: item.id,
        field,
        value: event.target.value,
      });
    };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError(labels.avatarInvalid);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      dispatch({ type: "update-profile", field: "avatarUrl", value: result });
      setAvatarError("");
      event.target.value = "";
    };
    reader.onerror = () => {
      setAvatarError(labels.avatarReadError);
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const clearAvatar = () => {
    dispatch({ type: "update-profile", field: "avatarUrl", value: "" });
    setAvatarError("");
  };

  return (
    <aside className="editor-pane">
      <div ref={editorContainerRef} className="editor-shell">
        {sectionConfigs.map((config, index) => {
          const isProfileSection = config.id === "profile";
          const isFirstMovableSection = !isProfileSection && index === 1;
          const isLastSection = index === sectionConfigs.length - 1;
          const commonProps = {
            sectionId: config.id,
            expanded: activeSectionId === config.id && config.visible,
            hidden: !config.visible,
            registerEditorSectionRef,
            subtitle: renderSectionSubtitle(config, resume, language, labels),
            onActivate: onSectionInteract,
            onMove: onMoveSection,
            onToggleVisibility: onToggleSectionVisibility,
            disableMoveUp: isProfileSection || isFirstMovableSection,
            disableMoveDown: isProfileSection || isLastSection,
            lockVisibility: isProfileSection,
            labels: {
              moveUp: labels.moveUp,
              moveDown: labels.moveDown,
              show: labels.show,
              hide: labels.hide,
            },
          };

          if (config.id === "profile") {
            return (
              <SectionCard
                key={config.id}
                title={labels.profile}
                {...commonProps}
                disableMoveUp
                disableMoveDown
                hidden={false}
              >
                <div className="grid-two">
                  <LabeledField label={labels.fullName}>
                    <input value={resume.profile.fullName} onChange={updateProfile("fullName")} />
                  </LabeledField>
                  <LabeledField label={labels.title}>
                    <input value={resume.profile.title} onChange={updateProfile("title")} />
                  </LabeledField>
                  <LabeledField label={labels.phone}>
                    <input value={resume.profile.phone} onChange={updateProfile("phone")} />
                  </LabeledField>
                  <LabeledField label={labels.email}>
                    <input value={resume.profile.email} onChange={updateProfile("email")} />
                  </LabeledField>
                  <LabeledField label={labels.website}>
                    <input value={resume.profile.website} onChange={updateProfile("website")} />
                  </LabeledField>
                  <LabeledField label={labels.location}>
                    <input value={resume.profile.location} onChange={updateProfile("location")} />
                  </LabeledField>
                  <LabeledField label={labels.age}>
                    <input value={resume.profile.age} onChange={updateProfile("age")} />
                  </LabeledField>
                  <LabeledField label={labels.gender}>
                    <input value={resume.profile.gender} onChange={updateProfile("gender")} />
                  </LabeledField>
                  <LabeledField label={labels.ethnicity}>
                    <input value={resume.profile.ethnicity} onChange={updateProfile("ethnicity")} />
                  </LabeledField>
                  <LabeledField label={labels.politicalStatus}>
                    <input
                      value={resume.profile.politicalStatus}
                      onChange={updateProfile("politicalStatus")}
                    />
                  </LabeledField>
                  <LabeledField label={labels.currentStatus}>
                    <input
                      value={resume.profile.currentStatus}
                      onChange={updateProfile("currentStatus")}
                    />
                  </LabeledField>
                  <LabeledField label={labels.jobIntent}>
                    <input value={resume.profile.jobIntent} onChange={updateProfile("jobIntent")} />
                  </LabeledField>
                </div>
                <LabeledField label={labels.summary} hint={labels.markdownHint}>
                  <textarea rows={5} value={resume.profile.summary} onChange={updateProfile("summary")} />
                </LabeledField>
                <LabeledField label={labels.avatarUpload}>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                  <div className="inline-actions">
                    <button type="button" className="ghost-button" onClick={clearAvatar}>
                      {labels.avatarClear}
                    </button>
                  </div>
                  {resume.profile.avatarUrl ? (
                    <div className="avatar-upload-preview">
                      <span>{labels.avatarPreview}</span>
                      <img src={resume.profile.avatarUrl} alt={resume.profile.fullName || "avatar"} />
                    </div>
                  ) : null}
                  {avatarError ? <small className="field__hint field__hint--error">{avatarError}</small> : null}
                </LabeledField>
              </SectionCard>
            );
          }

          if (config.id === "education") {
            return (
              <CollectionSection<EducationItem>
                key={config.id}
                title={labels.education}
                collection="education"
                items={resume.education}
                addLabel={labels.addEducation}
                removeLabel={labels.remove}
                renderFields={(item) => (
                  <div className="grid-two">
                    <LabeledField label={labels.school}>
                      <input value={item.school} onChange={bindItem("education", item, "school")} />
                    </LabeledField>
                    <LabeledField label={labels.degree}>
                      <input value={item.degree} onChange={bindItem("education", item, "degree")} />
                    </LabeledField>
                    <LabeledField label={labels.major}>
                      <input value={item.major} onChange={bindItem("education", item, "major")} />
                    </LabeledField>
                    <LabeledField label={labels.dateRange}>
                      <input value={item.dateRange} onChange={bindItem("education", item, "dateRange")} />
                    </LabeledField>
                    <div className="grid-span-2">
                      <LabeledField label={labels.details} hint={labels.markdownHint}>
                        <textarea rows={4} value={item.details} onChange={bindItem("education", item, "details")} />
                      </LabeledField>
                    </div>
                  </div>
                )}
                {...commonProps}
              />
            );
          }

          if (config.id === "experience") {
            return (
              <CollectionSection<ExperienceItem>
                key={config.id}
                title={labels.experience}
                collection="experience"
                items={resume.experience}
                addLabel={labels.addExperience}
                removeLabel={labels.remove}
                renderFields={(item) => (
                  <>
                    <div className="grid-two">
                      <LabeledField label={labels.company}>
                        <input value={item.company} onChange={bindItem("experience", item, "company")} />
                      </LabeledField>
                      <LabeledField label={labels.role}>
                        <input value={item.role} onChange={bindItem("experience", item, "role")} />
                      </LabeledField>
                      <LabeledField label={labels.location}>
                        <input value={item.location} onChange={bindItem("experience", item, "location")} />
                      </LabeledField>
                      <LabeledField label={labels.dateRange}>
                        <input value={item.dateRange} onChange={bindItem("experience", item, "dateRange")} />
                      </LabeledField>
                    </div>
                    <LabeledField label={labels.workContent} hint={labels.markdownHint}>
                      <textarea rows={5} value={item.content} onChange={bindItem("experience", item, "content")} />
                    </LabeledField>
                  </>
                )}
                {...commonProps}
              />
            );
          }

          if (config.id === "projects") {
            return (
              <CollectionSection<ProjectItem>
                key={config.id}
                title={labels.projects}
                collection="projects"
                items={resume.projects}
                addLabel={labels.addProject}
                removeLabel={labels.remove}
                renderFields={(item) => (
                  <>
                    <div className="grid-two">
                      <LabeledField label={labels.projectName}>
                        <input value={item.name} onChange={bindItem("projects", item, "name")} />
                      </LabeledField>
                      <LabeledField label={labels.role}>
                        <input value={item.role} onChange={bindItem("projects", item, "role")} />
                      </LabeledField>
                      <LabeledField label={labels.dateRange}>
                        <input value={item.dateRange} onChange={bindItem("projects", item, "dateRange")} />
                      </LabeledField>
                      <LabeledField label={labels.link}>
                        <input value={item.link} onChange={bindItem("projects", item, "link")} />
                      </LabeledField>
                    </div>
                    <LabeledField label={labels.projectContent} hint={labels.markdownHint}>
                      <textarea rows={5} value={item.content} onChange={bindItem("projects", item, "content")} />
                    </LabeledField>
                  </>
                )}
                {...commonProps}
              />
            );
          }

          if (config.id === "skills") {
            return (
              <CollectionSection<SkillItem>
                key={config.id}
                title={labels.skills}
                collection="skills"
                items={resume.skills}
                addLabel={labels.addSkill}
                removeLabel={labels.remove}
                renderFields={(item) => (
                  <div className="grid-two">
                    <LabeledField label={labels.skillName}>
                      <input value={item.name} onChange={bindItem("skills", item, "name")} />
                    </LabeledField>
                    <LabeledField label={labels.skillDetail}>
                      <input value={item.detail} onChange={bindItem("skills", item, "detail")} />
                    </LabeledField>
                  </div>
                )}
                {...commonProps}
              />
            );
          }

          return (
            <CollectionSection<CustomSection>
              key={config.id}
              title={labels.customSections}
              collection="customSections"
              items={resume.customSections}
              renderItemTitle={(item) => item.title.trim() || labels.customTitle}
              addLabel={labels.addCustom}
              removeLabel={labels.remove}
              renderFields={(item) => (
                <>
                  <LabeledField label={labels.customTitle}>
                    <input value={item.title} onChange={bindItem("customSections", item, "title")} />
                  </LabeledField>
                  <LabeledField label={labels.customContent} hint={labels.markdownHint}>
                    <textarea rows={4} value={item.content} onChange={bindItem("customSections", item, "content")} />
                  </LabeledField>
                </>
              )}
              {...commonProps}
            />
          );
        })}

        <section className="panel section-card settings-card">
          <div className="section-card__header">
            <div className="section-card__heading">
              <h2>{labels.themeTitle}</h2>
              <p className="section-card__subtitle">{labels.themeSubtitle}</p>
            </div>
          </div>
          <div className="section-card__body">
            <div className="grid-two">
              <LabeledField label={labels.themeColor}>
                <input type="color" value={resume.theme.accentColor} onChange={updateThemeValue("accentColor")} />
              </LabeledField>
              <LabeledField label={labels.density}>
                <select value={resume.theme.density} onChange={updateThemeValue("density")}>
                  <option value="compact">{labels.compact}</option>
                  <option value="balanced">{labels.balanced}</option>
                  <option value="airy">{labels.airy}</option>
                </select>
              </LabeledField>
              <LabeledField label={labels.headingSize}>
                <input
                  type="range"
                  min="32"
                  max="44"
                  step="1"
                  value={resume.theme.headingSize}
                  onChange={updateThemeValue("headingSize")}
                />
              </LabeledField>
              <LabeledField label={labels.lineHeight}>
                <input
                  type="range"
                  min="1.5"
                  max="2.1"
                  step="0.05"
                  value={resume.theme.infoLineHeight}
                  onChange={updateThemeValue("infoLineHeight")}
                />
              </LabeledField>
              <LabeledField label={labels.sectionSpacing}>
                <input
                  type="range"
                  min="12"
                  max="28"
                  step="1"
                  value={resume.theme.sectionSpacing}
                  onChange={updateThemeValue("sectionSpacing")}
                />
              </LabeledField>
              <LabeledField label={labels.avatarStyle}>
                <select value={resume.theme.avatarStyle} onChange={updateThemeValue("avatarStyle")}>
                  <option value="square">{labels.square}</option>
                  <option value="rounded">{labels.rounded}</option>
                </select>
              </LabeledField>
            </div>
            <div className="toggle-grid">
              <label className="toggle">
                <input type="checkbox" checked={resume.theme.showAvatar} onChange={updateThemeValue("showAvatar")} />
                <span>{labels.showAvatar}</span>
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={resume.theme.showDividers}
                  onChange={updateThemeValue("showDividers")}
                />
                <span>{labels.showDividers}</span>
              </label>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
};
