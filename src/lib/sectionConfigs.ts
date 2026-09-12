import type { ManagedSectionId, SectionConfig } from "../types";

export const defaultSectionConfigs = (): SectionConfig[] => [
  { id: "profile", title: "profile", visible: true },
  { id: "education", title: "education", visible: true },
  { id: "experience", title: "experience", visible: true },
  { id: "projects", title: "projects", visible: true },
  { id: "skills", title: "skills", visible: true },
  { id: "customSections", title: "custom", visible: true },
];

export const reorderSection = (
  configs: SectionConfig[],
  fromSectionId: ManagedSectionId,
  toSectionId: ManagedSectionId,
): SectionConfig[] => {
  if (fromSectionId === toSectionId) {
    return configs;
  }

  const fromIndex = configs.findIndex((item) => item.id === fromSectionId);
  const toIndex = configs.findIndex((item) => item.id === toSectionId);

  if (fromIndex < 0 || toIndex < 0) {
    return configs;
  }

  const next = [...configs];
  const [current] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, current);
  return next;
};
