import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ManagedSectionId } from "../types";

export interface SectionCardLabels {
  moveUp: string;
  moveDown: string;
  show: string;
  hide: string;
}

export interface SectionCardProps {
  title: string;
  sectionId: ManagedSectionId;
  subtitle?: string;
  icon?: React.ReactNode;
  hidden?: boolean;
  expanded: boolean;
  children: React.ReactNode;
  registerEditorSectionRef: (sectionId: ManagedSectionId) => (element: HTMLElement | null) => void;
  onActivate: (sectionId: ManagedSectionId) => void;
  onMove: (sectionId: ManagedSectionId, direction: "up" | "down") => void;
  onToggleVisibility: (sectionId: ManagedSectionId) => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
  lockVisibility?: boolean;
  labels: SectionCardLabels;
}

export const SectionCard = ({
  title,
  sectionId,
  subtitle,
  icon,
  hidden = false,
  expanded,
  children,
  registerEditorSectionRef,
  onActivate,
  onMove,
  onToggleVisibility,
  disableMoveUp,
  disableMoveDown,
  lockVisibility = false,
  labels,
}: SectionCardProps) => (
  <Card
    ref={registerEditorSectionRef(sectionId)}
    className={cn(
      "gap-0 rounded-lg border py-0 transition-all",
      hidden && "opacity-55",
      expanded && !hidden && "border-primary/45 shadow-md shadow-primary/10 ring-1 ring-primary/25",
    )}
  >
    <div className="flex items-center justify-between gap-2 py-1 pl-3 pr-1.5">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2.5 py-2 text-left outline-none"
        onClick={() => onActivate(sectionId)}
      >
        {icon ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
        ) : null}
        <span className="flex min-w-0 flex-col items-start gap-0.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            {title}
            <ChevronDown
              className={cn(
                "size-3.5 text-muted-foreground transition-transform",
                expanded && !hidden && "rotate-180",
              )}
            />
          </span>
          {subtitle ? (
            <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
          ) : null}
        </span>
      </button>
      <div className="flex shrink-0 items-center gap-0.5">
        {lockVisibility ? null : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={hidden ? labels.show : labels.hide}
            title={hidden ? labels.show : labels.hide}
            onClick={(event) => {
              event.stopPropagation();
              onToggleVisibility(sectionId);
            }}
          >
            {hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </Button>
        )}
        {disableMoveUp && disableMoveDown ? null : (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disableMoveUp}
              aria-label={labels.moveUp}
              title={labels.moveUp}
              onClick={(event) => {
                event.stopPropagation();
                onMove(sectionId, "up");
              }}
            >
              <ChevronUp className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disableMoveDown}
              aria-label={labels.moveDown}
              title={labels.moveDown}
              onClick={(event) => {
                event.stopPropagation();
                onMove(sectionId, "down");
              }}
            >
              <ChevronDown className="size-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
    {expanded && !hidden ? (
      <div className="flex flex-col gap-3 border-t px-4 py-4">{children}</div>
    ) : null}
  </Card>
);
