export type EnglishLevel = "A1" | "A2" | "B1" | "B2";
export type LessonStatus = "draft" | "published" | "archived";
export type Difficulty = "easy" | "medium" | "hard";
export type FlashcardMode = "en_vi" | "vi_en" | "word_example" | "pronunciation";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  englishLevel: EnglishLevel;
  learningGoal: string;
  streakCount: number;
}

export interface Lesson {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  status: LessonStatus;
  vocabularyCount: number;
  grammarCount: number;
}

export interface Vocabulary {
  id: string;
  userId: string;
  lessonId?: string;
  word: string;
  meaning: string;
  ipa: string;
  partOfSpeech: string;
  category: string;
  difficulty: Difficulty;
  isLearned: boolean;
  isFavorite: boolean;
  examples: ExampleSentence[];
}

export interface ExampleSentence {
  id: string;
  vocabularyId: string;
  sentence: string;
  translation: string;
  difficulty: Difficulty;
  grammarExplanation?: string;
}

export interface Flashcard {
  id: string;
  vocabularyId: string;
  userId: string;
  front: string;
  back: string;
  mode: FlashcardMode;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

export interface GrammarTopic {
  id: string;
  name: string;
  level: EnglishLevel;
  description: string;
  parentId?: string;
}

export interface GrammarNote {
  id: string;
  userId: string;
  topicId: string;
  lessonId?: string;
  title: string;
  explanation: string;
  examples: string[];
  notes: string;
}

export interface WeeklyProgressPoint {
  day: string;
  vocabulary: number;
  lessons: number;
  speaking: number;
}

export interface LearningMetric {
  label: string;
  value: string;
  trend: string;
  tone: "blue" | "green" | "amber" | "red";
}
