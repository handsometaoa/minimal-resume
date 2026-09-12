import type { ReactNode } from "react";
import type { PreviewSectionId } from "../types";

export type FlowBlockKind = "profile" | "section-bar" | "entry-header" | "content";

export interface FlowListItem {
  key: string;
  node: ReactNode;
}

/**
 * 流式分页的原子单元：
 * - profile / section-bar / entry-header 整块原子；
 * - content 块携带 items 时按列表项拆分跨页，renderFrom 指明从第几项开始渲染。
 * 所有块间距离由 spaceBefore 显式声明（页面顶部或紧随模块栏时由引擎归零）。
 */
export interface FlowBlock {
  key: string;
  kind: FlowBlockKind;
  /** 所属逻辑模块实例（自定义模块各自一组） */
  group: string;
  /** 预览联动用的模块 id */
  sectionId: PreviewSectionId;
  entryId: string;
  node?: ReactNode;
  spaceBefore: number;
  /** 不得成为页面最后一块（模块栏 / 经历标题 / 内容小标题） */
  keepWithNext: boolean;
  items?: FlowListItem[];
  itemGap?: number;
  /** 从第几个列表项开始渲染（拆分余量块 > 0） */
  renderFrom?: number;
}

export type FlowPiece =
  | { type: "node"; key: string; sectionId: PreviewSectionId; node: ReactNode; spaceBefore: number }
  | {
      type: "list-part";
      key: string;
      sectionId: PreviewSectionId;
      blockKey: string;
      from: number;
      to: number;
      spaceBefore: number;
    };

export interface FlowPage {
  pieces: FlowPiece[];
  height: number;
}

export interface PackInput {
  blocks: FlowBlock[];
  heights: Record<string, number>;
  itemHeights: Record<string, number>;
  maxContentHeight: number;
  /** 分隔线模式下相邻模块之间的额外间距 */
  dividerGap: number;
}

const FALLBACK_BLOCK_HEIGHT = 40;
const FALLBACK_ITEM_HEIGHT = 24;

/**
 * 块级流式分页引擎：按序装填块，放不下的列表在列表项边界拆分，
 * 跨页内容在新页顶部自动补齐模块栏与经历标题，保证上下文完整。
 */
export const packFlowPages = (input: PackInput): FlowPage[] => {
  const { blocks, heights, itemHeights, maxContentHeight, dividerGap } = input;

  const barByGroup = new Map<string, FlowBlock>();
  const headerByEntry = new Map<string, FlowBlock>();
  blocks.forEach((block) => {
    if (block.kind === "section-bar") barByGroup.set(block.group, block);
    if (block.kind === "entry-header") headerByEntry.set(block.entryId, block);
  });

  const pages: FlowPage[] = [{ pieces: [], height: 0 }];
  let cur = pages[0];
  let lastWasBar = false;
  let lastGroup = "";

  const startNewPage = () => {
    cur = { pieces: [], height: 0 };
    pages.push(cur);
    lastWasBar = false;
    lastGroup = "";
  };

  const pushPiece = (piece: FlowPiece, height: number, isBar: boolean, group: string) => {
    cur.pieces.push(piece);
    cur.height += piece.spaceBefore + height;
    lastWasBar = isBar;
    if (isBar) lastGroup = group;
  };

  const placeNode = (
    block: FlowBlock,
    node: ReactNode,
    sb: number,
    height: number,
  ) => {
    pushPiece(
      { type: "node", key: `${block.key}@p${pages.length}-${cur.pieces.length}`, sectionId: block.sectionId, node, spaceBefore: sb },
      height,
      block.kind === "section-bar",
      block.group,
    );
  };

  const placeListPart = (block: FlowBlock, from: number, to: number, sb: number, height: number) => {
    pushPiece(
      {
        type: "list-part",
        key: `${block.key}#${from}-${to}@p${pages.length}-${cur.pieces.length}`,
        sectionId: block.sectionId,
        blockKey: block.key,
        from,
        to,
        spaceBefore: sb,
      },
      height,
      false,
      block.group,
    );
  };

  // 内容跨页时，在新页顶部补齐模块栏与经历标题，保持上下文
  const placeRepeatHeader = (block: FlowBlock) => {
    const barBlock = barByGroup.get(block.group);
    if (barBlock && lastGroup !== block.group) {
      placeNode(
        barBlock,
        barBlock.node,
        0,
        heights[barBlock.key] ?? FALLBACK_BLOCK_HEIGHT,
      );
    }
    const headerBlock = headerByEntry.get(block.entryId);
    if (headerBlock) {
      placeNode(headerBlock, headerBlock.node, 0, heights[headerBlock.key] ?? FALLBACK_BLOCK_HEIGHT);
    }
  };

  const effectiveSpaceBefore = (block: FlowBlock): number => {
    if (cur.height === 0 || lastWasBar) return 0;
    let sb = block.spaceBefore;
    if (block.kind === "section-bar" && lastGroup && lastGroup !== block.group) {
      sb += dividerGap;
    }
    return sb;
  };

  // keepWithNext 链的高度：自身 + 后续连续 keep 块 + 第一个非 keep 块。
  // 链尾遇到列表时只要求首项同页（放不下整表也不该把标题推走造成大留白），
  // 但至少保证标题后面跟着一行内容，不孤悬页尾。
  const blockMinHeight = (block: FlowBlock): number => {
    if (block.items && block.items.length) {
      return itemHeights[block.items[0].key] ?? FALLBACK_ITEM_HEIGHT;
    }
    return heights[block.key] ?? FALLBACK_BLOCK_HEIGHT;
  };

  const keepChainHeight = (block: FlowBlock, sb: number, nextIdx: number): number => {
    let total = (heights[block.key] ?? FALLBACK_BLOCK_HEIGHT) + sb;
    let idx = nextIdx;
    let chain = true;
    let prevIsBar = block.kind === "section-bar";
    while (idx < blocks.length && chain) {
      const nb = blocks[idx];
      total += blockMinHeight(nb) + (prevIsBar ? 0 : nb.spaceBefore);
      prevIsBar = false;
      chain = nb.keepWithNext;
      idx += 1;
    }
    return total;
  };

  const pending: FlowBlock[] = [];
  let index = 0;

  let block: FlowBlock | undefined = pending.shift() ?? blocks[index++];
  while (block) {
    if (cur.height === 0 && cur.pieces.length === 0 && block.kind === "content" && block.entryId) {
      placeRepeatHeader(block);
    }

    const h = heights[block.key] ?? FALLBACK_BLOCK_HEIGHT;
    const sb = effectiveSpaceBefore(block);

    if (block.items && block.items.length) {
      // 可拆分列表：尽量多装整项
      const gap = block.itemGap ?? 0;
      const renderFrom = block.renderFrom ?? 0;
      const available = maxContentHeight - cur.height - sb;
      let used = 0;
      let count = 0;
      for (const item of block.items) {
        const need = used + (count > 0 ? gap : 0) + (itemHeights[item.key] ?? FALLBACK_ITEM_HEIGHT);
        if (need > available && count > 0) break;
        used = need;
        count += 1;
      }

      if (count === block.items.length) {
        placeListPart(block, renderFrom, renderFrom + count, sb, used);
      } else if (count === 0) {
        if (cur.height > 0 && cur.pieces.length > 0) {
          startNewPage();
          pending.unshift({ ...block, spaceBefore: 0 });
        } else {
          // 页顶仍放不下第一项（单项超页）：强制放一项，其余继续
          const firstHeight = itemHeights[block.items[0].key] ?? FALLBACK_ITEM_HEIGHT;
          placeListPart(block, renderFrom, renderFrom + 1, sb, firstHeight);
          if (block.items.length > 1) {
            pending.unshift({
              ...block,
              key: `${block.key}@rest${renderFrom + 1}`,
              spaceBefore: 0,
              renderFrom: renderFrom + 1,
            });
          }
        }
      } else {
        placeListPart(block, renderFrom, renderFrom + count, sb, used);
        pending.unshift({
          ...block,
          key: `${block.key}@rest${renderFrom + count}`,
          spaceBefore: 0,
          renderFrom: renderFrom + count,
          items: block.items,
        });
      }
    } else if (block.keepWithNext) {
      // 与后续块保持同页，避免标题孤悬页尾
      const required = keepChainHeight(block, sb, index);
      if (cur.height > 0 && cur.height + required > maxContentHeight) {
        startNewPage();
        if (block.kind === "content") placeRepeatHeader(block);
        placeNode(block, block.node, effectiveSpaceBefore(block), h);
      } else {
        placeNode(block, block.node, sb, h);
      }
    } else {
      if (cur.height > 0 && cur.height + sb + h > maxContentHeight) {
        startNewPage();
        if (block.kind === "content") placeRepeatHeader(block);
        placeNode(block, block.node, effectiveSpaceBefore(block), h);
      } else {
        placeNode(block, block.node, sb, h);
      }
    }

    block = pending.shift() ?? blocks[index++];
  }

  return pages.filter((page) => page.pieces.length);
};
