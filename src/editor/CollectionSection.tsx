import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useResumeState } from "../state/resumeState";
import type { CollectionKey } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="rounded-lg border bg-muted/40 p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <strong className="truncate text-xs font-medium text-foreground">
                {renderItemTitle ? renderItemTitle(item, index) : `${sectionProps.title} ${index + 1}`}
              </strong>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={sectionProps.labels.moveUp}
                  title={sectionProps.labels.moveUp}
                  disabled={index === 0}
                  onClick={() =>
                    dispatch({ type: "move-item", collection, id: item.id, direction: "up" })
                  }
                >
                  <ChevronUp className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={sectionProps.labels.moveDown}
                  title={sectionProps.labels.moveDown}
                  disabled={index === items.length - 1}
                  onClick={() =>
                    dispatch({ type: "move-item", collection, id: item.id, direction: "down" })
                  }
                >
                  <ChevronDown className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={removeLabel}
                  title={removeLabel}
                  onClick={() => dispatch({ type: "remove-item", collection, id: item.id })}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
            {renderFields(item)}
          </article>
        ))}
        <Button
          type="button"
          variant="outline"
          className={cn("w-full border-dashed text-xs text-muted-foreground")}
          onClick={() => dispatch({ type: "add-item", collection })}
        >
          <Plus className="size-3.5" />
          {addLabel}
        </Button>
      </div>
    </SectionCard>
  );
};
