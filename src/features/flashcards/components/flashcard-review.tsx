"use client";

import * as React from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateNextReview } from "@/features/flashcards/sm2";
import { flashcards } from "@/lib/utils/demo-data";

const ratings = [
  { key: "1", label: "Again", quality: 1, variant: "destructive" as const },
  { key: "2", label: "Hard", quality: 3, variant: "outline" as const },
  { key: "3", label: "Good", quality: 4, variant: "secondary" as const },
  { key: "4", label: "Easy", quality: 5, variant: "default" as const }
];

export function FlashcardReview() {
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [schedule, setSchedule] = React.useState<string>("Choose a review rating to schedule the next review.");
  const card = flashcards[index % flashcards.length];

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const rating = ratings.find((item) => item.key === event.key);
      if (rating) {
        review(rating.quality as 1 | 3 | 4 | 5);
      }
      if (event.key === " ") {
        event.preventDefault();
        setFlipped((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function review(quality: 1 | 3 | 4 | 5) {
    const next = calculateNextReview(card.easeFactor, card.interval, card.repetitions, quality);
    setSchedule(`Next review in ${next.interval} day${next.interval === 1 ? "" : "s"} with EF ${next.easeFactor}.`);
    setFlipped(false);
    setIndex((value) => value + 1);
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(card.front));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="blue">Card {(index % flashcards.length) + 1} / {flashcards.length}</Badge>
          <Badge>{card.mode}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{schedule}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="block h-auto w-full rounded-xl p-0 text-left font-normal hover:bg-transparent whitespace-normal"
        onClick={() => setFlipped((value) => !value)}
      >
        <Card className="min-h-[320px] border-2">
          <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
            <p className="text-sm uppercase text-muted-foreground">{flipped ? "Back" : "Front"}</p>
            <p className="mt-5 whitespace-pre-line text-3xl font-semibold leading-tight">{flipped ? card.back : card.front}</p>
            {!flipped ? <p className="mt-4 text-sm text-muted-foreground">Tap card or press Space to reveal</p> : null}
          </CardContent>
        </Card>
      </Button>
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Pronounce" onClick={speak}>
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Reset card" onClick={() => setFlipped(false)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ratings.map((rating) => (
            <Button key={rating.key} variant={rating.variant} onClick={() => review(rating.quality as 1 | 3 | 4 | 5)}>
              {rating.key} {rating.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
