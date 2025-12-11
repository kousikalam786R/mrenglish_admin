import {
  Lesson,
  VocabularyPack,
  SpeakingModule,
  Quiz,
  ContentFilters,
  ContentStats,
  ContentLevel,
  LessonCategory,
  ContentStatus,
  SpeakingType,
  Difficulty,
  VocabularyWord,
  QuizQuestion,
} from "@/lib/types/content";

// Mock data generators
const generateMockLessons = (): Lesson[] => {
  const categories: LessonCategory[] = ["Grammar", "Speaking", "Conversation", "Reading", "Writing"];
  const levels: ContentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const statuses: ContentStatus[] = ["Draft", "Published", "Archived"];

  return Array.from({ length: 30 }, (_, i) => ({
    _id: `lesson-${i + 1}`,
    title: `Lesson ${i + 1}: ${categories[i % categories.length]} Basics`,
    level: levels[i % levels.length],
    category: categories[i % categories.length],
    content: `<p>This is the content for lesson ${i + 1}. It covers important concepts in ${categories[i % categories.length].toLowerCase()}.</p><p>Students will learn various techniques and practice exercises.</p>`,
    tags: ["beginner", "intermediate", "advanced"].slice(0, (i % 3) + 1),
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin@mre.com",
  }));
};

const generateMockVocabularyPacks = (): VocabularyPack[] => {
  const levels: ContentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const statuses: ContentStatus[] = ["Draft", "Published", "Archived"];

  return Array.from({ length: 20 }, (_, i) => ({
    _id: `vocab-${i + 1}`,
    packName: `Vocabulary Pack ${i + 1}`,
    level: levels[i % levels.length],
    words: Array.from({ length: 10 + (i % 20) }, (_, j) => ({
      word: `Word ${j + 1}`,
      definition: `Definition for word ${j + 1}`,
      example: `Example sentence ${j + 1}`,
      pronunciation: `/wɜːd ${j + 1}/`,
    })),
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin@mre.com",
  }));
};

const generateMockSpeakingModules = (): SpeakingModule[] => {
  const types: SpeakingType[] = ["Interview", "Conversation", "Roleplay"];
  const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];
  const statuses: ContentStatus[] = ["Draft", "Published", "Archived"];

  return Array.from({ length: 15 }, (_, i) => ({
    _id: `speaking-${i + 1}`,
    moduleName: `Speaking Module ${i + 1}`,
    difficulty: difficulties[i % difficulties.length],
    type: types[i % types.length],
    script: `This is the script for speaking module ${i + 1}. It includes various scenarios and prompts for practice.`,
    expectedAnswers: [
      "Expected answer 1",
      "Expected answer 2",
      "Expected answer 3",
    ],
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin@mre.com",
  }));
};

const generateMockQuizzes = (): Quiz[] => {
  const levels: ContentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const statuses: ContentStatus[] = ["Draft", "Published", "Archived"];

  return Array.from({ length: 25 }, (_, i) => ({
    _id: `quiz-${i + 1}`,
    quizName: `Quiz ${i + 1}`,
    level: levels[i % levels.length],
    questions: Array.from({ length: 5 + (i % 10) }, (_, j) => ({
      _id: `q-${i + 1}-${j + 1}`,
      questionText: `Question ${j + 1} for quiz ${i + 1}?`,
      options: {
        A: `Option A for question ${j + 1}`,
        B: `Option B for question ${j + 1}`,
        C: `Option C for question ${j + 1}`,
        D: `Option D for question ${j + 1}`,
      },
      correctAnswer: (["A", "B", "C", "D"] as const)[j % 4],
      explanation: `Explanation for question ${j + 1}`,
    })),
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin@mre.com",
  }));
};

let mockLessons = generateMockLessons();
let mockVocabularyPacks = generateMockVocabularyPacks();
let mockSpeakingModules = generateMockSpeakingModules();
let mockQuizzes = generateMockQuizzes();

// Lessons API
export async function fetchLessons(filters?: ContentFilters): Promise<Lesson[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockLessons];

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((l) =>
      l.title.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.level && filters.level !== "all") {
    filtered = filtered.filter((l) => l.level === filters.level);
  }

  if (filters?.category && filters.category !== "all") {
    filtered = filtered.filter((l) => l.category === filters.category);
  }

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((l) => l.status === filters.status);
  }

  return filtered;
}

export async function createLesson(lesson: Omit<Lesson, "_id" | "createdAt" | "updatedAt">): Promise<Lesson> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newLesson: Lesson = {
    ...lesson,
    _id: `lesson-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockLessons.unshift(newLesson);
  return newLesson;
}

export async function updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockLessons.findIndex((l) => l._id === id);
  if (index === -1) throw new Error("Lesson not found");

  const updated = {
    ...mockLessons[index],
    ...lesson,
    updatedAt: new Date().toISOString(),
  };

  mockLessons[index] = updated;
  return updated;
}

// Vocabulary API
export async function fetchVocabularyPacks(filters?: ContentFilters): Promise<VocabularyPack[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockVocabularyPacks];

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((v) =>
      v.packName.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.level && filters.level !== "all") {
    filtered = filtered.filter((v) => v.level === filters.level);
  }

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((v) => v.status === filters.status);
  }

  return filtered;
}

export async function createVocabularyPack(
  pack: Omit<VocabularyPack, "_id" | "createdAt" | "updatedAt">
): Promise<VocabularyPack> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newPack: VocabularyPack = {
    ...pack,
    _id: `vocab-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockVocabularyPacks.unshift(newPack);
  return newPack;
}

export async function updateVocabularyPack(
  id: string,
  pack: Partial<VocabularyPack>
): Promise<VocabularyPack> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockVocabularyPacks.findIndex((v) => v._id === id);
  if (index === -1) throw new Error("Vocabulary pack not found");

  const updated = {
    ...mockVocabularyPacks[index],
    ...pack,
    updatedAt: new Date().toISOString(),
  };

  mockVocabularyPacks[index] = updated;
  return updated;
}

// Speaking API
export async function fetchSpeakingModules(filters?: ContentFilters): Promise<SpeakingModule[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockSpeakingModules];

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((s) =>
      s.moduleName.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.difficulty && filters.difficulty !== "all") {
    filtered = filtered.filter((s) => s.difficulty === filters.difficulty);
  }

  if (filters?.type && filters.type !== "all") {
    filtered = filtered.filter((s) => s.type === filters.type);
  }

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((s) => s.status === filters.status);
  }

  return filtered;
}

export async function createSpeakingModule(
  module: Omit<SpeakingModule, "_id" | "createdAt" | "updatedAt">
): Promise<SpeakingModule> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newModule: SpeakingModule = {
    ...module,
    _id: `speaking-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockSpeakingModules.unshift(newModule);
  return newModule;
}

export async function updateSpeakingModule(
  id: string,
  module: Partial<SpeakingModule>
): Promise<SpeakingModule> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockSpeakingModules.findIndex((s) => s._id === id);
  if (index === -1) throw new Error("Speaking module not found");

  const updated = {
    ...mockSpeakingModules[index],
    ...module,
    updatedAt: new Date().toISOString(),
  };

  mockSpeakingModules[index] = updated;
  return updated;
}

// Quiz API
export async function fetchQuizzes(filters?: ContentFilters): Promise<Quiz[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockQuizzes];

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((q) =>
      q.quizName.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.level && filters.level !== "all") {
    filtered = filtered.filter((q) => q.level === filters.level);
  }

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((q) => q.status === filters.status);
  }

  return filtered;
}

export async function createQuiz(quiz: Omit<Quiz, "_id" | "createdAt" | "updatedAt">): Promise<Quiz> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newQuiz: Quiz = {
    ...quiz,
    _id: `quiz-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockQuizzes.unshift(newQuiz);
  return newQuiz;
}

export async function updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockQuizzes.findIndex((q) => q._id === id);
  if (index === -1) throw new Error("Quiz not found");

  const updated = {
    ...mockQuizzes[index],
    ...quiz,
    updatedAt: new Date().toISOString(),
  };

  mockQuizzes[index] = updated;
  return updated;
}

// Stats API
export async function fetchContentStats(): Promise<ContentStats> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const allItems = [
    ...mockLessons.map((l) => ({
      type: "lesson" as const,
      title: l.title,
      updatedAt: l.updatedAt,
      updatedBy: l.createdBy,
    })),
    ...mockVocabularyPacks.map((v) => ({
      type: "vocabulary" as const,
      title: v.packName,
      updatedAt: v.updatedAt,
      updatedBy: v.createdBy,
    })),
    ...mockSpeakingModules.map((s) => ({
      type: "speaking" as const,
      title: s.moduleName,
      updatedAt: s.updatedAt,
      updatedBy: s.createdBy,
    })),
    ...mockQuizzes.map((q) => ({
      type: "quiz" as const,
      title: q.quizName,
      updatedAt: q.updatedAt,
      updatedBy: q.createdBy,
    })),
  ];

  const recentEdits = allItems
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return {
    totalLessons: mockLessons.length,
    totalVocabularyPacks: mockVocabularyPacks.length,
    totalQuizzes: mockQuizzes.length,
    totalSpeakingModules: mockSpeakingModules.length,
    recentEdits,
  };
}

