"use client";

import * as React from "react";
import { RotateCcw, Volume2, Zap, Target, CheckCircle2, BookOpen, Clock, ArrowRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateNextReview } from "@/features/flashcards/sm2";
import { submitFlashcardReview } from "@/features/flashcards/actions";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Flashcard } from "@/types";

const ratings = [
  { key: "1", label: "Again", quality: 1, className: "bg-red-500/90 hover:bg-red-500 text-white shadow-red-500/20" },
  { key: "2", label: "Hard", quality: 3, className: "bg-orange-500/90 hover:bg-orange-500 text-white shadow-orange-500/20" },
  { key: "3", label: "Good", quality: 4, className: "bg-blue-500/90 hover:bg-blue-500 text-white shadow-blue-500/20" },
  { key: "4", label: "Easy", quality: 5, className: "bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-emerald-500/20" },
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
      if (rating) review(rating.quality as 1 | 3 | 4 | 5);
      if (event.key === " ") {
        event.preventDefault();
        setFlipped((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasCards, index, flipped, cards, completed, total]);

  const modeSelector = (
    <div className="flex gap-1 p-1 bg-muted/40 dark:bg-white/5 rounded-xl w-fit">
      <button
        onClick={() => setMode("due")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          mode === "due"
            ? "bg-background dark:bg-white/10 shadow-sm text-foreground ring-1 ring-border/50"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        Due ({dueCards.length})
      </button>
      <button
        onClick={() => setMode("all")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          mode === "all"
            ? "bg-background dark:bg-white/10 shadow-sm text-foreground ring-1 ring-border/50"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
        All ({allCards.length})
      </button>
    </div>
  );

  // Empty state
  if (!hasCards) {
    return (
      <div className="space-y-5">
        {modeSelector}
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-5 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
          </div>
          <p className="text-xl font-bold tracking-tight">
            {mode === "due" ? "You're all caught up!" : "No flashcards yet"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            {mode === "due"
              ? 'No flashcards are due for review. Try "All" mode to study everything.'
              : "Add vocabulary from your lessons to create flashcards."}
          </p>
          {mode === "due" && allCards.length > 0 && (
            <Button variant="outline" className="mt-5 gap-2 rounded-xl" onClick={() => setMode("all")}>
              <BookOpen className="h-4 w-4" /> Study all {allCards.length} cards
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Session complete
  if (completed >= total) {
    return (
      <div className="space-y-5">
        {modeSelector}
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 ring-1 ring-primary/20">
            <Zap className="h-9 w-9 text-primary" />
          </div>
          <p className="text-xl font-bold tracking-tight">Session complete!</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            You reviewed all {total} cards. Great work!
          </p>
          <div className="flex gap-3 mt-5">
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => { setCompleted(0); setIndex(0); setFlipped(false); setSchedule(""); }}
            >
              <RotateCcw className="h-4 w-4" /> Review again
            </Button>
            {mode === "due" && allCards.length > dueCards.length && (
              <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setMode("all")}>
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
    <div className="space-y-5">
      {/* Header: mode toggle + counter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {modeSelector}
        <Badge variant="outline" className="text-xs font-semibold px-3 py-1 rounded-lg">
          {completed + 1} / {total}
        </Badge>
      </div>

      {/* Progress bar with stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {completed} done</span>
            <span className="flex items-center gap-1"><Target className="h-3 w-3 text-amber-500" /> {remaining} left</span>
          </div>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary/60 dark:bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-emerald-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(var(--primary),0.3)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="perspective-[1200px] cursor-pointer group"
        onClick={() => setFlipped((v) => !v)}
      >
        <div
          className={`relative w-full min-h-[300px] transition-transform duration-600 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl border dark:border-white/10 bg-gradient-to-br from-card to-muted/30 dark:from-[#161616] dark:to-[#1a1a1a] shadow-lg flex flex-col items-center justify-center p-10 text-center">
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 bg-muted/50 dark:bg-white/5 px-2.5 py-1 rounded-md">Front</span>
            </div>
            <p className="text-3xl font-bold leading-tight tracking-tight">{card!.front}</p>
            <div className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span>Tap or press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted/80 dark:bg-white/10 border border-border/50 text-[10px] font-mono font-bold">Space</kbd>
              <span>to flip</span>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-[#1a1a2e] dark:to-[#161625] shadow-lg flex flex-col items-center justify-center p-10 text-center">
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 bg-primary/10 px-2.5 py-1 rounded-md">Back</span>
            </div>
            <p className="text-3xl font-bold leading-tight tracking-tight text-primary">{card!.back}</p>
            {schedule && (
              <p className="mt-6 text-[11px] text-muted-foreground bg-muted/30 dark:bg-white/5 rounded-lg px-3 py-1.5 font-medium">{schedule}</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <Button variant="outline" size="icon" aria-label="Pronounce" onClick={speak} className="rounded-xl dark:border-white/10 h-10 w-10">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Reset card" onClick={() => setFlipped(false)} className="rounded-xl dark:border-white/10 h-10 w-10">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 grid grid-cols-4 gap-2">
          {ratings.map((r) => (
            <Button
              key={r.key}
              className={`${r.className} rounded-xl font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 h-10`}
              onClick={() => review(r.quality as 1 | 3 | 4 | 5)}
            >
              <span className="hidden sm:inline mr-1 opacity-60 font-mono text-xs">{r.key}</span>
              {r.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
