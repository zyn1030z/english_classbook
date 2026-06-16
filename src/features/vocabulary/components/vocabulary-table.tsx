"use client";

import * as React from "react";
import { Check, Search, Star, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Difficulty, Vocabulary } from "@/types";

const difficultyTone: Record<Difficulty, "green" | "amber" | "red"> = {
  easy: "green",
  medium: "amber",
  hard: "red"
};

export function VocabularyTable({
  vocabularies,
  onToggleFavorite,
  onToggleLearned
}: {
  vocabularies: Vocabulary[];
  onToggleFavorite: (id: string) => void;
  onToggleLearned: (id: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("all");
  const [selectedLessonId, setSelectedLessonId] = React.useState("all");

  const availableLessons = React.useMemo(() => {
    const lessonsMap = new Map<string, string>();
    vocabularies.forEach((v) => {
      if (v.lessonId && v.lesson?.title) {
        lessonsMap.set(v.lessonId, v.lesson.title);
      }
    });
    return Array.from(lessonsMap.entries()).map(([id, title]) => ({ id, title }));
  }, [vocabularies]);

  const filtered = vocabularies.filter((item) => {
    const matchesQuery = `${item.word} ${item.meaning} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
    const matchesLesson = selectedLessonId === "all" || item.lessonId === selectedLessonId;
    return matchesQuery && matchesDifficulty && matchesLesson;
  });

  function speak(word: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
  }

  return (
    <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md transition-colors">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Vocabulary bank</CardTitle>
          <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px] md:w-[600px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9 dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" placeholder="Search word, meaning, category" />
            </div>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger aria-label="Difficulty filter" className="dark:border-white/10 dark:bg-black/20 focus:ring-primary/50 truncate">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger aria-label="Lesson filter" className="dark:border-white/10 dark:bg-black/20 focus:ring-primary/50 truncate">
                <SelectValue placeholder="Lesson" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lessons</SelectItem>
                {availableLessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table className="min-w-[760px]">
            <TableHeader className="text-xs uppercase">
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Meaning</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Example</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="align-top">
                  <TableCell>
                    <div className="font-medium">{item.word}</div>
                    <div className="font-mono text-xs text-muted-foreground">{item.ipa}</div>
                    {item.lesson && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal border-dashed border-border/50 dark:border-white/10 px-1.5 py-0">
                          {item.lesson.title}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{item.meaning}</TableCell>
                  <TableCell>
                    <Badge>{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge tone={difficultyTone[item.difficulty]}>{item.difficulty}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">{item.examples[0]?.sentence}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" aria-label={`Pronounce ${item.word}`} onClick={() => speak(item.word)}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button variant={item.isFavorite ? "secondary" : "outline"} size="icon" aria-label="Toggle favorite" onClick={() => onToggleFavorite(item.id)}>
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant={item.isLearned ? "secondary" : "outline"} size="icon" aria-label="Toggle learned" onClick={() => onToggleLearned(item.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
}
