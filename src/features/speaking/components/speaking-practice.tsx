"use client";

import * as React from "react";
import { Mic, Square, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMediaRecorder } from "@/hooks/use-media-recorder";

const starterQuestions = [
  "Tell me about a recent accomplishment at work.",
  "Describe a time you solved a difficult problem.",
  "What skill have you improved this month?",
  "How would you politely complain about a delayed service?",
  "What are your goals for the next three months?"
];

export function SpeakingPractice() {
  const [topic, setTopic] = React.useState("job interview");
  const [questions, setQuestions] = React.useState(starterQuestions);
  const [current, setCurrent] = React.useState(0);
  const { isRecording, audioUrl, start, stop } = useMediaRecorder();

  function generateQuestions() {
    const topicLabel = topic.trim() || "daily conversation";
    setQuestions([
      `What makes ${topicLabel} challenging for English learners?`,
      `Describe a personal experience related to ${topicLabel}.`,
      `What useful vocabulary do you need for ${topicLabel}?`,
      `How would you ask a polite follow-up question about ${topicLabel}?`,
      `Summarize your opinion about ${topicLabel} in one minute.`
    ]);
    setCurrent(0);
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Speaking session</CardTitle>
          <CardDescription>Generate prompts, record answers, and replay your speaking practice.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Topic" />
            <Button onClick={generateQuestions}>
              <Wand2 className="h-4 w-4" />
              Questions
            </Button>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Question {current + 1} of {questions.length}</p>
            <p className="mt-4 text-2xl font-semibold leading-snug">{questions[current]}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isRecording ? (
              <Button variant="destructive" onClick={stop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button onClick={start}>
                <Mic className="h-4 w-4" />
                Record
              </Button>
            )}
            <Button variant="outline" onClick={() => setCurrent((value) => (value + 1) % questions.length)}>
              Next question
            </Button>
            {isRecording ? <span className="text-sm font-medium text-destructive">Recording...</span> : null}
          </div>
          {audioUrl ? (
            <audio controls src={audioUrl} className="w-full">
              <track kind="captions" />
            </audio>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Question queue</CardTitle>
          <CardDescription>Pick a prompt and record a focused answer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {questions.map((question, index) => (
            <Button
              key={question}
              type="button"
              variant="outline"
              className={`h-auto w-full justify-start rounded-md p-3 text-left font-normal whitespace-normal ${
                index === current ? "border-primary bg-primary/10" : "hover:bg-muted"
              }`}
              onClick={() => setCurrent(index)}
            >
              {question}
            </Button>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
