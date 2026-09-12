import type { Language } from "../types";

export interface EditorCopy {
  moveUp: string;
  moveDown: string;
  show: string;
  hide: string;
  remove: string;
  markdownHint: string;
  formatCount: (count: number) => string;
  profile: string;
  education: string;
  experience: string;
  projects: string;
  skills: string;
  customSections: string;
  profileSubtitle: string;
  addEducation: string;
  addExperience: string;
  addProject: string;
  addSkill: string;
  addCustom: string;
  themeTitle: string;
  themeSubtitle: string;
  themeColor: string;
  density: string;
  compact: string;
  balanced: string;
  airy: string;
  headingSize: string;
  lineHeight: string;
  sectionSpacing: string;
  avatarStyle: string;
  square: string;
  rounded: string;
  showAvatar: string;
  showDividers: string;
  fullName: string;
  title: string;
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
  summary: string;
  avatarUpload: string;
  avatarPreview: string;
  avatarClear: string;
  avatarInvalid: string;
  avatarReadError: string;
  school: string;
  degree: string;
  major: string;
  dateRange: string;
  details: string;
  company: string;
  role: string;
  projectName: string;
  link: string;
  skillName: string;
  skillDetail: string;
  customTitle: string;
  customContent: string;
  workContent: string;
  projectContent: string;
}

export const editorCopy: Record<Language, EditorCopy> = {
  zh: {
    moveUp: "上移",
    moveDown: "下移",
    show: "显示",
    hide: "隐藏",
    remove: "删除",
    markdownHint: "支持 Markdown：标题、列表、粗体、斜体、链接与换行",
    formatCount: (count) => `共 ${count} 项`,
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
    formatCount: (count) => `${count} items`,
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
};
