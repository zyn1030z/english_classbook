"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { grammarNotes, grammarTopics } from "@/lib/utils/demo-data";

export function GrammarNotebook() {
  const [selectedTopic, setSelectedTopic] = React.useState(grammarTopics[0]?.id ?? "");
  const [query, setQuery] = React.useState("");

  const notes = grammarNotes.filter((note) => {
    const matchesTopic = note.topicId === selectedTopic;
    const matchesQuery = `${note.title} ${note.explanation} ${note.examples.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  return (
    <section className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md transition-colors">
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>Grammar grouped by level and lesson context.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {grammarTopics.map((topic) => (
            <Button
              key={topic.id}
              type="button"
              variant="outline"
              className={`h-auto w-full justify-start rounded-md p-3 text-left font-normal whitespace-normal dark:border-white/10 transition-colors ${
                selectedTopic === topic.id ? "border-primary bg-primary/10 dark:bg-primary/20" : "hover:bg-muted dark:hover:bg-black/20"
              }`}
              onClick={() => setSelectedTopic(topic.id)}
            >
              <div className="w-full">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{topic.name}</p>
                  <Badge tone="blue">{topic.level}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{topic.description}</p>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
      <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md transition-colors">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Notes and examples</CardTitle>
              <CardDescription>Search explanations, examples, and personal notes.</CardDescription>
            </div>
            <div className="relative md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9 dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" placeholder="Search notes" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {notes.map((note) => (
            <article key={note.id} className="rounded-md border dark:border-white/10 dark:bg-black/10 p-4">
              <h2 className="text-lg font-semibold">{note.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{note.explanation}</p>
              <div className="mt-4 space-y-2">
                {note.examples.map((example) => (
                  <p key={example} className="rounded-md bg-muted dark:bg-black/40 p-3 text-sm">
                    {example}
                  </p>
                ))}
              </div>
              <p className="mt-4 text-sm">{note.notes}</p>
            </article>
          ))}
          {notes.length === 0 ? <p className="rounded-md border p-4 text-sm text-muted-foreground">No notes match this search.</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}
