import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardReview } from "@/features/flashcards/components/flashcard-review";
import { ReviewSchedule } from "@/features/flashcards/components/review-schedule";
import { generateFlashcardsForUser } from "@/features/flashcards/actions";
import { flashcards as demoFlashcards } from "@/lib/utils/demo-data";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Flashcard } from "@/types";

function mapCard(c: any, review?: any): Flashcard {
  return {
    id: c.id,
    vocabularyId: c.vocabulary_id,
    userId: c.user_id,
    front: c.front,
    back: c.back,
    mode: c.mode,
    easeFactor: review?.ease_factor ?? 2.5,
    interval: review?.interval ?? 0,
    repetitions: review?.repetitions ?? 0,
    nextReview: review?.next_review ?? c.created_at,
  };
}

async function fetchUserFlashcards(supabase: any, userId: string) {
  const { data: dbCards, error } = await supabase
    .from("flashcards")
    .select(`
      id, vocabulary_id, user_id, front, back, mode, created_at,
      flashcard_reviews (
        ease_factor, interval, repetitions, next_review, last_review
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[Flashcards] Query error:", error.message);
    return [];
  }

  if (!dbCards) return [];

  const now = new Date();
  return dbCards.map((c: any) => {
    const reviews = c.flashcard_reviews || [];
    const latestReview = reviews.length > 0
      ? reviews.sort((a: any, b: any) => new Date(b.next_review).getTime() - new Date(a.next_review).getTime())[0]
      : null;
    return mapCard(c, latestReview);
  });
}

export default async function FlashcardsPage() {
  let dueCards: Flashcard[] = [];
  let allCards: Flashcard[] = [];
  let scheduleCards: { id: string; front: string; nextReview: string }[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // First fetch
      allCards = await fetchUserFlashcards(supabase, user.id);

      // If user has no flashcards, auto-generate from shared vocabularies
      if (allCards.length === 0) {
        console.log(`[Flashcards] No cards for user ${user.id}, auto-generating...`);
        const result = await generateFlashcardsForUser();
        if (result.ok && result.created > 0) {
          console.log(`[Flashcards] Generated ${result.created} cards`);
          // Re-fetch after generation
          allCards = await fetchUserFlashcards(supabase, user.id);
        }
      }

      const now = new Date();

      // Due cards: next_review <= now
      dueCards = allCards.filter((card) => new Date(card.nextReview) <= now);

      // Schedule: all cards for the sidebar
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      scheduleCards = allCards
        .filter((c) => new Date(c.nextReview) <= nextWeek)
        .slice(0, 30)
        .map((c) => ({
          id: c.id,
          front: c.front,
          nextReview: c.nextReview,
        }));
    }
  } else {
    dueCards = demoFlashcards;
    allCards = demoFlashcards;
    scheduleCards = demoFlashcards.map((c) => ({
      id: c.id,
      front: c.front,
      nextReview: c.nextReview,
    }));
  }

  console.log(`[Flashcards] Total: ${allCards.length} | Due: ${dueCards.length} | Schedule: ${scheduleCards.length}`);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Flashcards</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Spaced repetition with SM-2</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 px-3 py-1.5">
            <span className="text-xs font-bold">{allCards.length} total</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 px-3 py-1.5">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{dueCards.length} due</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 px-3 py-1.5">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{allCards.length - dueCards.length} mastered</span>
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr_340px] items-start">
        <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Review session</CardTitle>
            <CardDescription>Use Space to flip, then 1-4 to rate recall quality.</CardDescription>
          </CardHeader>
          <CardContent>
            <FlashcardReview dueCards={dueCards} allCards={allCards} />
          </CardContent>
        </Card>
        <ReviewSchedule cards={scheduleCards} />
      </section>
    </div>
  );
}
