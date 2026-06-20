"use client";

import * as React from "react";
import { RotateCcw, Volume2, Zap, Target, CheckCircle2, BookOpen, Clock, ArrowRight, Layers, Sparkles, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateNextReview } from "@/features/flashcards/sm2";
import { submitFlashcardReview } from "@/features/flashcards/actions";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { playPronunciation } from "@/lib/utils/speech";
import type { Flashcard } from "@/types";

const ratings = [
  { key: "1", label: "Again", quality: 1, className: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-500/20", icon: "🔁" },
  { key: "2", label: "Hard", quality: 3, className: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-500/20", icon: "💪" },
  { key: "3", label: "Good", quality: 4, className: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-500/20", icon: "👍" },
  { key: "4", label: "Easy", quality: 5, className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-500/20", icon: "⚡" },
];

type StudyMode = "due" | "all";

export function FlashcardReview({ dueCards, allCards }: { dueCards: Flashcard[]; allCards: Flashcard[] }) {
  const [mode, setMode] = React.useState<StudyMode>("due");
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [completed, setCompleted] = React.useState(0);
  const [schedule, setSchedule] = React.useState("");
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [lessonFilter, setLessonFilter] = React.useState<string>("all");

  // Extract unique lessons from all cards, sorted by created_at
  const availableLessons = React.useMemo(() => {
    const map = new Map<string, { title: string; createdAt: string }>();
    allCards.forEach((c) => {
      if (c.lessonId && c.lessonTitle && !map.has(c.lessonId)) {
        map.set(c.lessonId, { title: c.lessonTitle, createdAt: c.lessonCreatedAt || "9999" });
      }
    });
    return Array.from(map.entries())
      .map(([id, { title, createdAt }]) => ({ id, title, createdAt }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [allCards]);

  // Filter by lesson first, then by mode
  const filteredDue = lessonFilter === "all" ? dueCards : dueCards.filter(c => c.lessonId === lessonFilter);
  const filteredAll = lessonFilter === "all" ? allCards : allCards.filter(c => c.lessonId === lessonFilter);
  const cards = mode === "due" ? filteredDue : filteredAll;
  const hasCards = cards && cards.length > 0;
  const total = hasCards ? cards.length : 0;
  const remaining = Math.max(0, total - completed);
  const card = hasCards && completed < total ? cards[index % total] : null;

  React.useEffect(() => {
    setIndex(0);
    setCompleted(0);
    setFlipped(false);
    setSchedule("");
  }, [mode, lessonFilter]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCards, index, flipped, cards, completed, total]);

  const modeSelector = (
    <div className="flex flex-wrap items-center gap-2">
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
          Due ({filteredDue.length})
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
          All ({filteredAll.length})
        </button>
      </div>
      {availableLessons.length > 1 && (
        <select
          value={lessonFilter}
          onChange={(e) => setLessonFilter(e.target.value)}
          className="h-9 px-3 rounded-xl border border-border/60 bg-muted/30 dark:bg-white/5 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '28px' }}
        >
          <option value="all">All lessons</option>
          {availableLessons.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      )}
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

  function review(quality: 1 | 3 | 4 | 5) {
    if (!card || isAnimating) return;
    setIsAnimating(true);
    const next = calculateNextReview(card.easeFactor, card.interval, card.repetitions, quality);
    setSchedule(`Next in ${next.interval}d · EF ${next.easeFactor.toFixed(2)}`);

    // Fire-and-forget: don't block UI for API call
    if (hasSupabaseConfig()) {
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + next.interval);
      submitFlashcardReview(
        card.id,
        quality,
        next.easeFactor,
        next.interval,
        next.repetitions,
        nextReviewDate.toISOString()
      ).catch(console.error);
    }

    // Transition to next card immediately
    setTimeout(() => {
      setFlipped(false);
      setCompleted((c) => c + 1);
      setIndex((value) => value + 1);
      setIsAnimating(false);
    }, 150);
  }

  function skipCard() {
    if (!card || isAnimating) return;
    setIsAnimating(true);
    
    // Just move to the next card without recording a review
    setTimeout(() => {
      setFlipped(false);
      setCompleted((c) => c + 1);
      setIndex((value) => value + 1);
      setIsAnimating(false);
    }, 150);
  }

  function speak() {
    if (!card) return;
    playPronunciation(card.front);
  }

  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Header: mode toggle + counter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {modeSelector}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1 rounded-lg border-primary/30 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            {completed + 1} / {total}
          </Badge>
        </div>
      </div>

      {/* Progress bar with stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {completed} done</span>
            <span className="flex items-center gap-1"><Target className="h-3 w-3 text-amber-500" /> {remaining} left</span>
          </div>
          <span className="font-bold text-foreground">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-3.5 w-full rounded-full bg-secondary/60 dark:bg-white/[0.04] overflow-hidden ring-1 ring-inset ring-black/5 dark:ring-white/5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Flashcard — 3D Flip with Glassmorphism */}
      <div
        className="cursor-pointer group"
        style={{ perspective: "1200px" }}
        onClick={() => setFlipped((v) => !v)}
      >
        <div
          className="relative w-full min-h-[320px] transition-transform duration-500 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ─── FRONT FACE ─── */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-10 text-center overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Glassmorphism background */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/[0.06] dark:to-white/[0.02] backdrop-blur-sm border border-white/30 shadow-2xl shadow-black/5 dark:shadow-black/30" />

            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl" />

            {/* Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/60 dark:text-blue-400/50 bg-blue-500/10 dark:bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
                  Front side
                </span>
              </div>
              <p className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight text-foreground drop-shadow-md transition-all">
                {card!.front}
              </p>
              <div className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground/50">
                <span>Tap or press</span>
                <kbd className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 border border-black/10 text-[10px] font-mono font-bold text-foreground/70">
                  Space
                </kbd>
                <span>to flip</span>
              </div>
            </div>
          </div>

          {/* ─── BACK FACE ─── */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-10 text-center overflow-hidden"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {/* Glassmorphism background — different hue */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-blue-50/40 dark:from-emerald-500/[0.06] dark:to-blue-500/[0.03] backdrop-blur-sm border border-emerald-500/20 dark:border-emerald-500/10 shadow-2xl shadow-emerald-500/5 dark:shadow-black/30" />

            {/* Ambient glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl" />

            {/* Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/60 dark:text-emerald-400/50 bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                  Back side
                </span>
              </div>
              <p className="text-3xl sm:text-5xl font-extrabold leading-relaxed tracking-tight text-emerald-700 dark:text-emerald-300 whitespace-pre-line drop-shadow-sm transition-all">
                {card!.back}
              </p>
              {schedule && (
                <p className="mt-6 text-[11px] text-muted-foreground bg-black/5 dark:bg-white/5 rounded-full px-4 py-1.5 font-medium inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {schedule}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Audio + Reset | Rating buttons */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon"
            aria-label="Pronounce"
            onClick={(e) => { e.stopPropagation(); speak(); }}
            className="rounded-xl h-11 w-11 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Reset card"
            onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            className="rounded-xl h-11 w-11 hover:bg-muted/50 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        {flipped ? (
          <div className="flex-1 grid grid-cols-4 gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
            {ratings.map((r) => (
              <Button
                key={r.key}
                className={`${r.className} rounded-xl font-bold transition-all duration-200 hover:shadow-md active:scale-95 h-11 cursor-pointer`}
                onClick={() => review(r.quality as 1 | 3 | 4 | 5)}
                disabled={isAnimating}
              >
                <kbd className="hidden sm:inline mr-1.5 text-[10px] font-mono opacity-60 border border-current/20 px-1.5 py-0.5 rounded text-current">{r.key}</kbd>
                {r.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex gap-2 animate-in fade-in duration-300">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl font-bold shadow-sm text-sm cursor-pointer hover:bg-muted/50 transition-all text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); skipCard(); }}
            >
              Skip
            </Button>
            <Button
              className="flex-[3] h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm text-base cursor-pointer tracking-wide transition-all"
              onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
            >
              Show Answer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
