import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardReview } from "@/features/flashcards/components/flashcard-review";
import { ReviewSchedule } from "@/features/flashcards/components/review-schedule";
import { flashcards as demoFlashcards } from "@/lib/utils/demo-data";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Flashcard } from "@/types";

export default async function FlashcardsPage() {
  let activeCards: Flashcard[] = demoFlashcards;

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: dbCards } = await supabase
        .from("flashcards")
        .select("id, vocabulary_id, user_id, front, back, mode, ease_factor, interval, repetitions, next_review")
        .eq("user_id", user.id)
        .lte("next_review", new Date().toISOString())
        .order("next_review", { ascending: true });

      if (dbCards) {
        activeCards = dbCards.map((c: any) => ({
          id: c.id,
          vocabularyId: c.vocabulary_id,
          userId: c.user_id,
          front: c.front,
          back: c.back,
          mode: c.mode,
          easeFactor: c.ease_factor,
          interval: c.interval,
          repetitions: c.repetitions,
          nextReview: c.next_review
        }));
      }
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Flashcards</p>
        <h1 className="mt-1 text-3xl font-semibold">Spaced repetition with SM-2</h1>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Review session</CardTitle>
            <CardDescription>Use Space to flip, then 1-4 to rate recall quality.</CardDescription>
          </CardHeader>
          <CardContent>
            <FlashcardReview initialCards={activeCards} />
          </CardContent>
        </Card>
        <ReviewSchedule />
      </section>
    </div>
  );
}
