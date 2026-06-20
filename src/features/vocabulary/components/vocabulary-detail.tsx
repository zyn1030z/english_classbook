"use client";

import * as React from "react";
import { BookOpen, Volume2, X, Tag, GraduationCap, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { playPronunciation } from "@/lib/utils/speech";
import type { Difficulty, Vocabulary } from "@/types";

const difficultyTone: Record<Difficulty, "green" | "amber" | "red"> = {
 easy: "green",
 medium: "amber",
 hard: "red"
};

export function VocabularyDetail({
 vocab,
 open,
 onClose,
}: {
 vocab: Vocabulary | null;
 open: boolean;
 onClose: () => void;
}) {
 React.useEffect(() => {
 if (!open) return;
 function onKeyDown(e: KeyboardEvent) {
 if (e.key === "Escape") onClose();
 }
 window.addEventListener("keydown", onKeyDown);
 return () => window.removeEventListener("keydown", onKeyDown);
 }, [open, onClose]);

 if (!open || !vocab) return null;

 function speak(text: string) {
 playPronunciation(text);
 }

 return (
 <>
 {/* Backdrop */}
 <div
 className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
 onClick={onClose}
 />

 {/* Panel */}
 <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-background border-l shadow-2xl animate-in slide-in-from-right-full duration-300 flex flex-col">
 {/* Header */}
 <div className="flex items-start justify-between gap-3 p-6 pb-4 border-b">
 <div className="min-w-0">
 <div className="flex items-center gap-3">
 <h2 className="text-2xl font-bold tracking-tight truncate">{vocab.word}</h2>
 <Button
 variant="ghost"
 size="icon"
 className="shrink-0 h-8 w-8 rounded-full hover:bg-primary/10 text-primary"
 onClick={() => speak(vocab.word)}
 aria-label="Pronounce word"
 >
 <Volume2 className="h-4 w-4" />
 </Button>
 </div>
 {vocab.ipa && (
 <p className="mt-1 font-mono text-sm text-muted-foreground">{vocab.ipa}</p>
 )}
 </div>
 <Button
 variant="ghost"
 size="icon"
 className="shrink-0 h-8 w-8 rounded-full"
 onClick={onClose}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6">
 {/* Meaning */}
 <div className="space-y-2">
 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meaning</h3>
 <p className="text-lg font-semibold text-primary">{vocab.meaning}</p>
 </div>

 {/* Meta pills */}
 <div className="flex flex-wrap gap-2">
 {vocab.partOfSpeech && (
 <Badge variant="outline" className="gap-1.5 rounded-lg px-2.5 py-1">
 <Tag className="h-3 w-3" />
 {vocab.partOfSpeech}
 </Badge>
 )}
 {vocab.category && (
 <Badge variant="outline" className="gap-1.5 rounded-lg px-2.5 py-1">
 <BookOpen className="h-3 w-3" />
 {vocab.category}
 </Badge>
 )}
 <Badge tone={difficultyTone[vocab.difficulty]} className="gap-1.5 rounded-lg px-2.5 py-1">
 <GraduationCap className="h-3 w-3" />
 {vocab.difficulty}
 </Badge>
 {vocab.lesson?.title && (
 <Badge variant="outline" className="gap-1.5 rounded-lg px-2.5 py-1 border-dashed">
 {vocab.lesson.title}
 </Badge>
 )}
 </div>

 {/* Examples */}
 {vocab.examples.length > 0 && (
 <div className="space-y-3">
 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
 <MessageSquare className="h-3.5 w-3.5" />
 Example sentences
 </h3>
 <div className="space-y-3">
 {vocab.examples.map((ex, i) => (
 <div
 key={ex.id || i}
 className="rounded-xl border dark:border-white/5 bg-muted/20 dark:bg-white/[0.02] p-4 space-y-2"
 >
 <div className="flex items-start justify-between gap-2">
 <p className="text-sm font-medium leading-relaxed">{ex.sentence}</p>
 <Button
 variant="ghost"
 size="icon"
 className="shrink-0 h-7 w-7 rounded-full hover:bg-primary/10 text-primary"
 onClick={() => speak(ex.sentence)}
 aria-label="Pronounce sentence"
 >
 <Volume2 className="h-3.5 w-3.5" />
 </Button>
 </div>
 {ex.translation && (
 <p className="text-xs text-muted-foreground italic">{ex.translation}</p>
 )}
 {ex.difficulty && (
 <Badge tone={difficultyTone[ex.difficulty]} className="text-[10px]">
 {ex.difficulty}
 </Badge>
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Status */}
 <div className="space-y-2">
 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</h3>
 <div className="flex gap-2">
 <Badge tone={vocab.isLearned ? "green" : "neutral"} className="rounded-lg px-2.5 py-1">
 {vocab.isLearned ? "✓ Learned" : "Not learned"}
 </Badge>
 <Badge tone={vocab.isFavorite ? "amber" : "neutral"} className="rounded-lg px-2.5 py-1">
 {vocab.isFavorite ? "★ Favorite" : "Not favorite"}
 </Badge>
 </div>
 </div>
 </div>
 </div>
 </>
 );
}
