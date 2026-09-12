import { useState, type ChangeEvent } from "react";
import { useResumeState } from "../state/resumeState";
import type {
  CollectionKey,
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
import { editorCopy, type EditorCopy } from "./copy";
import { CollectionSection } from "./CollectionSection";
import { LabeledField } from "./LabeledField";
import { SectionCard } from "./SectionCard";

interface EditorPaneProps {
  language: Language;
  resume: ResumeData;
  editorContainerRef: React.RefObject<HTMLDivElement | null>;
  registerEditorSectionRef: (sectionId: ManagedSectionId) => (element: HTMLElement | null) => void;
  sectionConfigs: SectionConfig[];
  activeSectionId: ManagedSectionId | null;
  onSectionInteract: (sectionId: ManagedSectionId) => void;
  onMoveSection: (sectionId: ManagedSectionId, direction: "up" | "down") => void;
  onToggleSectionVisibility: (sectionId: ManagedSectionId) => void;
}

const renderSectionSubtitle = (
  config: SectionConfig,
  resume: ResumeData,
  labels: EditorCopy,
): string => {
  switch (config.id) {
    case "profile":
      return labels.profileSubtitle;
    case "education":
      return labels.formatCount(resume.education.length);
    case "experience":
      return labels.formatCount(resume.experience.length);
    case "projects":
      return labels.formatCount(resume.projects.length);
    case "skills":
      return labels.formatCount(resume.skills.length);
    case "customSections":
      return labels.formatCount(resume.customSections.length);
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
  const labels = editorCopy[language];
  const [avatarError, setAvatarError] = useState("");

  const updateProfile =
    (field: keyof ResumeData["profile"]) =>
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
      collection: CollectionKey,
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
            subtitle: renderSectionSubtitle(config, resume, labels),
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
