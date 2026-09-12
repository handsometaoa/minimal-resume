import type { ReactNode } from "react";
import { useResumeState } from "../state/resumeState";
import type { CollectionKey } from "../types";
import { SectionCard, type SectionCardProps } from "./SectionCard";

export interface CollectionSectionProps<T> extends Omit<SectionCardProps, "children"> {
  collection: CollectionKey;
  items: T[];
  renderFields: (item: T) => ReactNode;
  renderItemTitle?: (item: T, index: number) => string;
  addLabel: string;
  removeLabel: string;
}

export const CollectionSection = <T extends { id: string },>({
  collection,
  items,
  renderFields,
  renderItemTitle,
  addLabel,
  removeLabel,
  ...sectionProps
}: CollectionSectionProps<T>) => {
  const { dispatch } = useResumeState();

  return (
    <SectionCard {...sectionProps}>
      <div className="stack-gap">
        {items.map((item, index) => (
          <article className="item-card" key={item.id}>
            <div className="item-card__header">
              <strong>
                {renderItemTitle ? renderItemTitle(item, index) : `${sectionProps.title} ${index + 1}`}
              </strong>
              <div className="inline-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    dispatch({ type: "move-item", collection, id: item.id, direction: "up" })
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    dispatch({ type: "move-item", collection, id: item.id, direction: "down" })
                  }
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => dispatch({ type: "remove-item", collection, id: item.id })}
                >
                  {removeLabel}
                </button>
              </div>
            </div>
            {renderFields(item)}
          </article>
        ))}
        <button
          type="button"
          className="secondary-button"
          onClick={() => dispatch({ type: "add-item", collection })}
        >
          {addLabel}
        </button>
      </div>
    </SectionCard>
  );
};
