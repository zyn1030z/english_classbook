"use client";

import { Trophy, Flame, BookOpen, Target, Zap, Star, Crown, GraduationCap, Sparkles, Medal } from "lucide-react";

interface AchievementStats {
 vocabCount: number;
 lessonCount: number;
 quizCount: number;
 bestQuizScore: number;
 flashcardMastered: number;
 totalReviews: number;
 streakCount: number;
}

interface Badge {
 id: string;
 title: string;
 description: string;
 icon: React.ElementType;
 color: string;
 bgColor: string;
 glowColor: string;
 condition: (stats: AchievementStats) => boolean;
 progress: (stats: AchievementStats) => { current: number; target: number };
}

const BADGES: Badge[] = [
 {
 id: "first_word",
 title: "First Steps",
 description: "Add your first vocabulary word",
 icon: BookOpen,
 color: "text-emerald-500",
 bgColor: "bg-emerald-500/10",
 glowColor: "shadow-emerald-500/20",
 condition: (s) => s.vocabCount >= 1,
 progress: (s) => ({ current: Math.min(s.vocabCount, 1), target: 1 }),
 },
 {
 id: "word_collector",
 title: "Word Collector",
 description: "Learn 50 vocabulary words",
 icon: Sparkles,
 color: "text-blue-500",
 bgColor: "bg-blue-500/10",
 glowColor: "shadow-blue-500/20",
 condition: (s) => s.vocabCount >= 50,
 progress: (s) => ({ current: Math.min(s.vocabCount, 50), target: 50 }),
 },
 {
 id: "word_master",
 title: "Word Master",
 description: "Learn 100 vocabulary words",
 icon: Crown,
 color: "text-amber-500",
 bgColor: "bg-amber-500/10",
 glowColor: "shadow-amber-500/20",
 condition: (s) => s.vocabCount >= 100,
 progress: (s) => ({ current: Math.min(s.vocabCount, 100), target: 100 }),
 },
 {
 id: "first_quiz",
 title: "Quiz Starter",
 description: "Complete your first quiz",
 icon: Target,
 color: "text-teal-500",
 bgColor: "bg-teal-500/10",
 glowColor: "shadow-teal-500/20",
 condition: (s) => s.quizCount >= 1,
 progress: (s) => ({ current: Math.min(s.quizCount, 1), target: 1 }),
 },
 {
 id: "quiz_warrior",
 title: "Quiz Warrior",
 description: "Complete 10 quizzes",
 icon: Medal,
 color: "text-orange-500",
 bgColor: "bg-orange-500/10",
 glowColor: "shadow-orange-500/20",
 condition: (s) => s.quizCount >= 10,
 progress: (s) => ({ current: Math.min(s.quizCount, 10), target: 10 }),
 },
 {
 id: "perfect_score",
 title: "Perfect Score",
 description: "Score 100% on a quiz",
 icon: Star,
 color: "text-yellow-500",
 bgColor: "bg-yellow-500/10",
 glowColor: "shadow-yellow-500/20",
 condition: (s) => s.bestQuizScore >= 100,
 progress: (s) => ({ current: Math.min(s.bestQuizScore, 100), target: 100 }),
 },
 {
 id: "streak_3",
 title: "On Fire",
 description: "Maintain a 3-day streak",
 icon: Flame,
 color: "text-red-500",
 bgColor: "bg-red-500/10",
 glowColor: "shadow-red-500/20",
 condition: (s) => s.streakCount >= 3,
 progress: (s) => ({ current: Math.min(s.streakCount, 3), target: 3 }),
 },
 {
 id: "streak_7",
 title: "Week Warrior",
 description: "Maintain a 7-day streak",
 icon: Flame,
 color: "text-orange-600",
 bgColor: "bg-orange-600/10",
 glowColor: "shadow-orange-600/20",
 condition: (s) => s.streakCount >= 7,
 progress: (s) => ({ current: Math.min(s.streakCount, 7), target: 7 }),
 },
 {
 id: "streak_30",
 title: "Unstoppable",
 description: "Maintain a 30-day streak",
 icon: Zap,
 color: "text-indigo-500",
 bgColor: "bg-indigo-500/10",
 glowColor: "shadow-indigo-500/20",
 condition: (s) => s.streakCount >= 30,
 progress: (s) => ({ current: Math.min(s.streakCount, 30), target: 30 }),
 },
 {
 id: "lesson_5",
 title: "Studious",
 description: "Create 5 lessons",
 icon: GraduationCap,
 color: "text-cyan-500",
 bgColor: "bg-cyan-500/10",
 glowColor: "shadow-cyan-500/20",
 condition: (s) => s.lessonCount >= 5,
 progress: (s) => ({ current: Math.min(s.lessonCount, 5), target: 5 }),
 },
 {
 id: "flashcard_master",
 title: "Memory Champion",
 description: "Master 20 flashcards (21+ day interval)",
 icon: Trophy,
 color: "text-amber-600",
 bgColor: "bg-amber-600/10",
 glowColor: "shadow-amber-600/20",
 condition: (s) => s.flashcardMastered >= 20,
 progress: (s) => ({ current: Math.min(s.flashcardMastered, 20), target: 20 }),
 },
 {
 id: "reviewer",
 title: "Dedicated Reviewer",
 description: "Complete 100 flashcard reviews",
 icon: Sparkles,
 color: "text-fuchsia-500",
 bgColor: "bg-fuchsia-500/10",
 glowColor: "shadow-fuchsia-500/20",
 condition: (s) => s.totalReviews >= 100,
 progress: (s) => ({ current: Math.min(s.totalReviews, 100), target: 100 }),
 },
];

export function AchievementGallery({ stats }: { stats: AchievementStats }) {
 const unlocked = BADGES.filter((b) => b.condition(stats));
 const locked = BADGES.filter((b) => !b.condition(stats));

 return (
 <div className="space-y-5">
 {/* Summary */}
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
 <Trophy className="h-5 w-5" />
 </div>
 <div>
 <p className="text-sm font-bold">{unlocked.length} / {BADGES.length} Achievements</p>
 <p className="text-xs text-muted-foreground">{locked.length > 0 ? `${locked.length} more to unlock` : "All achievements unlocked! 🎉"}</p>
 </div>
 </div>

 {/* Progress bar */}
 <div className="h-2 w-full rounded-full bg-secondary/60 dark:bg-white/[0.04] overflow-hidden ring-1 ring-inset ring-black/5 dark:ring-white/5">
 <div
 className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-700"
 style={{ width: `${(unlocked.length / BADGES.length) * 100}%` }}
 />
 </div>

 {/* Unlocked badges */}
 {unlocked.length > 0 && (
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Unlocked</p>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
 {unlocked.map((badge) => (
 <BadgeCard key={badge.id} badge={badge} stats={stats} unlocked />
 ))}
 </div>
 </div>
 )}

 {/* Locked badges */}
 {locked.length > 0 && (
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Locked</p>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
 {locked.map((badge) => (
 <BadgeCard key={badge.id} badge={badge} stats={stats} unlocked={false} />
 ))}
 </div>
 </div>
 )}
 </div>
 );
}

function BadgeCard({ badge, stats, unlocked }: { badge: Badge; stats: AchievementStats; unlocked: boolean }) {
 const Icon = badge.icon;
 const { current, target } = badge.progress(stats);
 const pct = Math.round((current / target) * 100);

 return (
 <div
 className={`relative rounded-xl border p-4 transition-all duration-300 ${
 unlocked
 ? `border-border/60 bg-card shadow-lg ${badge.glowColor} hover:scale-[1.02]`
 : "border-dashed border-border/40 dark:border-white/5 bg-muted/20 dark:bg-white/[0.01] opacity-60"
 }`}
 >
 {/* Icon */}
 <div className={`h-10 w-10 rounded-xl ${unlocked ? badge.bgColor : "bg-muted/50 dark:bg-white/5"} flex items-center justify-center mb-3`}>
 <Icon className={`h-5 w-5 ${unlocked ? badge.color : "text-muted-foreground/50"}`} />
 </div>

 {/* Title */}
 <p className={`text-sm font-bold truncate ${unlocked ? "" : "text-muted-foreground"}`}>{badge.title}</p>
 <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{badge.description}</p>

 {/* Progress */}
 {!unlocked && (
 <div className="mt-3 space-y-1.5">
 <div className="h-1.5 w-full rounded-full bg-secondary/60 dark:bg-white/5 overflow-hidden">
 <div
 className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
 style={{ width: `${pct}%` }}
 />
 </div>
 <p className="text-[10px] text-muted-foreground font-medium">{current} / {target}</p>
 </div>
 )}

 {/* Checkmark for unlocked */}
 {unlocked && (
 <div className="absolute top-3 right-3">
 <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
 <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
 </div>
 </div>
 )}
 </div>
 );
}
