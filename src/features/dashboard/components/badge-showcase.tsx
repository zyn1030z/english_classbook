"use client";

import Link from "next/link";
import { Trophy, Flame, BookOpen, Target, Zap, Star, Crown, GraduationCap, Sparkles, Medal, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BadgeShowcaseProps {
 stats: {
 vocabCount: number;
 lessonCount: number;
 quizCount: number;
 bestQuizScore: number;
 flashcardMastered: number;
 totalReviews: number;
 streakCount: number;
 };
}

interface BadgeDef {
 id: string;
 title: string;
 icon: React.ElementType;
 color: string;
 bgColor: string;
 ringColor: string;
 condition: (s: BadgeShowcaseProps["stats"]) => boolean;
}

const BADGES: BadgeDef[] = [
 { id: "first_word", title: "First Steps", icon: BookOpen, color: "text-emerald-500", bgColor: "bg-emerald-500/10", ringColor: "ring-emerald-500/20", condition: (s) => s.vocabCount >= 1 },
 { id: "word_collector", title: "Word Collector", icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-500/10", ringColor: "ring-blue-500/20", condition: (s) => s.vocabCount >= 50 },
 { id: "word_master", title: "Word Master", icon: Crown, color: "text-amber-500", bgColor: "bg-amber-500/10", ringColor: "ring-amber-500/20", condition: (s) => s.vocabCount >= 100 },
 { id: "first_quiz", title: "Quiz Starter", icon: Target, color: "text-teal-500", bgColor: "bg-teal-500/10", ringColor: "ring-teal-500/20", condition: (s) => s.quizCount >= 1 },
 { id: "quiz_warrior", title: "Quiz Warrior", icon: Medal, color: "text-orange-500", bgColor: "bg-orange-500/10", ringColor: "ring-orange-500/20", condition: (s) => s.quizCount >= 10 },
 { id: "perfect_score", title: "Perfect Score", icon: Star, color: "text-yellow-500", bgColor: "bg-yellow-500/10", ringColor: "ring-yellow-500/20", condition: (s) => s.bestQuizScore >= 100 },
 { id: "streak_3", title: "On Fire", icon: Flame, color: "text-red-500", bgColor: "bg-red-500/10", ringColor: "ring-red-500/20", condition: (s) => s.streakCount >= 3 },
 { id: "streak_7", title: "Week Warrior", icon: Flame, color: "text-orange-600", bgColor: "bg-orange-600/10", ringColor: "ring-orange-600/20", condition: (s) => s.streakCount >= 7 },
 { id: "streak_30", title: "Unstoppable", icon: Zap, color: "text-indigo-500", bgColor: "bg-indigo-500/10", ringColor: "ring-indigo-500/20", condition: (s) => s.streakCount >= 30 },
 { id: "lesson_5", title: "Studious", icon: GraduationCap, color: "text-cyan-500", bgColor: "bg-cyan-500/10", ringColor: "ring-cyan-500/20", condition: (s) => s.lessonCount >= 5 },
 { id: "flashcard_master", title: "Memory Champ", icon: Trophy, color: "text-amber-600", bgColor: "bg-amber-600/10", ringColor: "ring-amber-600/20", condition: (s) => s.flashcardMastered >= 20 },
 { id: "reviewer", title: "Dedicated", icon: Sparkles, color: "text-fuchsia-500", bgColor: "bg-fuchsia-500/10", ringColor: "ring-fuchsia-500/20", condition: (s) => s.totalReviews >= 100 },
];

const MAX_VISIBLE = 8;

export function BadgeShowcase({ stats }: BadgeShowcaseProps) {
 const unlocked = BADGES.filter((b) => b.condition(stats));
 const total = BADGES.length;
 const visible = unlocked.slice(0, MAX_VISIBLE);
 const remaining = unlocked.length - visible.length;

 return (
 <Card>
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <Trophy className="h-5 w-5 text-muted-foreground" />
 <div>
 <CardTitle className="text-sm font-bold">Achievements</CardTitle>
 <p className="text-[11px] text-muted-foreground font-medium">{unlocked.length} / {total} unlocked</p>
 </div>
 </div>
 <Link
 href="/profile"
 className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
 >
 View all <ArrowRight className="h-3 w-3" />
 </Link>
 </div>
 {/* Progress bar */}
 <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden mt-2">
 <div
 className="h-full rounded-full bg-primary transition-all duration-700"
 style={{ width: `${(unlocked.length / total) * 100}%` }}
 />
 </div>
 </CardHeader>
 <CardContent>
 {unlocked.length === 0 ? (
 <div className="text-center py-4">
 <p className="text-xs text-muted-foreground">No badges yet. Start learning to unlock!</p>
 </div>
 ) : (
 <div className="grid grid-cols-4 gap-2">
 {visible.map((badge) => {
 const Icon = badge.icon;
 return (
 <div
 key={badge.id}
 className="group flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-muted/50 transition-colors cursor-default"
 title={badge.title}
 >
 <div className={`h-9 w-9 rounded-xl ${badge.bgColor} ring-1 ${badge.ringColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
 <Icon className={`h-4.5 w-4.5 ${badge.color}`} />
 </div>
 <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-[72px] text-center leading-tight">
 {badge.title}
 </span>
 </div>
 );
 })}
 {remaining > 0 && (
 <Link
 href="/profile"
 className="flex flex-col items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
 >
 <div className="h-9 w-9 rounded-xl bg-muted/50 ring-1 ring-border flex items-center justify-center">
 <span className="text-xs font-bold text-muted-foreground">+{remaining}</span>
 </div>
 <span className="text-[10px] font-semibold text-muted-foreground">More</span>
 </Link>
 )}
 </div>
 )}
 </CardContent>
 </Card>
 );
}
