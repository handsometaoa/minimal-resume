import { useState, type ChangeEvent } from "react";
import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  ImageIcon,
  LayoutTemplate,
  Settings2,
  Upload,
  User,
  Wrench,
  X,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

const sectionIcons: Record<ManagedSectionId, React.ReactNode> = {
  profile: <User className="size-3.5" />,
  education: <GraduationCap className="size-3.5" />,
  experience: <Briefcase className="size-3.5" />,
  projects: <FolderKanban className="size-3.5" />,
  skills: <Wrench className="size-3.5" />,
  customSections: <LayoutTemplate className="size-3.5" />,
};

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

const SettingsSwitch = ({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <Label className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </Label>
);

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

  const updateThemeField =
    (field: keyof ResumeData["theme"]) => (value: string | boolean) => {
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

  const gridTwo = "grid grid-cols-2 gap-x-3 gap-y-3";

  return (
    <aside className="app-chrome w-full shrink-0 border-b bg-muted/40 lg:h-full lg:w-[400px] lg:border-r lg:border-b-0 xl:w-[440px] print:hidden">
      {/* grid 而非 flex：滚动容器内 flex 子项会被压缩，grid 行保持自然高度；
          overflow-anchor:none 禁用浏览器滚动锚定，由 WorkspacePage 显式补偿滚动 */}
      <div
        ref={editorContainerRef}
        className="grid gap-3 p-3 [overflow-anchor:none] lg:h-full lg:overflow-y-auto"
      >
        {sectionConfigs.map((config, index) => {
          const isProfileSection = config.id === "profile";
          const isFirstMovableSection = !isProfileSection && index === 1;
          const isLastSection = index === sectionConfigs.length - 1;
          const commonProps = {
            sectionId: config.id,
            icon: sectionIcons[config.id],
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
                <div className={gridTwo}>
                  <LabeledField label={labels.fullName}>
                    <Input value={resume.profile.fullName} onChange={updateProfile("fullName")} />
                  </LabeledField>
                  <LabeledField label={labels.title}>
                    <Input value={resume.profile.title} onChange={updateProfile("title")} />
                  </LabeledField>
                  <LabeledField label={labels.phone}>
                    <Input value={resume.profile.phone} onChange={updateProfile("phone")} />
                  </LabeledField>
                  <LabeledField label={labels.email}>
                    <Input value={resume.profile.email} onChange={updateProfile("email")} />
                  </LabeledField>
                  <LabeledField label={labels.website}>
                    <Input value={resume.profile.website} onChange={updateProfile("website")} />
                  </LabeledField>
                  <LabeledField label={labels.location}>
                    <Input value={resume.profile.location} onChange={updateProfile("location")} />
                  </LabeledField>
                  <LabeledField label={labels.age}>
                    <Input value={resume.profile.age} onChange={updateProfile("age")} />
                  </LabeledField>
                  <LabeledField label={labels.gender}>
                    <Input value={resume.profile.gender} onChange={updateProfile("gender")} />
                  </LabeledField>
                  <LabeledField label={labels.ethnicity}>
                    <Input value={resume.profile.ethnicity} onChange={updateProfile("ethnicity")} />
                  </LabeledField>
                  <LabeledField label={labels.politicalStatus}>
                    <Input
                      value={resume.profile.politicalStatus}
                      onChange={updateProfile("politicalStatus")}
                    />
                  </LabeledField>
                  <LabeledField label={labels.currentStatus}>
                    <Input
                      value={resume.profile.currentStatus}
                      onChange={updateProfile("currentStatus")}
                    />
                  </LabeledField>
                  <LabeledField label={labels.jobIntent}>
                    <Input value={resume.profile.jobIntent} onChange={updateProfile("jobIntent")} />
                  </LabeledField>
                </div>
                <LabeledField label={labels.summary} hint={labels.markdownHint}>
                  <Textarea
                    rows={5}
                    value={resume.profile.summary}
                    onChange={updateProfile("summary")}
                  />
                </LabeledField>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {labels.avatarUpload}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium shadow-xs transition-colors hover:bg-accent">
                      <Upload className="size-3.5" />
                      {labels.avatarUpload}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                    {resume.profile.avatarUrl ? (
                      <>
                        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border">
                          <img
                            src={resume.profile.avatarUrl}
                            alt={resume.profile.fullName || "avatar"}
                            className="size-full object-cover"
                          />
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={labels.avatarClear}
                          title={labels.avatarClear}
                          onClick={clearAvatar}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </>
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded border border-dashed text-muted-foreground">
                        <ImageIcon className="size-3.5" />
                      </span>
                    )}
                  </div>
                  {avatarError ? (
                    <small className="text-xs text-destructive">{avatarError}</small>
                  ) : null}
                </div>
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
                  <div className={gridTwo}>
                    <LabeledField label={labels.school}>
                      <Input value={item.school} onChange={bindItem("education", item, "school")} />
                    </LabeledField>
                    <LabeledField label={labels.degree}>
                      <Input value={item.degree} onChange={bindItem("education", item, "degree")} />
                    </LabeledField>
                    <LabeledField label={labels.major}>
                      <Input value={item.major} onChange={bindItem("education", item, "major")} />
                    </LabeledField>
                    <LabeledField label={labels.dateRange}>
                      <Input
                        value={item.dateRange}
                        onChange={bindItem("education", item, "dateRange")}
                      />
                    </LabeledField>
                    <div className="col-span-2">
                      <LabeledField label={labels.details} hint={labels.markdownHint}>
                        <Textarea
                          rows={4}
                          value={item.details}
                          onChange={bindItem("education", item, "details")}
                        />
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
                    <div className={gridTwo}>
                      <LabeledField label={labels.company}>
                        <Input
                          value={item.company}
                          onChange={bindItem("experience", item, "company")}
                        />
                      </LabeledField>
                      <LabeledField label={labels.role}>
                        <Input value={item.role} onChange={bindItem("experience", item, "role")} />
                      </LabeledField>
                      <LabeledField label={labels.location}>
                        <Input
                          value={item.location}
                          onChange={bindItem("experience", item, "location")}
                        />
                      </LabeledField>
                      <LabeledField label={labels.dateRange}>
                        <Input
                          value={item.dateRange}
                          onChange={bindItem("experience", item, "dateRange")}
                        />
                      </LabeledField>
                    </div>
                    <LabeledField label={labels.workContent} hint={labels.markdownHint}>
                      <Textarea
                        rows={5}
                        value={item.content}
                        onChange={bindItem("experience", item, "content")}
                      />
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
                    <div className={gridTwo}>
                      <LabeledField label={labels.projectName}>
                        <Input value={item.name} onChange={bindItem("projects", item, "name")} />
                      </LabeledField>
                      <LabeledField label={labels.role}>
                        <Input value={item.role} onChange={bindItem("projects", item, "role")} />
                      </LabeledField>
                      <LabeledField label={labels.dateRange}>
                        <Input
                          value={item.dateRange}
                          onChange={bindItem("projects", item, "dateRange")}
                        />
                      </LabeledField>
                      <LabeledField label={labels.link}>
                        <Input value={item.link} onChange={bindItem("projects", item, "link")} />
                      </LabeledField>
                    </div>
                    <LabeledField label={labels.projectContent} hint={labels.markdownHint}>
                      <Textarea
                        rows={5}
                        value={item.content}
                        onChange={bindItem("projects", item, "content")}
                      />
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
                  <div className={gridTwo}>
                    <LabeledField label={labels.skillName}>
                      <Input value={item.name} onChange={bindItem("skills", item, "name")} />
                    </LabeledField>
                    <LabeledField label={labels.skillDetail}>
                      <Input value={item.detail} onChange={bindItem("skills", item, "detail")} />
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
                    <Input
                      value={item.title}
                      onChange={bindItem("customSections", item, "title")}
                    />
                  </LabeledField>
                  <LabeledField label={labels.customContent} hint={labels.markdownHint}>
                    <Textarea
                      rows={4}
                      value={item.content}
                      onChange={bindItem("customSections", item, "content")}
                    />
                  </LabeledField>
                </>
              )}
              {...commonProps}
            />
          );
        })}

        <Card className="gap-0 rounded-lg border py-0">
          <div className="flex items-center gap-2.5 px-4 py-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Settings2 className="size-3.5" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{labels.themeTitle}</span>
              <span className="text-xs text-muted-foreground">{labels.themeSubtitle}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t px-4 py-4">
            <div className={gridTwo}>
              <LabeledField label={labels.themeColor}>
                <input
                  type="color"
                  value={resume.theme.accentColor}
                  onChange={(event) => updateThemeField("accentColor")(event.target.value)}
                  className="h-9 w-full cursor-pointer rounded-md border border-input bg-background px-1"
                />
              </LabeledField>
              <LabeledField label={labels.density}>
                <Select
                  value={resume.theme.density}
                  onValueChange={updateThemeField("density")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">{labels.compact}</SelectItem>
                    <SelectItem value="balanced">{labels.balanced}</SelectItem>
                    <SelectItem value="airy">{labels.airy}</SelectItem>
                  </SelectContent>
                </Select>
              </LabeledField>
              <LabeledField label={`${labels.headingSize} · ${resume.theme.headingSize}px`}>
                <Slider
                  min={32}
                  max={44}
                  step={1}
                  value={[Number(resume.theme.headingSize)]}
                  onValueChange={(values) => updateThemeField("headingSize")(String(values[0]))}
                />
              </LabeledField>
              <LabeledField label={`${labels.lineHeight} · ${resume.theme.infoLineHeight}`}>
                <Slider
                  min={1.5}
                  max={2.1}
                  step={0.05}
                  value={[Number(resume.theme.infoLineHeight)]}
                  onValueChange={(values) =>
                    updateThemeField("infoLineHeight")(String(values[0]))
                  }
                />
              </LabeledField>
              <LabeledField label={`${labels.sectionSpacing} · ${resume.theme.sectionSpacing}px`}>
                <Slider
                  min={12}
                  max={28}
                  step={1}
                  value={[Number(resume.theme.sectionSpacing)]}
                  onValueChange={(values) =>
                    updateThemeField("sectionSpacing")(String(values[0]))
                  }
                />
              </LabeledField>
              <LabeledField label={labels.avatarStyle}>
                <Select
                  value={resume.theme.avatarStyle}
                  onValueChange={updateThemeField("avatarStyle")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">{labels.square}</SelectItem>
                    <SelectItem value="rounded">{labels.rounded}</SelectItem>
                  </SelectContent>
                </Select>
              </LabeledField>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <SettingsSwitch
                label={labels.showAvatar}
                checked={resume.theme.showAvatar}
                onCheckedChange={updateThemeField("showAvatar")}
              />
              <SettingsSwitch
                label={labels.showDividers}
                checked={resume.theme.showDividers}
                onCheckedChange={updateThemeField("showDividers")}
              />
            </div>
          </div>
        </Card>
      </div>
    </aside>
  );
};
