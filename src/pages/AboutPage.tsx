import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { Language } from "../types";

const copy = {
  zh: {
    title: "关于 极简历",
    p1: "极简历是一套面向正式求职场景的简历制作工具：在浏览器里选择模板、编辑内容、实时预览 A4 排版，然后直接导出可投递的 PDF。",
    p2: "工作台支持模块排序与显隐、Markdown 长文本、多页自然分页与版式微调；数据保存在本地浏览器，不上传服务器。",
    p3: "支持中英文双语界面与多套模板，适配校招、社招与跨语言投递。",
  },
  en: {
    title: "About Minimal Resume",
    p1: "Minimal Resume is a resume builder for serious job applications: pick a template, edit content, preview the A4 layout live, and export a deliverable PDF right in the browser.",
    p2: "The workspace supports section ordering and visibility, Markdown editing, natural multi-page pagination, and layout fine-tuning. Your data stays in your local browser and is never uploaded.",
    p3: "Both Chinese and English interfaces are supported, with multiple templates for campus, experienced, and cross-language applications.",
  },
} satisfies Record<Language, Record<string, string>>;

export const AboutPage = ({ language }: { language: Language }) => {
  const labels = copy[language];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">{labels.title}</h1>
      <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
        <p>{labels.p1}</p>
        <p>{labels.p2}</p>
        <p>{labels.p3}</p>
      </div>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        {language === "zh" ? "返回首页" : "Back to Home"}
      </Link>
    </main>
  );
};
