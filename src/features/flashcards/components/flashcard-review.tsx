"use client";

import * as React from "react";
import { RotateCcw, Volume2, Zap, Target, CheckCircle2, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateNextReview } from "@/features/flashcards/sm2";
import { submitFlashcardReview } from "@/features/flashcards/actions";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Flashcard } from "@/types";

const ratings = [
  { key: "1", label: "Again", quality: 1, color: "bg-red-500 hover:bg-red-600 text-white border-red-600" },
  { key: "2", label: "Hard", quality: 3, color: "bg-orange-500 hover:bg-orange-600 text-white border-orange-600" },
  { key: "3", label: "Good", quality: 4, color: "bg-blue-500 hover:bg-blue-600 text-white border-blue-600" },
  { key: "4", label: "Easy", quality: 5, color: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600" },
];

type StudyMode = "due" | "all";

export function FlashcardReview({ dueCards, allCards }: { dueCards: Flashcard[]; allCards: Flashcard[] }) {
  const [mode, setMode] = React.useState<StudyMode>("due");
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [completed, setCompleted] = React.useState(0);
  const [schedule, setSchedule] = React.useState("");

  const cards = mode === "due" ? dueCards : allCards;
  const hasCards = cards && cards.length > 0;
  const total = hasCards ? cards.length : 0;
  const remaining = Math.max(0, total - completed);
  const card = hasCards && completed < total ? cards[index % total] : null;

  // Reset session on mode change
  React.useEffect(() => {
    setIndex(0);
    setCompleted(0);
    setFlipped(false);
    setSchedule("");
  }, [mode]);

  React.useEffect(() => {
    if (!hasCards || completed >= total) return;

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
  }, [hasCards, index, flipped, cards, completed, total]);

  // Mode selector
  const modeSelector = (
    <div className="flex gap-2 p-1 bg-muted/50 dark:bg-white/5 rounded-lg w-fit">
      <button
        onClick={() => setMode("due")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          mode === "due"
            ? "bg-background dark:bg-white/10 shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        Due ({dueCards.length})
      </button>
      <button
        onClick={() => setMode("all")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          mode === "all"
            ? "bg-background dark:bg-white/10 shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <BookOpen className="h-3.5 w-3.5" />
        All ({allCards.length})
      </button>
    </div>
  );

  if (!hasCards) {
    return (
      <div className="space-y-4">
        {modeSelector}
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <p className="text-xl font-semibold">
            {mode === "due" ? "You're all caught up!" : "No flashcards yet"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            {mode === "due"
              ? "No flashcards are due for review. Try \"All\" mode to study everything."
              : "Add vocabulary from your lessons to create flashcards."}
          </p>
          {mode === "due" && allCards.length > 0 && (
            <Button variant="outline" className="mt-4 gap-2" onClick={() => setMode("all")}>
              <BookOpen className="h-4 w-4" /> Study all {allCards.length} cards
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (completed >= total) {
    return (
      <div className="space-y-4">
        {modeSelector}
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <p className="text-xl font-semibold">Session complete! 🎉</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            You reviewed all {total} cards. Great work!
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => { setCompleted(0); setIndex(0); setFlipped(false); setSchedule(""); }}
            >
              <RotateCcw className="h-4 w-4" /> Review again
            </Button>
            {mode === "due" && allCards.length > dueCards.length && (
              <Button variant="outline" className="gap-2" onClick={() => setMode("all")}>
                <BookOpen className="h-4 w-4" /> Study all ({allCards.length})
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  async function review(quality: 1 | 3 | 4 | 5) {
    if (!card) return;
    const next = calculateNextReview(card.easeFactor, card.interval, card.repetitions, quality);
    setSchedule(`Next in ${next.interval}d · EF ${next.easeFactor.toFixed(2)}`);

    if (hasSupabaseConfig()) {
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + next.interval);
      await submitFlashcardReview(
        card.id,
        quality,
        next.easeFactor,
        next.interval,
        next.repetitions,
        nextReviewDate.toISOString()
      );
    }

    setFlipped(false);
    setCompleted((c) => c + 1);
    setIndex((value) => value + 1);
  }

  function speak() {
    if (!card || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(card.front));
  }

  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      {modeSelector}

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Target className="h-4 w-4 text-amber-500" />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold">{total}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-muted-foreground">Done:</span>
          <span className="font-semibold text-emerald-500">{completed}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="text-muted-foreground">Left:</span>
          <span className="font-semibold">{remaining}</span>
        </div>
        <div className="ml-auto">
          <Badge tone="blue">Card {completed + 1} / {total}</Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-secondary dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flashcard with flip */}
      <div
        className="perspective-[1000px] cursor-pointer"
        onClick={() => setFlipped((value) => !value)}
      >
        <div
          className={`relative w-full min-h-[320px] transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl border-2 dark:border-white/10 dark:bg-[#161616] bg-card shadow-md flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Front</p>
            <p className="text-3xl font-bold leading-tight">{card!.front}</p>
            <p className="mt-6 text-sm text-muted-foreground">Tap or press Space to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl border-2 border-primary/30 dark:bg-[#1a1a2e] bg-primary/5 shadow-md flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-primary mb-4">Back</p>
            <p className="text-3xl font-bold leading-tight text-primary">{card!.back}</p>
            {schedule && (
              <p className="mt-6 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1">{schedule}</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Pronounce" onClick={speak} className="dark:border-white/10">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Reset card" onClick={() => setFlipped(false)} className="dark:border-white/10">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ratings.map((rating) => (
            <Button
              key={rating.key}
              className={`${rating.color} border font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95`}
              onClick={() => review(rating.quality as 1 | 3 | 4 | 5)}
            >
              {rating.key} {rating.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
