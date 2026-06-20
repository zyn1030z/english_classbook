import { createClient } from "@/lib/supabase/server";
import { DailyQuest, QuestType } from "@/types";

export async function getAdaptiveQuests(userId: string): Promise<DailyQuest[]> {
  const supabase = await createClient();

  // 1. Get Today's Date Range
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayISO = startOfDay.toISOString();

  // 2. Fetch required metrics in parallel
  const [
    dueCardsRes,
    reviewsTodayRes,
    quizzesTodayRes,
    firstReviewsRes
  ] = await Promise.all([
    // Check total due cards
    supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    // Or we could check due by checking next_review <= now, but let's keep it simple or accurate.
    // Actually, accurate due cards:
    // we need next_review <= now. But in dashboard page.tsx we fetched it manually.
    // Let's just use reviews created today for progress.
    supabase
      .from("flashcard_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("last_review", startOfDayISO),
    // Quizzes taken today
    supabase
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfDayISO),
    // First-time reviews today (Option B)
    supabase
      .from("flashcard_reviews")
      .select("flashcard_id")
      .eq("user_id", userId)
      .gte("last_review", startOfDayISO)
      .lte("repetitions", 1),
  ]);

  const reviewsDone = reviewsTodayRes.count ?? 0;
  const quizzesDone = quizzesTodayRes.count ?? 0;
  const vocabAdded = new Set(firstReviewsRes.data?.map(r => r.flashcard_id) || []).size;

  // We can make the target dynamic. E.g. If user has a lot of due cards, target is higher.
  const targetReviews = 10;
  const targetVocab = 5;
  const targetQuizzes = 1;

  const quests: DailyQuest[] = [
    {
      id: "quest_review",
      type: "review_flashcards",
      title: "Ôn tập Flashcard",
      description: `Ôn tập ít nhất ${targetReviews} từ vựng đã học để duy trì trí nhớ.`,
      target: targetReviews,
      progress: Math.min(reviewsDone, targetReviews),
      isCompleted: reviewsDone >= targetReviews,
      reward: 10,
    },
    {
      id: "quest_vocab",
      type: "add_vocabulary",
      title: "Học từ mới",
      description: `Bắt đầu ghi nhớ ${targetVocab} từ vựng qua Flashcard (Lượt học đầu tiên).`,
      target: targetVocab,
      progress: Math.min(vocabAdded, targetVocab),
      isCompleted: vocabAdded >= targetVocab,
      reward: 10,
    },
    {
      id: "quest_quiz",
      type: "take_quiz",
      title: "Làm bài kiểm tra",
      description: "Hoàn thành 1 bài quiz để đánh giá mức độ ghi nhớ.",
      target: targetQuizzes,
      progress: Math.min(quizzesDone, targetQuizzes),
      isCompleted: quizzesDone >= targetQuizzes,
      reward: 15,
    }
  ];

  return quests;
}
