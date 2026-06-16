import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardReview } from "@/features/flashcards/components/flashcard-review";
import { ReviewSchedule } from "@/features/flashcards/components/review-schedule";

export default function FlashcardsPage() {
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
            <FlashcardReview />
          </CardContent>
        </Card>
        <ReviewSchedule />
      </section>
    </div>
  );
}
