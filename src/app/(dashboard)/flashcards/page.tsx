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
      <section>
        <p className="text-sm text-muted-foreground">Flashcards</p>
        <h1 className="mt-1 text-3xl font-semibold">Spaced repetition with SM-2</h1>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md">
          <CardHeader>
            <CardTitle>Review session</CardTitle>
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
