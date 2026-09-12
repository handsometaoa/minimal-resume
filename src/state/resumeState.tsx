import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type PropsWithChildren,
} from "react";
import { createId } from "../lib/ids";
import { isThemeId, getThemePreset } from "../lib/themePresets";
import { createSampleResume } from "../lib/sampleResume";
import type {
  CollectionKey,
  CustomSection,
  EducationItem,
  ExperienceItem,
  Language,
  Profile,
  ProjectItem,
  ResumeData,
  ResumeTheme,
  SkillItem,
} from "../types";

const STORAGE_KEY = "minimal-resume:data";

type CollectionItemMap = {
  education: EducationItem;
  experience: ExperienceItem;
  projects: ProjectItem;
  skills: SkillItem;
  customSections: CustomSection;
};

type Action =
  | { type: "reset"; payload: ResumeData }
  | { type: "update-profile"; field: keyof Profile; value: string }
  | { type: "update-theme"; field: keyof ResumeTheme; value: string | boolean }
  | { type: "apply-theme"; theme: ResumeTheme }
  | { type: "add-item"; collection: CollectionKey }
  | {
      type: "update-item";
      collection: CollectionKey;
      id: string;
      field: string;
      value: string;
    }
  | { type: "remove-item"; collection: CollectionKey; id: string }
  | { type: "move-item"; collection: CollectionKey; id: string; direction: "up" | "down" };

type LegacyTextListItem = {
  bullets?: string[];
  content?: string;
};

const normalizeMarkdownText = (value: unknown): string =>
  typeof value === "string" ? value : "";

const normalizeItemContent = <T extends LegacyTextListItem>(item: T): T & { content: string } => ({
  ...item,
  content:
    typeof item.content === "string"
      ? item.content
      : Array.isArray(item.bullets)
        ? item.bullets
            .filter((bullet) => typeof bullet === "string" && bullet.trim())
            .map((bullet) => `- ${bullet}`)
            .join("\n")
        : "",
});

const createEmptyProfile = (): Profile => ({
  fullName: "",
  title: "",
  location: "",
  phone: "",
  email: "",
  website: "",
  age: "",
  gender: "",
  ethnicity: "",
  politicalStatus: "",
  currentStatus: "",
  jobIntent: "",
  summary: "",
  avatarUrl: "",
});

const createEmptyItem = <T extends CollectionKey>(collection: T): CollectionItemMap[T] => {
  switch (collection) {
    case "education":
      return {
        id: createId("edu"),
        school: "",
        degree: "",
        major: "",
        dateRange: "",
        details: "",
      } as CollectionItemMap[T];
    case "experience":
      return {
        id: createId("exp"),
        company: "",
        role: "",
        location: "",
        dateRange: "",
        content: "",
      } as CollectionItemMap[T];
    case "projects":
      return {
        id: createId("proj"),
        name: "",
        role: "",
        dateRange: "",
        link: "",
        content: "",
      } as CollectionItemMap[T];
    case "skills":
      return {
        id: createId("skill"),
        name: "",
        detail: "",
      } as CollectionItemMap[T];
    case "customSections":
      return {
        id: createId("custom"),
        title: "",
        content: "",
      } as CollectionItemMap[T];
  }
};

const normalizeProfile = (profile: Profile | undefined): Profile => ({
  ...createEmptyProfile(),
  ...profile,
  summary: normalizeMarkdownText(profile?.summary),
  avatarUrl: normalizeMarkdownText(profile?.avatarUrl),
});

const normalizeTheme = (theme: ResumeTheme | undefined): ResumeTheme => {
  const preset = getThemePreset(isThemeId(theme?.themeId) ? theme.themeId : "classic").values;
  return { ...preset, ...theme, themeId: preset.themeId };
};

const normalizeCollection = <T,>(items: unknown): T[] =>
  (Array.isArray(items) ? items : []).filter(
    (item): item is T => Boolean(item) && typeof item === "object",
  );

const normalizeResume = (resume: ResumeData): ResumeData => ({
  profile: normalizeProfile(resume?.profile),
  theme: normalizeTheme(resume?.theme),
  education: normalizeCollection<EducationItem>(resume?.education).map((item) => ({
    ...createEmptyItem("education"),
    ...item,
    details: normalizeMarkdownText(item.details),
  })),
  experience: normalizeCollection<ExperienceItem>(resume?.experience).map((item) => ({
    ...createEmptyItem("experience"),
    ...normalizeItemContent(item),
  })),
  projects: normalizeCollection<ProjectItem>(resume?.projects).map((item) => ({
    ...createEmptyItem("projects"),
    ...normalizeItemContent(item),
  })),
  skills: normalizeCollection<SkillItem>(resume?.skills).map((item) => ({
    ...createEmptyItem("skills"),
    ...item,
  })),
  customSections: normalizeCollection<CustomSection>(resume?.customSections).map((item) => ({
    ...createEmptyItem("customSections"),
    ...item,
    content: normalizeMarkdownText(item.content),
  })),
});

const createBlankResume = (language: Language, theme: ResumeTheme): ResumeData => ({
  ...createSampleResume(language),
  profile: createEmptyProfile(),
  education: [],
  experience: [],
  projects: [],
  skills: [],
  customSections: [],
  theme,
});

const moveInArray = <T,>(items: T[], index: number, direction: "up" | "down"): T[] => {
  const target = direction === "up" ? index - 1 : index + 1;

  if (target < 0 || target >= items.length) {
    return items;
  }

  const next = [...items];
  const [current] = next.splice(index, 1);
  next.splice(target, 0, current);
  return next;
};

const reducer = (state: ResumeData, action: Action): ResumeData => {
  switch (action.type) {
    case "reset":
      return normalizeResume(action.payload);
    case "update-profile":
      return {
        ...state,
        profile: {
          ...state.profile,
          [action.field]: action.value,
        },
      };
    case "update-theme":
      return {
        ...state,
        theme: {
          ...state.theme,
          [action.field]: action.value,
        },
      };
    case "apply-theme":
      return {
        ...state,
        theme: normalizeTheme(action.theme),
      };
    case "add-item":
      return {
        ...state,
        [action.collection]: [...state[action.collection], createEmptyItem(action.collection)],
      };
    case "update-item":
      return {
        ...state,
        [action.collection]: state[action.collection].map((item) =>
          item.id === action.id ? { ...item, [action.field]: action.value } : item,
        ),
      };
    case "remove-item":
      return {
        ...state,
        [action.collection]: state[action.collection].filter((item) => item.id !== action.id),
      };
    case "move-item": {
      const items = state[action.collection] as Array<{ id: string }>;
      const index = items.findIndex((item) => item.id === action.id);
      return {
        ...state,
        [action.collection]: moveInArray(items, index, action.direction),
      };
    }
    default:
      return state;
  }
};

const loadInitialState = (language: Language): ResumeData => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createSampleResume(language);
  }

  try {
    return normalizeResume(JSON.parse(raw) as ResumeData);
  } catch {
    return createSampleResume(language);
  }
};

interface ResumeStateValue {
  resume: ResumeData;
  dispatch: Dispatch<Action>;
  loadSample: () => void;
  clearResume: () => void;
}

const ResumeStateContext = createContext<ResumeStateValue | null>(null);

interface ResumeStateProviderProps extends PropsWithChildren {
  language: Language;
}

export const ResumeStateProvider = ({ children, language }: ResumeStateProviderProps) => {
  const [resume, dispatch] = useReducer(reducer, language, loadInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume]);

  const value = useMemo<ResumeStateValue>(
    () => ({
      resume,
      dispatch,
      loadSample: () => dispatch({ type: "reset", payload: createSampleResume(language) }),
      clearResume: () =>
        dispatch({
          type: "reset",
          payload: createBlankResume(language, resume.theme),
        }),
    }),
    [language, resume],
  );

  return <ResumeStateContext.Provider value={value}>{children}</ResumeStateContext.Provider>;
};

export const useResumeState = (): ResumeStateValue => {
  const context = useContext(ResumeStateContext);

  if (!context) {
    throw new Error("useResumeState must be used within ResumeStateProvider");
  }

  return context;
};
