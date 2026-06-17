"use client";

import * as React from "react";
import { BookOpen, ChevronDown, ChevronRight, FileText, GraduationCap, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GrammarTopic, GrammarNote } from "@/types";

interface GrammarNotebookProps {
  topics: GrammarTopic[];
  notes: GrammarNote[];
}

const levelColors: Record<string, string> = {
  A1: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  A2: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  B1: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  B2: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  C1: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  C2: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
};

interface LessonGroup {
  lessonId: string;
  lessonTitle: string;
  topicIds: string[];
}

export function GrammarNotebook({ topics, notes: allNotes }: GrammarNotebookProps) {
  const [selectedTopic, setSelectedTopic] = React.useState(topics[0]?.id ?? "");
  const [query, setQuery] = React.useState("");
  const [collapsedLessons, setCollapsedLessons] = React.useState<Set<string>>(new Set());

  const activeTopic = topics.find((t) => t.id === selectedTopic);

  const notes = allNotes.filter((note) => {
    const matchesTopic = note.topicId === selectedTopic;
    const matchesQuery = `${note.title} ${note.explanation} ${note.examples.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  // Build lesson groups: topic → lesson mapping via notes
  const lessonGroups = React.useMemo(() => {
    const topicLessonMap = new Map<string, { lessonId: string; lessonTitle: string }>();

    // Map each topic to its lesson (via notes)
    for (const note of allNotes) {
      if (note.topicId && note.lessonId && note.lessonTitle) {
        if (!topicLessonMap.has(note.topicId)) {
          topicLessonMap.set(note.topicId, {
            lessonId: note.lessonId,
            lessonTitle: note.lessonTitle,
          });
        }
      }
    }

    // Group topics by lesson
    const groups = new Map<string, LessonGroup>();
    const ungroupedTopicIds: string[] = [];

    for (const topic of topics) {
      const mapping = topicLessonMap.get(topic.id);
      if (mapping) {
        const existing = groups.get(mapping.lessonId);
        if (existing) {
          existing.topicIds.push(topic.id);
        } else {
          groups.set(mapping.lessonId, {
            lessonId: mapping.lessonId,
            lessonTitle: mapping.lessonTitle,
            topicIds: [topic.id],
          });
        }
      } else {
        ungroupedTopicIds.push(topic.id);
      }
    }

    return {
      grouped: Array.from(groups.values()),
      ungrouped: ungroupedTopicIds,
    };
  }, [topics, allNotes]);

  function toggleLesson(lessonId: string) {
    setCollapsedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  }

  function renderTopicItem(topic: GrammarTopic) {
    const isActive = selectedTopic === topic.id;
    const noteCount = allNotes.filter((n) => n.topicId === topic.id).length;
    const levelClass = levelColors[topic.level] || levelColors.A1;

    return (
      <button
        key={topic.id}
        type="button"
        className={`group w-full rounded-lg p-2.5 text-left transition-all duration-200 border ${
          isActive
            ? "border-primary/40 bg-primary/10 dark:bg-primary/15 shadow-sm shadow-primary/10"
            : "border-transparent hover:border-white/10 hover:bg-muted/50 dark:hover:bg-white/5"
        }`}
        onClick={() => setSelectedTopic(topic.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <ChevronRight className={`h-3 w-3 flex-shrink-0 transition-transform ${isActive ? "text-primary rotate-90" : "text-muted-foreground"}`} />
              <p className={`font-medium text-sm truncate ${isActive ? "text-primary" : ""}`}>
                {topic.name}
              </p>
            </div>
            {topic.description && (
              <p className="mt-0.5 ml-4.5 text-[11px] text-muted-foreground line-clamp-1">
                {topic.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {noteCount > 0 && (
              <span className="text-[10px] text-muted-foreground">{noteCount}</span>
            )}
            <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${levelClass}`}>
              {topic.level}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Topics sidebar — grouped by lesson */}
      <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Topics</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-normal">
              {topics.length} topics
            </Badge>
          </div>
          <CardDescription>Grammar grouped by lesson.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
          {/* Grouped by lesson */}
          {lessonGroups.grouped.map((group) => {
            const isCollapsed = collapsedLessons.has(group.lessonId);
            const groupTopics = topics.filter((t) => group.topicIds.includes(t.id));

            return (
              <div key={group.lessonId} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleLesson(group.lessonId)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <GraduationCap className="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
                  <span className="text-xs font-semibold text-muted-foreground truncate">
                    {group.lessonTitle}
                  </span>
                  <Badge variant="outline" className="ml-auto text-[9px] px-1 py-0 font-normal">
                    {groupTopics.length}
                  </Badge>
                </button>
                {!isCollapsed && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/5 dark:border-white/10 pl-2">
                    {groupTopics.map(renderTopicItem)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Ungrouped topics */}
          {lessonGroups.ungrouped.length > 0 && (
            <div className="mb-1">
              {lessonGroups.grouped.length > 0 && (
                <div className="px-2 py-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Other topics</span>
                </div>
              )}
              <div className="space-y-0.5">
                {lessonGroups.ungrouped.map((id) => {
                  const topic = topics.find((t) => t.id === id);
                  return topic ? renderTopicItem(topic) : null;
                })}
              </div>
            </div>
          )}

          {topics.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No grammar topics yet</p>
              <p className="text-xs text-muted-foreground mt-1">Extract grammar from your lessons to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes panel */}
      <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md transition-colors">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">
                  {activeTopic ? activeTopic.name : "Notes and examples"}
                </CardTitle>
                {activeTopic && (
                  <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${levelColors[activeTopic.level] || levelColors.A1}`}>
                    {activeTopic.level}
                  </span>
                )}
              </div>
              <CardDescription className="mt-1">
                {activeTopic?.description || "Select a topic to see notes and examples."}
              </CardDescription>
            </div>
            <div className="relative md:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9 dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50"
                placeholder="Search notes"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {notes.map((note, i) => (
            <article
              key={note.id}
              className="rounded-xl border dark:border-white/10 overflow-hidden transition-all hover:shadow-md"
            >
              <div className="bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 px-5 py-3 border-b dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                    <span className="text-primary text-xs font-mono">#{i + 1}</span>
                    {note.title}
                  </h2>
                  {note.lessonTitle && (
                    <span className="text-[10px] text-muted-foreground bg-muted/50 dark:bg-white/5 rounded-full px-2 py-0.5">
                      📘 {note.lessonTitle}
                    </span>
                  )}
                </div>
              </div>
              <div className="px-5 py-4 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{note.explanation}</p>
                {note.examples.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Examples</p>
                    {note.examples.map((example, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 rounded-lg bg-muted/50 dark:bg-black/30 p-3 text-sm border border-transparent dark:border-white/5"
                      >
                        <span className="text-primary font-mono text-xs mt-0.5">→</span>
                        <span className="italic">{example}</span>
                      </div>
                    ))}
                  </div>
                )}
                {note.notes && (
                  <div className="rounded-lg bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-3">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">📝 Personal Note</p>
                    <p className="text-sm">{note.notes}</p>
                  </div>
                )}
              </div>
            </article>
          ))}

          {notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 dark:bg-white/5 flex items-center justify-center mb-3">
                <FileText className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No notes found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {query
                  ? "Try a different search term."
                  : activeTopic
                    ? "This topic doesn't have any notes yet. Re-extract a lesson to populate grammar notes."
                    : "Select a topic from the sidebar to view its notes."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
