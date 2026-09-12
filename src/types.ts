export type Language = "zh" | "en";
export type Density = "compact" | "balanced" | "airy";
export type PreviewSectionId =
  | "profile"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "customSections";
export type ManagedSectionId = PreviewSectionId;
export type ResumeThemeId =
  | "classic"
  | "minimal"
  | "tech"
  | "executive"
  | "creative"
  | "serif";
export type AvatarStyle = "square" | "rounded";

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface ResumeTheme {
  themeId: ResumeThemeId;
  accentColor: string;
  density: Density;
  showAvatar: boolean;
  showDividers: boolean;
  headingSize: string;
  infoLineHeight: string;
  sectionSpacing: string;
  avatarStyle: AvatarStyle;
}

export interface Profile {
  fullName: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  age: string;
  gender: string;
  ethnicity: string;
  politicalStatus: string;
  currentStatus: string;
  jobIntent: string;
  summary: string;
  avatarUrl: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  major: string;
  dateRange: string;
  details: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  dateRange: string;
  content: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  dateRange: string;
  link: string;
  content: string;
}

export interface SkillItem {
  id: string;
  name: string;
  detail: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export type CollectionKey = "education" | "experience" | "projects" | "skills" | "customSections";

export interface ResumeData {
  profile: Profile;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  customSections: CustomSection[];
  theme: ResumeTheme;
}

export interface SectionConfig {
  id: ManagedSectionId;
  title: string;
  visible: boolean;
}

export interface ThemePreset {
  id: ResumeThemeId;
  name: LocalizedText;
  description: LocalizedText;
  values: ResumeTheme;
}
