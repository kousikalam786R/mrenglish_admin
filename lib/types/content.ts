export type ContentLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type LessonCategory = "Grammar" | "Speaking" | "Conversation" | "Reading" | "Writing";
export type ContentStatus = "Draft" | "Published" | "Archived";
export type SpeakingType = "Interview" | "Conversation" | "Roleplay";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Lesson {
  _id: string;
  title: string;
  level: ContentLevel;
  category: LessonCategory;
  content: string; // Rich text content
  audioUrl?: string;
  imageUrl?: string;
  tags: string[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface VocabularyPack {
  _id: string;
  packName: string;
  level: ContentLevel;
  words: VocabularyWord[];
  audioUrl?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  example?: string;
  pronunciation?: string;
}

export interface SpeakingModule {
  _id: string;
  moduleName: string;
  difficulty: Difficulty;
  type: SpeakingType;
  script: string;
  expectedAnswers: string[];
  audioUrl?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Quiz {
  _id: string;
  quizName: string;
  level: ContentLevel;
  questions: QuizQuestion[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface QuizQuestion {
  _id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string;
}

export interface ContentFilters {
  level?: ContentLevel | "all";
  category?: LessonCategory | "all";
  status?: ContentStatus | "all";
  type?: SpeakingType | "all";
  difficulty?: Difficulty | "all";
  search?: string;
}

export interface ContentStats {
  totalLessons: number;
  totalVocabularyPacks: number;
  totalQuizzes: number;
  totalSpeakingModules: number;
  recentEdits: ContentEdit[];
}

export interface ContentEdit {
  type: "lesson" | "vocabulary" | "speaking" | "quiz";
  title: string;
  updatedAt: string;
  updatedBy?: string;
}

