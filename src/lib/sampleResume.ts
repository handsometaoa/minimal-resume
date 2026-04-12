import type { Language, ResumeData } from "../types";
import { createId } from "./ids";
import { getThemePreset } from "./themePresets";

const createChineseSample = (): ResumeData => ({
  profile: {
    fullName: "候选人 A",
    title: "高级后端开发工程师",
    location: "北京",
    phone: "138 0000 0000",
    email: "candidate.a@example.test",
    website: "portfolio.example.test",
    age: "27岁",
    gender: "男",
    ethnicity: "汉族",
    politicalStatus: "中共党员",
    currentStatus: "随时到岗",
    jobIntent: "高级后端开发工程师 / 技术负责人",
    summary:
      "具备 5 年 Java 后端与平台工程经验，关注 **高并发**、**高可用** 与复杂业务链路设计。\n\n擅长从业务需求拆解、服务建模、接口治理到性能优化的完整交付过程，也能在跨团队协作中推进方案落地。",
    avatarUrl: "",
  },
  education: [
    {
      id: createId("edu"),
      school: "华中科技大学",
      degree: "本科",
      major: "软件工程",
      dateRange: "2015年9月 - 2019年6月",
      details:
        "### 在校表现\n- GPA 3.62 / 4.00\n- 获校级奖学金两次\n- 主修算法设计、计算机网络、数据库系统、分布式系统",
    },
  ],
  experience: [
    {
      id: createId("exp"),
      company: "某互联网平台公司",
      role: "高级 Java 开发工程师",
      location: "北京",
      dateRange: "2022年7月 - 至今",
      content:
        "### 核心职责\n- 负责在线客服平台、消息调度系统和服务治理平台建设。\n- 主导客服工作台、会话路由、知识检索与运营配置中心的技术方案设计。\n\n### 关键成果\n- 完成 8 个核心服务拆分，接口 P95 响应时间下降 37%。\n- 推动 Redis 热点数据预热与异步削峰，系统高峰稳定性显著提升。\n- 建立服务巡检与告警规则，线上故障平均恢复时间缩短至 15 分钟内。",
    },
    {
      id: createId("exp"),
      company: "某企业软件团队",
      role: "后端开发工程师",
      location: "武汉",
      dateRange: "2019年7月 - 2022年6月",
      content:
        "### 核心职责\n- 参与企业内部协同平台与审批工作流系统开发。\n- 负责用户权限、流程引擎和报表中心等模块建设。\n\n### 关键成果\n- 设计统一权限模型，支持多业务线共用账号体系。\n- 优化 SQL 与索引策略，复杂报表查询耗时降低 45%。",
    },
  ],
  projects: [
    {
      id: createId("proj"),
      name: "在线客服平台 B 端工作台",
      role: "核心开发 / 技术负责人",
      dateRange: "2023年3月 - 至今",
      link: "https://demo.example.test/support-console",
      content:
        "### 项目说明\n为客服、运营和管理人员提供统一会话处理、数据看板和流程配置能力。\n\n### 技术栈\n- Java\n- Spring Boot\n- Dubbo\n- MySQL\n- Redis\n- RocketMQ\n\n### 负责内容\n- 设计会话路由与多渠道接入模型。\n- 搭建运营配置中心，支持策略灰度发布。\n- 推动接口治理与缓存策略落地。",
    },
    {
      id: createId("proj"),
      name: "统一权限与组织中心",
      role: "后端负责人",
      dateRange: "2021年5月 - 2022年4月",
      link: "",
      content:
        "### 项目说明\n面向多个内部业务系统提供统一账号、角色、组织与权限管理。\n\n### 负责内容\n- 设计组织树与角色授权模型。\n- 输出权限校验 SDK，降低接入成本。\n- 建立审计日志与权限变更追踪能力。",
    },
  ],
  skills: [
    { id: createId("skill"), name: "后端开发", detail: "Java、Spring Boot、Dubbo、MyBatis、DDD" },
    { id: createId("skill"), name: "中间件", detail: "Redis、RocketMQ、XXL-Job、Nginx" },
    { id: createId("skill"), name: "数据库", detail: "MySQL、SQL 优化、索引设计、读写分离" },
    { id: createId("skill"), name: "工程能力", detail: "服务治理、可观测性、接口设计、性能压测" },
  ],
  customSections: [
    {
      id: createId("custom"),
      title: "个人优势",
      content:
        "- 能快速理解复杂业务并抽象成稳定模型\n- 擅长系统重构、性能治理与接口规范建设\n- 有跨团队推进和带人协作经验",
    },
    {
      id: createId("custom"),
      title: "证书与语言",
      content:
        "- CET-6\n- 软件设计师（中级）\n- 英文文档阅读与技术沟通能力良好",
    },
  ],
  theme: getThemePreset("classic").values,
});

const createEnglishSample = (): ResumeData => ({
  profile: {
    fullName: "Candidate A",
    title: "Senior Backend Engineer",
    location: "Beijing",
    phone: "+86 138 0000 0000",
    email: "candidate.a@example.test",
    website: "portfolio.example.test",
    age: "27",
    gender: "Male",
    ethnicity: "",
    politicalStatus: "",
    currentStatus: "Available within 2 weeks",
    jobIntent: "Senior Backend Engineer / Tech Lead",
    summary:
      "Backend engineer with 5 years of experience across **high-traffic systems**, service orchestration, and platform engineering.\n\nStrong at turning complex business requirements into maintainable services, operational tooling, and measurable performance improvements.",
    avatarUrl: "",
  },
  education: [
    {
      id: createId("edu"),
      school: "Huazhong University of Science and Technology",
      degree: "B.Eng.",
      major: "Software Engineering",
      dateRange: "Sep 2015 - Jun 2019",
      details:
        "### Highlights\n- GPA 3.62 / 4.00\n- Two-time merit scholarship recipient\n- Focused on algorithms, networking, databases, and distributed systems",
    },
  ],
  experience: [
    {
      id: createId("exp"),
      company: "Example Platform Co., Ltd.",
      role: "Senior Java Engineer",
      location: "Beijing",
      dateRange: "Jul 2022 - Present",
      content:
        "### Responsibilities\n- Built customer support systems, routing services, and service-governance tooling.\n- Led design for support console workflows, knowledge retrieval, and operational configuration modules.\n\n### Impact\n- Split 8 core services and reduced P95 latency by 37%.\n- Introduced cache warming and async buffering to stabilize peak traffic.\n- Improved monitoring and alerting workflows, reducing mean time to recovery to under 15 minutes.",
    },
    {
      id: createId("exp"),
      company: "Example Enterprise Software Team",
      role: "Backend Engineer",
      location: "Wuhan",
      dateRange: "Jul 2019 - Jun 2022",
      content:
        "### Responsibilities\n- Developed enterprise collaboration and workflow systems.\n- Owned permissions, workflow engine, and reporting modules.\n\n### Impact\n- Designed a shared permission model across multiple internal systems.\n- Improved complex report query performance by 45% through SQL and indexing optimization.",
    },
  ],
  projects: [
    {
      id: createId("proj"),
      name: "Customer Support Operations Console",
      role: "Core Engineer / Technical Lead",
      dateRange: "Mar 2023 - Present",
      link: "https://demo.example.test/support-console",
      content:
        "### Overview\nA unified platform for support agents, operators, and managers to handle conversations, dashboards, and workflow configuration.\n\n### Stack\n- Java\n- Spring Boot\n- Dubbo\n- MySQL\n- Redis\n- RocketMQ\n\n### Ownership\n- Designed conversation routing and multi-channel access models.\n- Built the operations configuration center with staged rollout support.\n- Improved API governance and cache strategy across critical paths.",
    },
    {
      id: createId("proj"),
      name: "Unified Permissions and Org Center",
      role: "Backend Lead",
      dateRange: "May 2021 - Apr 2022",
      link: "",
      content:
        "### Overview\nA shared identity, org-structure, and permissions platform used by multiple internal business systems.\n\n### Ownership\n- Designed organization-tree and role-authorization models.\n- Delivered a permission-check SDK for downstream teams.\n- Added audit logs and permission-change tracing.",
    },
  ],
  skills: [
    { id: createId("skill"), name: "Backend", detail: "Java, Spring Boot, Dubbo, MyBatis, DDD" },
    { id: createId("skill"), name: "Middleware", detail: "Redis, RocketMQ, XXL-Job, Nginx" },
    { id: createId("skill"), name: "Database", detail: "MySQL, SQL tuning, indexing, read/write separation" },
    { id: createId("skill"), name: "Engineering", detail: "Service governance, observability, API design, performance testing" },
  ],
  customSections: [
    {
      id: createId("custom"),
      title: "Strengths",
      content:
        "- Fast at understanding complex business flows and translating them into stable abstractions\n- Strong in refactoring, performance tuning, and engineering standardization\n- Comfortable driving cross-team delivery and mentoring teammates",
    },
    {
      id: createId("custom"),
      title: "Certificates & Languages",
      content:
        "- CET-6\n- Software Designer Certification\n- Strong reading and communication ability for technical English",
    },
  ],
  theme: getThemePreset("classic").values,
});

export const createSampleResume = (language: Language): ResumeData =>
  language === "en" ? createEnglishSample() : createChineseSample();
