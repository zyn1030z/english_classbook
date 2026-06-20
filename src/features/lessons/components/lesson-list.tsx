"use client";

import * as React from "react";
import { BookOpen, GraduationCap, Search, LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LessonCard } from "@/features/lessons/components/lesson-card";
import type { Lesson } from "@/types";

export function LessonList({ lessons, isAdmin = false }: { lessons: Lesson[]; isAdmin?: boolean }) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");

  const filtered = lessons.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalVocab = lessons.reduce((sum, l) => sum + (l.vocabularyCount || 0), 0);
  const totalGrammar = lessons.reduce((sum, l) => sum + (l.grammarCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 px-3 py-1.5">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">{lessons.length} lessons</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 px-3 py-1.5">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{totalVocab} vocab</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 px-3 py-1.5">
          <GraduationCap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{totalGrammar} grammar</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Status filter pills */}
          {["all", "published", "draft"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50"
          />
        </div>
        <div className="flex items-center rounded-lg border bg-background p-1 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No lessons found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {search ? "Try a different search term" : "Create your first lesson above"}
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3"}>
          {filtered.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} isAdmin={isAdmin} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
