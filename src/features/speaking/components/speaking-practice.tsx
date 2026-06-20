"use client";

import * as React from "react";
import {
  Mic, Square, SkipForward, Volume2, Loader2, RefreshCw,
  ChevronRight, Award, Target, BookOpen, MessageCircle,
  Lightbulb, CheckCircle2, AlertTriangle, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMediaRecorder } from "@/hooks/use-media-recorder";
import { evaluateSpeaking, getSpeakingPrompts } from "@/features/speaking/actions";
import type { SpeakingFeedback, SpeakingQuestion } from "@/features/speaking/actions";
import { playPronunciation } from "@/lib/utils/speech";

// SpeakingQuestion type imported from actions

function ScoreRing({ score, label, size = 56 }: { score: number; label: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;
  const color = score >= 8 ? "text-emerald-500" : score >= 6 ? "text-amber-500" : "text-red-500";
  const stroke = score >= 8 ? "stroke-emerald-500" : score >= 6 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={4} fill="none" className="stroke-muted/30" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} strokeWidth={4} fill="none"
            className={`${stroke} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>
          {score}
        </span>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function SpeakingPractice({ questions: initialQuestions }: { questions: SpeakingQuestion[] }) {
  const [questions, setQuestions] = React.useState(initialQuestions);
  const [current, setCurrent] = React.useState(0);
  const [transcript, setTranscript] = React.useState("");
  const [feedback, setFeedback] = React.useState<SpeakingFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [isReloading, setIsReloading] = React.useState(false);
  const [evalError, setEvalError] = React.useState("");
  const { isRecording, audioUrl, start, stop } = useMediaRecorder();

  // Speech Recognition
  const recognitionRef = React.useRef<any>(null);

  const startRecording = React.useCallback(async () => {
    setTranscript("");
    setFeedback(null);
    setEvalError("");

    // Start audio recording
    await start();

    // Start speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";
      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript + interim);
      };

      recognition.onerror = () => {};
      recognitionRef.current = recognition;
      recognition.start();
    }
  }, [start]);

  const stopRecording = React.useCallback(() => {
    stop();
    recognitionRef.current?.stop();
  }, [stop]);

  const handleEvaluate = async () => {
    if (!transcript.trim()) return;
    setIsEvaluating(true);
    setEvalError("");
    try {
      const result = await evaluateSpeaking(questions[current].text, transcript);
      if (result.ok && result.feedback) {
        setFeedback(result.feedback);
      } else {
        setEvalError(result.message || "Evaluation failed");
      }
    } catch (e: any) {
      setEvalError(e.message || "Something went wrong");
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    setCurrent((v) => (v + 1) % questions.length);
    setTranscript("");
    setFeedback(null);
    setEvalError("");
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      const result = await getSpeakingPrompts();
      setQuestions(result.questions);
      setCurrent(0);
      setTranscript("");
      setFeedback(null);
      setEvalError("");
    } finally {
      setIsReloading(false);
    }
  };

  function speak(text: string) {
    playPronunciation(text);
  }

  const question = questions[current];

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_340px] items-start">
      {/* Main panel */}
      <div className="space-y-5">
        {/* Question card */}
        <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Question header */}
            <div className="flex items-center justify-between px-6 py-3 border-b dark:border-white/5 bg-muted/20 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>Question {current + 1} of {questions.length}</span>
                {question?.source === "vocabulary" && question.vocabWord && (
                  <Badge variant="outline" className="text-[10px] gap-1 rounded-md">
                    <BookOpen className="h-2.5 w-2.5" />
                    {question.vocabWord}
                  </Badge>
                )}
                {question?.source === "general" && (
                  <Badge variant="outline" className="text-[10px] gap-1 rounded-md border-dashed">
                    <MessageCircle className="h-2.5 w-2.5" />
                    General
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 cursor-pointer" onClick={() => speak(question.text)}>
                <Volume2 className="h-3 w-3" /> Listen
              </Button>
            </div>

            {/* Question body */}
            <div className="px-6 py-8 space-y-3">
              <p className="text-xl font-bold leading-relaxed tracking-tight">{question?.text}</p>
              {question?.translation && (
                <p className="text-sm text-muted-foreground italic">{question.translation}</p>
              )}
              {question?.source === "vocabulary" && question.vocabWord && (
                <div className="flex items-center gap-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 px-4 py-2.5">
                  <div>
                    <span className="text-sm font-bold text-primary">{question.vocabWord}</span>
                    {question.vocabIpa && (
                      <span className="ml-2 text-xs font-mono text-muted-foreground">{question.vocabIpa}</span>
                    )}
                  </div>
                  {question.vocabMeaning && (
                    <span className="text-xs text-muted-foreground border-l border-border/50 pl-3">{question.vocabMeaning}</span>
                  )}
                </div>
              )}
            </div>

            {/* Recording zone */}
            <div className="px-6 pb-6 space-y-4">
              {/* Waveform / status */}
              {isRecording && (
                <div className="flex items-center gap-3 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <div className="flex gap-0.5 items-end h-5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-red-500"
                        style={{
                          animation: `speaking-wave 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                          height: "40%",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-red-500">Recording...</span>
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="rounded-xl border dark:border-white/5 bg-muted/20 dark:bg-white/[0.02] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">Your response</p>
                  <p className="text-sm leading-relaxed">{transcript}</p>
                </div>
              )}

              {/* Audio playback */}
              {audioUrl && !isRecording && (
                <audio controls src={audioUrl} className="w-full h-10 rounded-lg">
                  <track kind="captions" />
                </audio>
              )}

              {/* Controls */}
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <Button onClick={stopRecording} variant="destructive" className="gap-2 rounded-xl font-semibold">
                    <Square className="h-3.5 w-3.5" /> Stop
                  </Button>
                ) : (
                  <Button onClick={startRecording} className="gap-2 rounded-xl font-semibold">
                    <Mic className="h-3.5 w-3.5" /> Record
                  </Button>
                )}
                <Button variant="outline" onClick={nextQuestion} className="gap-2 rounded-xl">
                  <SkipForward className="h-3.5 w-3.5" /> Next
                </Button>
                {transcript && !feedback && (
                  <Button
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="gap-2 rounded-xl ml-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold"
                  >
                    {isEvaluating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {isEvaluating ? "Evaluating..." : "AI Evaluate"}
                  </Button>
                )}
              </div>

              {evalError && (
                <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" /> {evalError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback panel */}
        {feedback && (
          <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">AI Feedback</CardTitle>
                  <p className="text-xs text-muted-foreground">Powered by DeepSeek</p>
                </div>
                <div className="ml-auto">
                  <Badge
                    tone={feedback.overallScore >= 8 ? "green" : feedback.overallScore >= 6 ? "amber" : "red"}
                    className="text-sm font-bold px-3 py-1"
                  >
                    {feedback.overallScore}/10
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Score rings */}
              <div className="flex justify-around py-2">
                <ScoreRing score={feedback.pronunciation} label="Pronun." />
                <ScoreRing score={feedback.grammar} label="Grammar" />
                <ScoreRing score={feedback.fluency} label="Fluency" />
                <ScoreRing score={feedback.vocabulary} label="Vocab" />
              </div>

              {/* Strengths & Improvements */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border dark:border-white/5 bg-emerald-500/5 dark:bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                  </div>
                  <ul className="space-y-1">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-xs leading-relaxed flex items-start gap-1.5">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-emerald-500 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border dark:border-white/5 bg-amber-500/5 dark:bg-amber-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <Target className="h-3.5 w-3.5" /> To improve
                  </div>
                  <ul className="space-y-1">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="text-xs leading-relaxed flex items-start gap-1.5">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Corrected version */}
              <div className="rounded-xl border dark:border-white/5 bg-primary/5 dark:bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" /> Better version
                </div>
                <p className="text-sm leading-relaxed">{feedback.correctedVersion}</p>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 cursor-pointer text-primary hover:text-primary" onClick={() => speak(feedback.correctedVersion)}>
                  <Volume2 className="h-3 w-3" /> Listen
                </Button>
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2.5 rounded-xl bg-muted/30 dark:bg-white/[0.03] px-4 py-3">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">{feedback.tip}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar: Question queue */}
      <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md rounded-2xl sticky top-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-bold">Question queue</CardTitle>
              <p className="text-xs text-muted-foreground">{questions.length} prompts loaded</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0 cursor-pointer"
              onClick={handleReload}
              disabled={isReloading}
              aria-label="Reload questions"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isReloading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {questions.map((q, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setCurrent(index);
                setTranscript("");
                setFeedback(null);
                setEvalError("");
              }}
              className={`w-full text-left rounded-xl px-3 py-2.5 text-[13px] leading-relaxed transition-all cursor-pointer ${
                index === current
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20 font-medium"
                  : "hover:bg-muted/40 dark:hover:bg-white/5 text-muted-foreground"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-muted-foreground/50 mt-0.5 shrink-0">{index + 1}</span>
                <div className="min-w-0">
                  <span className="line-clamp-2 block">{q.text}</span>
                  {q.translation && (
                    <span className="line-clamp-1 block text-[11px] text-muted-foreground/60 italic mt-0.5">{q.translation}</span>
                  )}
                </div>
              </div>
              {q.source === "vocabulary" && q.vocabWord && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded border-dashed">
                    {q.vocabWord}
                  </Badge>
                  {q.vocabIpa && (
                    <span className="text-[9px] font-mono text-muted-foreground/50">{q.vocabIpa}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* CSS Animation for waveform */}
      <style jsx>{`
        @keyframes speaking-wave {
          from { height: 20%; }
          to { height: 100%; }
        }
      `}</style>
    </section>
  );
}
