"use client";

import { useState, useTransition } from "react";
import { CalendarDays, FileText, MoreVertical, Trash2, Edit2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Lesson } from "@/types";
import { EditLessonSheet } from "./edit-lesson-sheet";
import { useRouter } from "next/navigation";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const [isDeleting, startDelete] = useTransition();
  const [isGenerating, startGenerate] = useTransition();
  const [isPublishing, startPublish] = useTransition();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
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

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-300 shadow-md dark:border-white/10 dark:bg-[#161616] hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/40">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-6">
              <CardTitle className="truncate text-lg font-bold tracking-tight">{lesson.title}</CardTitle>
              <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(lesson.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
            
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <Badge variant="outline" tone={lesson.status === "published" ? "green" : lesson.status === "draft" ? "amber" : "neutral"} className="hidden sm:inline-flex shadow-sm">
                {lesson.status}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                  {lesson.status === "draft" ? (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        handlePublish();
                      }}
                      className="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/20 font-medium"
                      disabled={isPublishing}
                    >
                      {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>🚀</span>}
                      {isPublishing ? "Publishing..." : "Publish Lesson"}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        handleGenerateQuiz();
                      }}
                      className="gap-2 cursor-pointer text-primary focus:text-primary focus:bg-primary/5 font-medium"
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-lg">🪄</span>} 
                      {isGenerating ? "AI is generating..." : "Generate & Play Quiz"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <EditLessonSheet lesson={lesson} />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteAlert(true)}
                    className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Delete lesson
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
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
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-muted/50 to-muted/80 p-3 shadow-inner ring-1 ring-inset ring-foreground/5 transition-colors group-hover:from-primary/5 group-hover:to-primary/10 group-hover:ring-primary/10">
              <p className="text-xs font-medium text-muted-foreground">Vocabulary</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground/90">{lesson.vocabularyCount}</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-muted/50 to-muted/80 p-3 shadow-inner ring-1 ring-inset ring-foreground/5 transition-colors group-hover:from-primary/5 group-hover:to-primary/10 group-hover:ring-primary/10">
              <p className="text-xs font-medium text-muted-foreground">Grammar</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground/90">{lesson.grammarCount}</p>
            </div>
          </div>
          
          {lesson.status === "draft" ? (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Draft Mode (Publish to activate Quiz)
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-green-600/80 dark:text-green-400/80">
              <FileText className="h-3.5 w-3.5" />
              AI Extraction ready
            </div>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}
