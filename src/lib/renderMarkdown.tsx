import type { ReactNode } from "react";

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

export const renderMarkdown = (value: string): ReactNode[] => {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const html = paragraph.map((line) => applyInlineMarkdown(line)).join("<br />");
    nodes.push(
      <p key={`p-${nodes.length}`} dangerouslySetInnerHTML={{ __html: html }} />,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`}>
        {listItems.map((item, index) => (
          <li key={`li-${index}`}>{renderInline(item, `li-text-${index}`)}</li>
        ))}
      </ul>,
    );
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
      const content = renderInline(headingMatch[2], `h-text-${nodes.length}`);
      const level = Math.min(headingMatch[1].length + 2, 5);
      if (level === 3) {
        nodes.push(<h3 key={`h-${nodes.length}`}>{content}</h3>);
      } else if (level === 4) {
        nodes.push(<h4 key={`h-${nodes.length}`}>{content}</h4>);
      } else {
        nodes.push(<h5 key={`h-${nodes.length}`}>{content}</h5>);
      }
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

  return nodes;
};
