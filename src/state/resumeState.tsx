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
import { createSampleResume } from "../lib/sampleResume";
import type {
  CustomSection,
  EducationItem,
  ExperienceItem,
  Language,
  ProjectItem,
  ResumeData,
  SkillItem,
} from "../types";

const STORAGE_KEY = "minimal-resume:data";

type CollectionKey = "education" | "experience" | "projects" | "skills" | "customSections";

type CollectionItemMap = {
  education: EducationItem;
  experience: ExperienceItem;
  projects: ProjectItem;
  skills: SkillItem;
  customSections: CustomSection;
};

type Action =
  | { type: "reset"; payload: ResumeData }
  | { type: "update-profile"; field: keyof ResumeData["profile"]; value: string }
  | { type: "update-theme"; field: keyof ResumeData["theme"]; value: string | boolean }
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
        ? item.bullets.filter((bullet) => typeof bullet === "string" && bullet.trim()).map((bullet) => `- ${bullet}`).join("\n")
        : "",
});

const normalizeResume = (resume: ResumeData): ResumeData => ({
  ...resume,
  profile: {
    ...resume.profile,
    summary: normalizeMarkdownText(resume.profile.summary),
  },
  education: resume.education.map((item) => ({
    ...item,
    details: normalizeMarkdownText(item.details),
  })),
  experience: resume.experience.map((item) => normalizeItemContent(item)),
  projects: resume.projects.map((item) => normalizeItemContent(item)),
  customSections: resume.customSections.map((item) => ({
    ...item,
    content: normalizeMarkdownText(item.content),
  })),
});

const cloneSample = (language: Language): ResumeData => structuredClone(createSampleResume(language));

const createBlankResume = (language: Language, theme: ResumeData["theme"]): ResumeData => ({
  ...cloneSample(language),
  profile: {
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
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  customSections: [],
  theme,
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
    return normalizeResume(cloneSample(language));
  }

  try {
    return normalizeResume(JSON.parse(raw) as ResumeData);
  } catch {
    return normalizeResume(cloneSample(language));
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
      loadSample: () => dispatch({ type: "reset", payload: cloneSample(language) }),
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
