import type { ReactNode } from "react";

export type MarkdownBlock =
  | { kind: "heading"; level: 3 | 4 | 5; text: string }
  | { kind: "paragraph"; lines: string[] }
  | { kind: "list"; items: string[] };

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const applyInlineMarkdown = (text: string): string => {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return output;
};

const renderInline = (text: string, key: string): ReactNode => (
  <span key={key} dangerouslySetInnerHTML={{ __html: applyInlineMarkdown(text) }} />
);

/** 将 Markdown 文本解析为结构化块，供流式分页按块/列表项拆分排版 */
export const parseMarkdown = (value: string): MarkdownBlock[] => {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ kind: "paragraph", lines: paragraph });
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({ kind: "list", items: listItems });
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        kind: "heading",
        level: Math.min(headingMatch[1].length + 2, 5) as 3 | 4 | 5,
        text: headingMatch[2],
      });
      return;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return blocks;
};

export const renderMarkdownBlock = (block: MarkdownBlock, key: string): ReactNode => {
  switch (block.kind) {
    case "heading": {
      const Tag = `h${block.level}` as "h3" | "h4" | "h5";
      return <Tag key={key}>{renderInline(block.text, `${key}-text`)}</Tag>;
    }
    case "paragraph":
      return (
        <p
          key={key}
          dangerouslySetInnerHTML={{ __html: block.lines.map((line) => applyInlineMarkdown(line)).join("<br />") }}
        />
      );
    case "list":
      return (
        <ul key={key}>
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item, `${key}-li-${index}`)}</li>
          ))}
        </ul>
      );
  }
};

/** 单个列表项节点，供流式分页把列表按项拆分渲染 */
export const renderMarkdownListItem = (text: string, key: string): ReactNode => (
  <li key={key}>{renderInline(text, `${key}-text`)}</li>
);

export const renderMarkdown = (value: string): ReactNode[] =>
  parseMarkdown(value).map((block, index) => renderMarkdownBlock(block, `md-${index}`));
