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
      {/* Toolbar: Search, Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-[#161616] p-3 rounded-2xl border dark:border-white/10 shadow-sm">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-transparent border-none shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>

        <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>

        <div className="flex items-center justify-between sm:justify-end flex-1 gap-4">
          {/* Stats pills (mobile hidden) */}
          <div className="hidden lg:flex items-center gap-3 mr-auto">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 text-primary text-xs font-semibold">
              <BookOpen className="h-3.5 w-3.5" />
              {lessons.length} lessons
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <span className="font-bold">{totalVocab}</span> vocab
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted/50 dark:bg-black/20 rounded-xl">
            {["all", "published", "draft"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-muted/50 dark:bg-black/20 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
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
