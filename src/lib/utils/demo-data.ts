import type {
  Flashcard,
  GrammarNote,
  GrammarTopic,
  LearningMetric,
  Lesson,
  UserProfile,
  Vocabulary,
  WeeklyProgressPoint
} from "@/types";

export const demoUser: UserProfile = {
  id: "demo-user",
  email: "learner@example.com",
  name: "Minh Anh",
  englishLevel: "B1",
  learningGoal: "Communicate confidently at work",
  streakCount: 12
};

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    userId: demoUser.id,
    title: "Job Interview Practice",
    description: "Common interview questions, STAR answers, and follow-up vocabulary.",
    date: "2026-06-12",
    tags: ["business", "speaking"],
    status: "published",
    vocabularyCount: 18,
    grammarCount: 3,
    learnedCount: 8,
  },
  {
    id: "lesson-2",
    userId: demoUser.id,
    title: "Present Perfect in Daily Updates",
    description: "Using have/has + past participle to report progress and experience.",
    date: "2026-06-10",
    tags: ["grammar", "work"],
    status: "published",
    vocabularyCount: 12,
    grammarCount: 4,
    learnedCount: 5,
  },
  {
    id: "lesson-3",
    userId: demoUser.id,
    title: "Travel Complaints and Solutions",
    description: "Polite complaint patterns and service recovery phrases.",
    date: "2026-06-08",
    tags: ["travel", "roleplay"],
    status: "draft",
    vocabularyCount: 21,
    grammarCount: 2,
    learnedCount: 0,
  }
];

export const vocabularies: Vocabulary[] = [
  {
    id: "vocab-1",
    userId: demoUser.id,
    lessonId: "lesson-1",
    word: "accomplishment",
    meaning: "thanh tuu",
    ipa: "/əˈkɑːmplɪʃmənt/",
    partOfSpeech: "noun",
    category: "career",
    difficulty: "medium",
    isLearned: false,
    isFavorite: true,
    examples: [
      {
        id: "ex-1",
        vocabularyId: "vocab-1",
        sentence: "My biggest accomplishment was launching a new support workflow.",
        translation: "Thanh tuu lon nhat cua toi la trien khai quy trinh ho tro moi.",
        difficulty: "medium"
      }
    ]
  },
  {
    id: "vocab-2",
    userId: demoUser.id,
    lessonId: "lesson-1",
    word: "collaborate",
    meaning: "cong tac, phoi hop",
    ipa: "/kəˈlæbəreɪt/",
    partOfSpeech: "verb",
    category: "teamwork",
    difficulty: "easy",
    isLearned: true,
    isFavorite: false,
    examples: [
      {
        id: "ex-2",
        vocabularyId: "vocab-2",
        sentence: "I collaborate with designers to improve the checkout page.",
        translation: "Toi phoi hop voi nha thiet ke de cai thien trang thanh toan.",
        difficulty: "easy"
      }
    ]
  },
  {
    id: "vocab-3",
    userId: demoUser.id,
    lessonId: "lesson-2",
    word: "deadline",
    meaning: "han chot",
    ipa: "/ˈdedlaɪn/",
    partOfSpeech: "noun",
    category: "work",
    difficulty: "easy",
    isLearned: false,
    isFavorite: true,
    examples: [
      {
        id: "ex-3",
        vocabularyId: "vocab-3",
        sentence: "We have already moved the deadline to next Friday.",
        translation: "Chung toi da doi han chot sang thu Sau tuan toi.",
        difficulty: "easy",
        grammarExplanation: "Present perfect emphasizes the completed change."
      }
    ]
  },
  {
    id: "vocab-4",
    userId: demoUser.id,
    lessonId: "lesson-3",
    word: "compensation",
    meaning: "su boi thuong",
    ipa: "/ˌkɑːmpenˈseɪʃn/",
    partOfSpeech: "noun",
    category: "travel",
    difficulty: "hard",
    isLearned: false,
    isFavorite: false,
    examples: [
      {
        id: "ex-4",
        vocabularyId: "vocab-4",
        sentence: "The airline offered compensation for the delayed flight.",
        translation: "Hang hang khong de nghi boi thuong cho chuyen bay bi tre.",
        difficulty: "medium"
      }
    ]
  }
];

export const flashcards: Flashcard[] = vocabularies.map((item, index) => ({
  id: `card-${index + 1}`,
  vocabularyId: item.id,
  userId: demoUser.id,
  front: item.word,
  back: `${item.meaning}\n${item.examples[0]?.sentence ?? ""}`,
  mode: "en_vi",
  easeFactor: 2.5,
  interval: index === 0 ? 0 : index + 1,
  repetitions: index,
  nextReview: new Date(Date.now() + (index - 1) * 86400000).toISOString()
}));

export const grammarTopics: GrammarTopic[] = [
  {
    id: "topic-1",
    name: "Present Perfect",
    level: "B1",
    description: "Experiences, changes, and results connected to the present."
  },
  {
    id: "topic-2",
    name: "Polite Requests",
    level: "A2",
    description: "Could you, would it be possible, and softening phrases."
  },
  {
    id: "topic-3",
    name: "STAR Answers",
    level: "B1",
    description: "Situation, task, action, result structure for interviews."
  }
];

export const grammarNotes: GrammarNote[] = [
  {
    id: "note-1",
    userId: demoUser.id,
    lessonId: "lesson-2",
    topicId: "topic-1",
    title: "Already, yet, just",
    explanation: "Use present perfect with already for completed earlier-than-expected actions, yet for expected actions, and just for recent actions.",
    examples: ["I have already sent the report.", "Have you finished the slide deck yet?", "She has just joined the call."],
    notes: "In Vietnamese, translate by context instead of forcing a fixed tense marker."
  },
  {
    id: "note-2",
    userId: demoUser.id,
    lessonId: "lesson-3",
    topicId: "topic-2",
    title: "Soft complaint pattern",
    explanation: "Start with a neutral problem statement, then ask for a solution politely.",
    examples: ["I'm afraid my room has not been cleaned yet.", "Would it be possible to move me to a quieter room?"],
    notes: "Avoid direct blame in service situations."
  }
];

export const weeklyProgress: WeeklyProgressPoint[] = [
  { day: "Mon", vocabulary: 8, lessons: 1, speaking: 12 },
  { day: "Tue", vocabulary: 12, lessons: 0, speaking: 8 },
  { day: "Wed", vocabulary: 6, lessons: 1, speaking: 18 },
  { day: "Thu", vocabulary: 15, lessons: 1, speaking: 10 },
  { day: "Fri", vocabulary: 9, lessons: 0, speaking: 20 },
  { day: "Sat", vocabulary: 18, lessons: 2, speaking: 16 },
  { day: "Sun", vocabulary: 11, lessons: 1, speaking: 14 }
];

export const learningMetrics: LearningMetric[] = [
  { label: "Lessons", value: "24", trend: "+3 this week", tone: "blue" },
  { label: "Vocabulary", value: "386", trend: "42 due today", tone: "green" },
  { label: "Speaking", value: "4h 20m", trend: "+38m this week", tone: "amber" },
  { label: "Streak", value: "12", trend: "longest 21 days", tone: "red" }
];
