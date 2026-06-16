"use client";

import { create } from "zustand";
import { flashcards, grammarNotes, lessons, vocabularies } from "@/lib/utils/demo-data";
import type { Flashcard, GrammarNote, Lesson, Vocabulary } from "@/types";

interface NotebookState {
  lessons: Lesson[];
  vocabularies: Vocabulary[];
  flashcards: Flashcard[];
  grammarNotes: GrammarNote[];
  toggleFavorite: (id: string) => void;
  toggleLearned: (id: string) => void;
  addLesson: (lesson: Lesson) => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  lessons,
  vocabularies,
  flashcards,
  grammarNotes,
  toggleFavorite: (id) =>
    set((state) => ({
      vocabularies: state.vocabularies.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    })),
  toggleLearned: (id) =>
    set((state) => ({
      vocabularies: state.vocabularies.map((item) =>
        item.id === id ? { ...item, isLearned: !item.isLearned } : item
      )
    })),
  addLesson: (lesson) => set((state) => ({ lessons: [lesson, ...state.lessons] }))
}));
