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

## 在线查看

https://handsometaoa.github.io/minimal-resume/

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

## 授权说明

本项目不是开源商用项目，默认禁止以下行为：

- 一切商业使用
- 一切二次分发、再发布、镜像传播
- 基于本项目修改后再次对外发布

当前仓库采用 `UNLICENSED` 方式发布，详细限制见 [LICENSE.md](./LICENSE.md)。
