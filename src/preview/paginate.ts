import type { ReactNode } from "react";
import type { PreviewSectionId } from "../types";

export interface SectionItemDef {
  key: string;
  node: ReactNode;
}

export interface SectionDef {
  id: PreviewSectionId;
  title: string;
  items: SectionItemDef[];
}

interface ProfileChunk {
  kind: "profile";
  node: ReactNode;
}

interface PageSectionChunk {
  kind: "section";
  sectionId: PreviewSectionId;
  title: string;
  items: SectionItemDef[];
}

export type PageChunk = ProfileChunk | PageSectionChunk;

export interface ResumePage {
  chunks: PageChunk[];
  height: number;
}

export const FALLBACK_PROFILE_HEIGHT = 220;
export const FALLBACK_HEADER_HEIGHT = 52;
export const FALLBACK_ITEM_HEIGHT = 84;

export interface PaginateInput {
  profileNode: ReactNode;
  profileHeight: number;
  hasProfile: boolean;
  sections: SectionDef[];
  headerHeights: Partial<Record<PreviewSectionId, number>>;
  itemHeights: Record<string, number>;
  maxContentHeight: number;
  sectionSpacing: number;
  blockGap: number;
}

/**
 * Greedy A4 pagination: profile first, then one chunk per section.
 * A section header stays with its first item and is repeated when
 * the section continues on a later page.
 */
export const paginateResume = (input: PaginateInput): ResumePage[] => {
  const {
    profileNode,
    profileHeight,
    hasProfile,
    sections,
    headerHeights,
    itemHeights,
    maxContentHeight,
    sectionSpacing,
    blockGap,
  } = input;

  const pages: ResumePage[] = [{ chunks: [], height: 0 }];
  let currentPage = pages[0];

  const startNewPage = () => {
    currentPage = { chunks: [], height: 0 };
    pages.push(currentPage);
  };

  if (hasProfile) {
    currentPage.chunks.push({ kind: "profile", node: profileNode });
    currentPage.height += profileHeight;
  }

  sections.forEach((section) => {
    let currentChunk: PageSectionChunk | null = null;

    section.items.forEach((item) => {
      const itemHeight = itemHeights[item.key] ?? FALLBACK_ITEM_HEIGHT;
      const headerHeight = headerHeights[section.id] ?? FALLBACK_HEADER_HEIGHT;

      if (!currentChunk) {
        const topSpacing = currentPage.height > 0 ? sectionSpacing : 0;
        const neededHeight = topSpacing + headerHeight + itemHeight;

        if (currentPage.height > 0 && currentPage.height + neededHeight > maxContentHeight) {
          startNewPage();
        }

        const chunk: PageSectionChunk = {
          kind: "section",
          sectionId: section.id,
          title: section.title,
          items: [item],
        };

        currentPage.chunks.push(chunk);
        currentPage.height += (currentPage.height > 0 ? sectionSpacing : 0) + headerHeight + itemHeight;
        currentChunk = chunk;
        return;
      }

      if (currentPage.height + blockGap + itemHeight > maxContentHeight) {
        startNewPage();

        const chunk: PageSectionChunk = {
          kind: "section",
          sectionId: section.id,
          title: section.title,
          items: [item],
        };

        currentPage.chunks.push(chunk);
        currentPage.height += headerHeight + itemHeight;
        currentChunk = chunk;
        return;
      }

      currentChunk.items.push(item);
      currentPage.height += blockGap + itemHeight;
    });
  });

  return pages.filter((page) => page.chunks.length);
};
