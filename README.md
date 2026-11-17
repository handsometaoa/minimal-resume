# 极简历

极简历是一个可视化、极简风格的多页面简历制作网站，支持中文/英文模式、模板直选、工作台编辑、实时预览、多页排版和 PDF 导出。界面基于 shadcn/ui，支持浅色 / 深色 / 跟随系统三种外观。

## 功能特性

- 中文 / 英文双语切换
- 首页模板卡片直选，点击即带模板进入工作台
- 浅色 / 深色 / 跟随系统三种界面外观
- 工作台可视化编辑（基本信息、教育、工作、项目、技能、自定义模块）
- 模块展开 / 折叠，编辑与预览双向联动定位
- 模块显示 / 隐藏、顺序调整
- Markdown 长文本输入
- 主题色、排版密度、姓名字号、行距、模块间距、头像样式可视化微调
- A4 真实尺寸多页预览，跨页自动补齐模块栏与经历标题
- 浏览器打印 / 导出 PDF（背景色块免手动勾选）
- 数据保存在本地浏览器，不上传服务器

## 在线查看

https://handsometaoa.github.io/minimal-resume/

## 技术栈

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- shadcn/ui（Radix UI）
- lucide-react

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 类型检查

```bash
npm run typecheck
```

### 5. 本地预览生产包

```bash
npm run preview
```

## 项目结构

```text
src/
  pages/          页面入口（首页（含模板直选）、工作台、关于页）
  components/     shell-controls（品牌标识/语言/外观切换）与 shadcn/ui 组件
  editor/         编辑区（编辑面板、分节卡片、文案）
  preview/        预览区（A4 多页预览、流式分页引擎、文案）
  state/          简历状态管理（reducer + 本地持久化）
  lib/            模板预设、示例数据与工具函数
  styles/         resume.css（简历纸面与打印样式）与 themes/（六套主题）
  index.css       Tailwind 入口与界面设计令牌（浅/深两套）
public/
  favicon.svg     网站图标
```

说明：简历纸面样式（A4 排版与打印几何）独立于组件库，集中在 `src/styles/resume.css`；界面外壳样式由 Tailwind 设计令牌驱动，纸面不随深色模式翻转。

## 授权说明

本项目不是开源商用项目，默认禁止以下行为：

- 一切商业使用
- 一切二次分发、再发布、镜像传播
- 基于本项目修改后再次对外发布

当前仓库采用 `UNLICENSED` 方式发布，详细限制见 [LICENSE.md](./LICENSE.md)。
