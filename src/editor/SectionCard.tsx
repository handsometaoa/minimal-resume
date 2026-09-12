import type { ReactNode } from "react";
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
  hidden?: boolean;
  expanded: boolean;
  children: ReactNode;
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
  <section
    ref={registerEditorSectionRef(sectionId)}
    className={`panel section-card ${hidden ? "section-card--hidden" : ""}`}
  >
    <div className="section-card__header">
      <button
        type="button"
        className="section-card__trigger"
        onClick={() => onActivate(sectionId)}
      >
        <div className="section-card__heading">
          <h2>{title}</h2>
          {subtitle ? <p className="section-card__subtitle">{subtitle}</p> : null}
        </div>
      </button>
      <div className="section-card__actions">
        {lockVisibility ? null : (
          <button
            type="button"
            className={hidden ? "secondary-button" : "ghost-button"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleVisibility(sectionId);
            }}
          >
            {hidden ? labels.show : labels.hide}
          </button>
        )}
        {disableMoveUp && disableMoveDown ? null : (
          <>
            <button
              type="button"
              className="ghost-button"
              disabled={disableMoveUp}
              onClick={(event) => {
                event.stopPropagation();
                onMove(sectionId, "up");
              }}
            >
              {labels.moveUp}
            </button>
            <button
              type="button"
              className="ghost-button"
              disabled={disableMoveDown}
              onClick={(event) => {
                event.stopPropagation();
                onMove(sectionId, "down");
              }}
            >
              {labels.moveDown}
            </button>
          </>
        )}
      </div>
    </div>
    {expanded && !hidden ? <div className="section-card__body">{children}</div> : null}
  </section>
);
