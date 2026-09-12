import type { Language } from "../types";

export interface PreviewCopy {
  phone: string;
  email: string;
  website: string;
  location: string;
  age: string;
  gender: string;
  ethnicity: string;
  politicalStatus: string;
  currentStatus: string;
  jobIntent: string;
  profileName: string;
  profileTitle: string;
  avatar: string;
  education: string;
  experience: string;
  projects: string;
  skills: string;
  custom: string;
  school: string;
  company: string;
  role: string;
  project: string;
  projectRole: string;
}

export const previewCopy: Record<Language, PreviewCopy> = {
  zh: {
    phone: "电话",
    email: "邮箱",
    website: "网站",
    location: "城市",
    age: "年龄",
    gender: "性别",
    ethnicity: "民族",
    politicalStatus: "政治面貌",
    currentStatus: "当前状态",
    jobIntent: "求职意向",
    profileName: "你的姓名",
    profileTitle: "求职岗位",
    avatar: "头像",
    education: "教育经历",
    experience: "工作经历",
    projects: "项目经历",
    skills: "专业技能",
    custom: "补充信息",
    school: "学校名称",
    company: "公司名称",
    role: "岗位名称",
    project: "项目名称",
    projectRole: "负责角色",
  },
  en: {
    phone: "Phone",
    email: "Email",
    website: "Website",
    location: "Location",
    age: "Age",
    gender: "Gender",
    ethnicity: "Ethnicity",
    politicalStatus: "Political",
    currentStatus: "Availability",
    jobIntent: "Target",
    profileName: "Your Name",
    profileTitle: "Target Role",
    avatar: "Avatar",
    education: "Education",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    custom: "Additional",
    school: "School",
    company: "Company",
    role: "Role",
    project: "Project",
    projectRole: "Role",
  },
};

export const buildPageLabel = (language: Language, index: number): string =>
  language === "zh" ? `第 ${index + 1} 页` : `Page ${index + 1}`;
