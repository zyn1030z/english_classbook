"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { CalendarDays, FileText, MoreVertical, Trash2, Edit2, Loader2, Rocket, Wand2, Sparkles, Brain, BookOpen, Lightbulb, ArrowRight, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteLesson, generateLessonQuiz, updateLessonStatus } from "@/features/lessons/actions";
import { cn } from "@/lib/utils/cn";
import type { Lesson } from "@/types";
import { EditLessonSheet } from "./edit-lesson-sheet";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function LessonCard({ lesson, isAdmin = false, viewMode = "grid" }: { lesson: Lesson; isAdmin?: boolean; viewMode?: "grid" | "list" }) {
 const [isDeleting, startDelete] = useTransition();
 const [isGenerating, startGenerate] = useTransition();
 const [isPublishing, startPublish] = useTransition();
 const [showDeleteAlert, setShowDeleteAlert] = useState(false);
 const [isEditOpen, setIsEditOpen] = useState(false);
 const router = useRouter();

 const handleDelete = () => {
 startDelete(async () => {
 await deleteLesson(lesson.id);
 setShowDeleteAlert(false);
 });
 };

 const handlePublish = () => {
 startPublish(async () => {
 await updateLessonStatus(lesson.id, "published");
 });
 };

 const handleGenerateQuiz = () => {
 startGenerate(async () => {
 const res = await generateLessonQuiz(lesson.id);
 if (res.ok) {
 router.push(`/lessons/${lesson.id}/quiz`);
 } else {
 alert("Sinh bài kiểm tra thất bại: " + res.message);
 }
 });
 };

 // --- Generating state animation ---
 const TIPS = [
 { icon: Brain, text: "AI đang phân tích từ vựng..." },
 { icon: BookOpen, text: "Đang tạo câu hỏi ngữ pháp..." },
 { icon: Lightbulb, text: "Đang sinh đáp án và giải thích..." },
 { icon: Sparkles, text: "Đang hoàn thiện 30 câu quiz..." },
 { icon: Wand2, text: "Sắp xong, chuẩn bị bài kiểm tra..." },
 ];
 const [genProgress, setGenProgress] = useState(0);
 const [tipIndex, setTipIndex] = useState(0);
 const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

 useEffect(() => {
 if (isGenerating) {
 setGenProgress(0);
 setTipIndex(0);
 const startTime = Date.now();
 intervalRef.current = setInterval(() => {
 const elapsed = (Date.now() - startTime) / 1000;
 // Ease-out curve: fast start, slow end. Caps at 92%
 const progress = Math.min(92, 100 * (1 - Math.exp(-elapsed / 12)));
 setGenProgress(Math.round(progress));
 setTipIndex(Math.min(TIPS.length - 1, Math.floor(elapsed / 5)));
 }, 200);
 } else {
 if (intervalRef.current) clearInterval(intervalRef.current);
 setGenProgress(0);
 }
 return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [isGenerating]);

 const DropdownActions = () => (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100">
 <MoreVertical className="h-4 w-4" />
 <span className="sr-only">Open menu</span>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
 {lesson.status === "draft" && (
 <DropdownMenuItem 
 onClick={(e) => {
 e.preventDefault();
 handlePublish();
 }}
 className="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/20 font-medium"
 disabled={isPublishing}
 >
 {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
 {isPublishing ? "Publishing..." : "Publish Lesson"}
 </DropdownMenuItem>
 )}
 <DropdownMenuSeparator />
 <DropdownMenuItem 
 onSelect={(e) => {
 e.preventDefault();
 setIsEditOpen(true);
 }}
 className="gap-2 cursor-pointer"
 >
 <Edit2 className="h-4 w-4 text-muted-foreground" /> Edit lesson
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem 
 onClick={(e) => { e.stopPropagation(); setShowDeleteAlert(true); }}
 className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
 >
 <Trash2 className="h-4 w-4" /> Delete lesson
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 );

 const DeleteDialog = () => (
 <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
 <AlertDialogContent className="rounded-2xl shadow-2xl sm:max-w-[400px]">
 <AlertDialogHeader>
 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
 <AlertDialogDescription className="text-muted-foreground">
 This action cannot be undone. This will permanently delete the lesson
 <span className="font-semibold text-foreground"> "{lesson.title}" </span> 
 and remove all associated vocabulary and flashcards from our servers.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
 <AlertDialogCancel className="rounded-xl" disabled={isDeleting}>Cancel</AlertDialogCancel>
 <AlertDialogAction 
 onClick={(e) => {
 e.preventDefault();
 handleDelete();
 }}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
 disabled={isDeleting}
 >
 {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
 {isDeleting ? "Deleting..." : "Delete"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 );

 if (viewMode === "list") {
 return (
 <>
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ scale: 1.01 }}
 transition={{ duration: 0.3, ease: "easeOut" }}
 className={`group relative flex flex-col sm:flex-row sm:items-center overflow-hidden transition-all duration-300 shadow-sm border rounded-xl p-3 pr-4 gap-4 ${
 isGenerating
 ? "border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.15)] bg-primary/5 dark:bg-primary/10"
 : " bg-card hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50"
 }`}>
 {isGenerating && (
 <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 animate-pulse pointer-events-none" />
 )}
 <div className="hidden sm:flex shrink-0 pl-1">
 <ProgressRing learned={lesson.learnedCount} total={lesson.vocabularyCount} />
 </div>

 <div className="flex-1 min-w-0 cursor-pointer py-1" onClick={() => router.push(`/lessons/${lesson.id}`)}>
 <div className="flex items-center gap-2 mb-1.5">
 <h3 className="truncate text-base font-bold tracking-tight hover:text-primary transition-colors">{lesson.title}</h3>
 {lesson.status === "draft" && (
 <Badge variant="outline" tone="amber" className="text-[10px] h-5 px-1.5 shadow-sm">Draft</Badge>
 )}
 </div>
 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-medium">
 <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 opacity-70" />{new Date(lesson.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
 <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 opacity-70" />{lesson.vocabularyCount} vocab</span>
 <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 opacity-70" />{lesson.grammarCount} grammar</span>
 </div>
 </div>

 <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2 mt-2 sm:mt-0">
 <div className="flex sm:hidden">
 <ProgressRing learned={lesson.learnedCount} total={lesson.vocabularyCount} />
 </div>
 <div className="flex items-center gap-2">
 <Button
 onClick={(e) => { e.stopPropagation(); handleGenerateQuiz(); }}
 variant="outline"
 size="sm"
 disabled={isGenerating || lesson.status === "draft"}
 className={cn(
 "h-9 rounded-lg font-medium transition-all duration-300 relative z-10",
 isGenerating
 ? "border-primary/50 text-primary bg-primary/10 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
 : "border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40"
 )}
 >
 {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin sm:mr-1.5" /> : <Wand2 className="h-3.5 w-3.5 sm:mr-1.5" />}
 <span className="hidden sm:inline transition-opacity duration-300">
 {isGenerating ? TIPS[tipIndex].text : "Quiz"}
 </span>
 </Button>
 <Button
 onClick={() => router.push(`/lessons/${lesson.id}`)}
 size="sm"
 className="h-9 rounded-lg font-semibold"
 >
 Học Bài
 </Button>
 {isAdmin && (
 <>
 <DropdownActions />
 <EditLessonSheet lesson={lesson} open={isEditOpen} onOpenChange={setIsEditOpen} />
 </>
 )}
 </div>
 </div>
 </motion.div>
 <DeleteDialog />
 </>
 );
 }

 return (
 <>
 <motion.div
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -6, scale: 1.01 }}
 transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.1] }}
 className="h-full"
 >
 <Card className="group relative flex flex-col h-full overflow-hidden transition-all duration-300 shadow-sm border hover:shadow-xl hover:border-primary/50 rounded-2xl">
 <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between gap-3">
 <div
 className="min-w-0 pr-6 cursor-pointer"
 onClick={() => router.push(`/lessons/${lesson.id}`)}
 >
 <CardTitle className="truncate text-lg font-bold tracking-tight hover:text-primary transition-colors">{lesson.title}</CardTitle>
 <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
 <CalendarDays className="h-3.5 w-3.5" />
 {new Date(lesson.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
 </div>
 </div>
 
 <div className="absolute right-4 top-4 flex items-center gap-2">
 <Badge variant="outline" tone={lesson.status === "published" ? "green" : lesson.status === "draft" ? "amber" : "neutral"} className="hidden sm:inline-flex shadow-sm">
 {lesson.status}
 </Badge>
 
 {isAdmin && (
 <>
 <DropdownActions />
 <EditLessonSheet lesson={lesson} open={isEditOpen} onOpenChange={setIsEditOpen} />
 </>
 )}
 </div>
 </div>
 </CardHeader>
 <CardContent
 className="flex-1 space-y-5 cursor-pointer"
 onClick={() => router.push(`/lessons/${lesson.id}`)}
 >
 {lesson.description && (
 <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/90">{lesson.description}</p>
 )}
 
 <div className="flex flex-wrap gap-1.5">
 {lesson.tags.map((tag) => (
 <Badge key={tag} variant="secondary" className="bg-secondary/50 hover:bg-secondary text-xs rounded-md">
 {tag}
 </Badge>
 ))}
 </div>
 
 <div className="grid grid-cols-3 gap-3 text-sm">
 <div className="flex flex-col items-center justify-center rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] p-4 ring-1 ring-inset ring-black/5 dark:ring-white/10 transition-all duration-300 group-hover:bg-primary/5 group-hover:ring-primary/20">
 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vocabulary</p>
 <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{lesson.vocabularyCount}</p>
 </div>
 <div className="flex flex-col items-center justify-center rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] p-4 ring-1 ring-inset ring-black/5 dark:ring-white/10 transition-all duration-300 group-hover:bg-primary/5 group-hover:ring-primary/20">
 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Grammar</p>
 <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{lesson.grammarCount}</p>
 </div>
 <div className="flex flex-col items-center justify-center rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] p-3 ring-1 ring-inset ring-black/5 dark:ring-white/10 transition-all duration-300 group-hover:bg-emerald-500/5 group-hover:ring-emerald-500/20">
 <ProgressRing learned={lesson.learnedCount} total={lesson.vocabularyCount} />
 </div>
 </div>
 
 {lesson.status === "draft" && (
 <div className="flex items-center gap-2 text-[13px] font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
 </span>
 Draft Mode (Publish to activate Quiz)
 </div>
 )}
 </CardContent>

 {/* Generating Overlay */}
 {isGenerating && (
 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95/95 backdrop-blur-sm rounded-2xl animate-in fade-in duration-300">
 {/* Pulsing icon */}
 <div className="relative mb-6">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 animate-pulse">
 {(() => { const TipIcon = TIPS[tipIndex].icon; return <TipIcon className="w-7 h-7 text-white" />; })()}
 </div>
 <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
 <Sparkles className="w-3 h-3 text-white" />
 </div>
 </div>

 {/* Progress */}
 <div className="w-3/4 max-w-[200px] mb-3">
 <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
 <div 
 className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
 style={{ width: `${genProgress}%` }}
 />
 </div>
 </div>

 <p className="text-sm font-bold text-foreground mb-1">{genProgress}%</p>
 <p className="text-[13px] text-muted-foreground font-medium animate-in fade-in duration-500" key={tipIndex}>
 {TIPS[tipIndex].text}
 </p>
 </div>
 )}

 <CardFooter className="pt-0 pb-5 flex flex-col gap-2 mt-auto">
 <Button
 onClick={() => router.push(`/lessons/${lesson.id}`)}
 className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-300 font-semibold gap-2 cursor-pointer"
 >
 <BookOpen className="h-4 w-4" />
 Học Bài Này
 </Button>
 <Button
 onClick={(e) => { e.stopPropagation(); handleGenerateQuiz(); }}
 variant="outline"
 disabled={isGenerating || lesson.status === "draft"}
 className="w-full h-10 rounded-xl transition-all duration-300 font-medium gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-primary/20 hover:border-primary/40 hover:bg-primary/10 text-primary"
 >
 {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
 {isGenerating ? "AI is generating..." : "Generate & Play Quiz"}
 </Button>
 </CardFooter>
 </Card>
 </motion.div>

 <DeleteDialog />
 </>
 );
}

function ProgressRing({ learned, total }: { learned: number; total: number }) {
 const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
 const r = 22;
 const circumference = 2 * Math.PI * r;
 const offset = circumference * (1 - pct / 100);

 return (
 <div className="flex flex-col items-center gap-0.5">
 <div className="relative w-14 h-14 flex items-center justify-center">
 <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
 <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-black/5 dark:text-white/5" />
 <circle
 cx="28" cy="28" r={r} fill="none"
 stroke={pct > 0 ? "url(#progressGrad)" : "none"}
 strokeWidth="4" strokeLinecap="round"
 strokeDasharray={circumference}
 strokeDashoffset={offset}
 style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
 />
 <defs>
 <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
 <stop offset="0%" stopColor="#10b981" />
 <stop offset="100%" stopColor="#059669" />
 </linearGradient>
 </defs>
 </svg>
 <span className="absolute text-xs font-bold text-foreground">{pct}%</span>
 </div>
 <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Learned</p>
 </div>
 );
}
