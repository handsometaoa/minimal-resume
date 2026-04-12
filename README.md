# 极简历

极简历是一个可视化、极简风格的多页面简历制作网站，支持中文/英文模式、模板选择、工作台编辑、实时预览、多页排版和 PDF 导出。

## 功能特性

- 中文 / 英文双语切换
- 多套简历模板选择
- 工作台可视化编辑
- 模块展开 / 折叠
- 模块显示 / 隐藏
- 模块顺序调整
- 自定义模块编辑
- Markdown 长文本输入
- 多页简历预览
- 浏览器打印 / 导出 PDF

## 技术栈

- React 19
- TypeScript
- Vite
- React Router
- CSS

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

### 4. 本地预览生产包

```bash
npm run preview
```

## 项目结构

```text
src/
  editor/       编辑区
  preview/      预览区
  pages/        页面入口
  state/        简历状态管理
  lib/          模板、示例数据与工具函数
  styles/       全局样式与主题样式
public/
  favicon.svg   网站图标
```

## GitHub 上传流程

当前目录还没有初始化 Git，可以按下面步骤上传到 GitHub。

### 1. 初始化本地仓库

```bash
git init
git add .
git commit -m "feat: initialize 极简历 project"
```

### 2. 在 GitHub 新建仓库

建议仓库名直接使用：

```text
jianli
```

如果你使用其他仓库名，GitHub Pages 仍然可以部署，本项目会在构建时自动读取仓库名生成资源路径。

### 3. 绑定远程仓库并推送

将下面的 `<your-name>` 替换成你的 GitHub 用户名：

```bash
git branch -M main
git remote add origin https://github.com/<your-name>/jianli.git
git push -u origin main
```

如果你的仓库名不是 `jianli`，把上面的仓库地址替换成你的实际仓库地址即可。

## GitHub Pages 部署

本项目已经按 GitHub Pages 静态部署方式配置：

- 使用 GitHub Actions 自动构建
- 构建目录为 `dist`
- 使用 `HashRouter`，避免 Pages 刷新路由时出现 404
- `base` 会在 GitHub Actions 中自动按仓库名生成

### 1. 推送代码到 GitHub

确保代码已经推送到默认分支 `main`。

### 2. 打开 Pages 设置

进入仓库：

```text
Settings -> Pages
```

将 Source 设置为：

```text
GitHub Actions
```

### 3. 等待 Actions 自动部署

推送到 `main` 后会自动触发部署流程。部署成功后，你会得到一个 GitHub Pages 地址，通常类似：

```text
https://<your-name>.github.io/jianli/
```

## 路由与部署说明

项目部署到 GitHub Pages 后使用 `#/` 路由格式，例如：

```text
https://<your-name>.github.io/jianli/#/templates
https://<your-name>.github.io/jianli/#/workspace
```

这样做的目的是避免静态托管平台在刷新子路由时返回 404。

## 常见问题

### 1. 为什么首页能打开，但刷新模板页会报错？

如果你还在使用旧版本的 `BrowserRouter`，GitHub Pages 会在刷新子路径时返回 404。当前项目已经改为 `HashRouter`，部署后应使用 `#/` 路由。

### 2. 为什么 GitHub Pages 样式或图标丢失？

通常是 `base` 路径不正确导致。当前项目已配置为在 GitHub Actions 中自动读取仓库名并生成正确路径。

### 3. 哪些文件不要上传到 GitHub？

以下内容不应提交：

- `node_modules/`
- `dist/`
- `*.tsbuildinfo`

另外，以下文件属于历史生成文件，通常也不需要保留：

- `vite.config.js`
- `vite.config.d.ts`

## 当前建议保留的核心文件

- `src/`
- `public/`
- `index.html`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`

## 授权说明

本项目不是开源商用项目，默认禁止以下行为：

- 一切商业使用
- 一切二次分发、再发布、镜像传播
- 基于本项目修改后再次对外发布

当前仓库采用 `UNLICENSED` 方式发布，详细限制见 [LICENSE.md](./LICENSE.md)。
