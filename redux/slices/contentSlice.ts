import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Lesson,
  VocabularyPack,
  SpeakingModule,
  Quiz,
  ContentFilters,
} from "@/lib/types/content";

interface ContentState {
  lessons: Lesson[];
  vocabulary: VocabularyPack[];
  speaking: SpeakingModule[];
  quizzes: Quiz[];
  loading: boolean;
  filters: ContentFilters;
  selectedItem: Lesson | VocabularyPack | SpeakingModule | Quiz | null;
  selectedItemType: "lesson" | "vocabulary" | "speaking" | "quiz" | null;
}

const initialState: ContentState = {
  lessons: [],
  vocabulary: [],
  speaking: [],
  quizzes: [],
  loading: false,
  filters: {},
  selectedItem: null,
  selectedItemType: null,
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setLessons: (state, action: PayloadAction<Lesson[]>) => {
      state.lessons = action.payload;
    },
    addLesson: (state, action: PayloadAction<Lesson>) => {
      state.lessons.unshift(action.payload);
    },
    updateLesson: (state, action: PayloadAction<Lesson>) => {
      const index = state.lessons.findIndex(
        (l) => l._id === action.payload._id
      );
      if (index !== -1) {
        state.lessons[index] = action.payload;
      }
      if (
        state.selectedItemType === "lesson" &&
        state.selectedItem?._id === action.payload._id
      ) {
        state.selectedItem = action.payload;
      }
    },
    setVocabulary: (state, action: PayloadAction<VocabularyPack[]>) => {
      state.vocabulary = action.payload;
    },
    addVocabulary: (state, action: PayloadAction<VocabularyPack>) => {
      state.vocabulary.unshift(action.payload);
    },
    updateVocabulary: (state, action: PayloadAction<VocabularyPack>) => {
      const index = state.vocabulary.findIndex(
        (v) => v._id === action.payload._id
      );
      if (index !== -1) {
        state.vocabulary[index] = action.payload;
      }
      if (
        state.selectedItemType === "vocabulary" &&
        state.selectedItem?._id === action.payload._id
      ) {
        state.selectedItem = action.payload;
      }
    },
    setSpeaking: (state, action: PayloadAction<SpeakingModule[]>) => {
      state.speaking = action.payload;
    },
    addSpeaking: (state, action: PayloadAction<SpeakingModule>) => {
      state.speaking.unshift(action.payload);
    },
    updateSpeaking: (state, action: PayloadAction<SpeakingModule>) => {
      const index = state.speaking.findIndex(
        (s) => s._id === action.payload._id
      );
      if (index !== -1) {
        state.speaking[index] = action.payload;
      }
      if (
        state.selectedItemType === "speaking" &&
        state.selectedItem?._id === action.payload._id
      ) {
        state.selectedItem = action.payload;
      }
    },
    setQuizzes: (state, action: PayloadAction<Quiz[]>) => {
      state.quizzes = action.payload;
    },
    addQuiz: (state, action: PayloadAction<Quiz>) => {
      state.quizzes.unshift(action.payload);
    },
    updateQuiz: (state, action: PayloadAction<Quiz>) => {
      const index = state.quizzes.findIndex(
        (q) => q._id === action.payload._id
      );
      if (index !== -1) {
        state.quizzes[index] = action.payload;
      }
      if (
        state.selectedItemType === "quiz" &&
        state.selectedItem?._id === action.payload._id
      ) {
        state.selectedItem = action.payload;
      }
    },
    setFilters: (state, action: PayloadAction<ContentFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedItem: (
      state,
      action: PayloadAction<{
        item: Lesson | VocabularyPack | SpeakingModule | Quiz | null;
        type: "lesson" | "vocabulary" | "speaking" | "quiz" | null;
      }>
    ) => {
      state.selectedItem = action.payload.item;
      state.selectedItemType = action.payload.type;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setLessons,
  addLesson,
  updateLesson,
  setVocabulary,
  addVocabulary,
  updateVocabulary,
  setSpeaking,
  addSpeaking,
  updateSpeaking,
  setQuizzes,
  addQuiz,
  updateQuiz,
  setFilters,
  setSelectedItem,
  setLoading,
  resetFilters,
} = contentSlice.actions;

export default contentSlice.reducer;

