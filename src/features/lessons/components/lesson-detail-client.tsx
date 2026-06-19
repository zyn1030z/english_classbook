"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Brain, ChevronDown, ChevronRight,
  FileText, Layers, Loader2, Search, Sparkles, Star,
  Volume2, Wand2, CheckCircle2, XCircle, Paperclip, Clock, Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateLessonQuiz, toggleVocabLearned } from "@/features/lessons/actions";

type VocabItem = {
  id: string;
  word: string;
  meaning: string;
  ipa: string;
  part_of_speech: string;
  category: string;
  difficulty: string;
  is_learned: boolean;
  is_favorite: boolean;
};

type GrammarItem = {
  id: string;
  title: string;
  explanation: string;
  examples: string[];
  notes: string;
};

type LessonFile = {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
} | null;

type QuizInfo = {
  id: string;
  questionCount: number;
  createdAt: string;
} | null;

type QuizAttempt = {
  id: string;
  score: number;
  total_questions: number;
  time_seconds: number | null;
  created_at: string;
};

type Props = {
  lesson: {
    id: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    status: string;
  };
  vocabularies: VocabItem[];
  grammarNotes: GrammarItem[];
  lessonFile: LessonFile;
  quizInfo: QuizInfo;
  quizHistory: QuizAttempt[];
};

export function LessonDetailClient({ lesson, vocabularies, grammarNotes, lessonFile, quizInfo, quizHistory }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"vocab" | "grammar">("vocab");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGrammar, setExpandedGrammar] = useState<string | null>(null);
  const [isGenerating, startGenerate] = useTransition();

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

  // Filter vocabularies
  const filteredVocab = vocabularies.filter(v =>
    v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [localLearned, setLocalLearned] = useState<Record<string, boolean>>({});

  const getIsLearned = (v: VocabItem) => localLearned[v.id] ?? v.is_learned;
  const learnedCount = vocabularies.filter(v => getIsLearned(v)).length;
  const favoriteCount = vocabularies.filter(v => v.is_favorite).length;

  function handleToggleLearned(vocabId: string, currentLearned: boolean) {
    const next = !currentLearned;
    setLocalLearned(prev => ({ ...prev, [vocabId]: next }));
    toggleVocabLearned(vocabId, next).catch(console.error);
  }

  const difficultyColor = (d: string) => {
    if (d === "easy") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    if (d === "medium") return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
    return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6 px-4">
      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          onClick={() => router.push("/lessons")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/lessons" className="hover:text-foreground transition-colors">Lessons</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{lesson.title}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{lesson.title}</h1>
              <Badge
                variant="outline"
                tone={lesson.status === "published" ? "green" : lesson.status === "draft" ? "amber" : "neutral"}
                className="flex-shrink-0"
              >
                {lesson.status}
              </Badge>
            </div>
            {lesson.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{lesson.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(lesson.date).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              {lesson.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs rounded-md bg-secondary/50">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Quiz CTA */}
          <Button
            onClick={handleGenerateQuiz}
            disabled={isGenerating || lesson.status === "draft"}
            className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all font-semibold gap-2 cursor-pointer px-6 flex-shrink-0"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate & Play Quiz"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Vocabulary" value={vocabularies.length} color="blue" />
        <StatCard icon={Brain} label="Grammar" value={grammarNotes.length} color="indigo" />
        <StatCard icon={CheckCircle2} label="Learned" value={learnedCount} color="emerald" />
        <StatCard icon={Star} label="Favorites" value={favoriteCount} color="amber" />
      </div>

      {/* File info + Quiz info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lessonFile && (
          <Card className="border-black/5 dark:border-white/10 bg-white dark:bg-[#0f0f13] rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Paperclip className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{lessonFile.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  Uploaded {new Date(lessonFile.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {quizInfo && (
          <Card className="border-black/5 dark:border-white/10 bg-white dark:bg-[#0f0f13] rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{quizInfo.questionCount} questions</p>
                  <p className="text-xs text-muted-foreground">
                    Generated {new Date(quizInfo.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl cursor-pointer"
                onClick={() => router.push(`/lessons/${lesson.id}/quiz`)}
              >
                Play Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs: Vocab / Grammar */}
      <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("vocab")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "vocab"
              ? "bg-white dark:bg-white/10 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Vocabulary ({vocabularies.length})
        </button>
        <button
          onClick={() => setActiveTab("grammar")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "grammar"
              ? "bg-white dark:bg-white/10 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Brain className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Grammar ({grammarNotes.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "vocab" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vocabulary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl bg-white dark:bg-white/[0.03] border-black/10 dark:border-white/10"
            />
          </div>

          {/* Vocab Table */}
          {filteredVocab.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No vocabulary found</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0f0f13]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_100px_80px] sm:grid-cols-[1fr_1fr_120px_100px_80px] gap-3 px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Word</span>
                <span>Meaning</span>
                <span className="hidden sm:block">Category</span>
                <span>Level</span>
                <span className="text-center">Status</span>
              </div>
              {/* Rows */}
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {filteredVocab.map((v) => (
                  <div
                    key={v.id}
                    className="grid grid-cols-[1fr_1fr_100px_80px] sm:grid-cols-[1fr_1fr_120px_100px_80px] gap-3 px-4 py-3.5 items-center hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm text-foreground truncate">{v.word}</p>
                        <button
                          type="button"
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(v.word);
                            utterance.lang = "en-US";
                            utterance.rate = 0.85;
                            speechSynthesis.speak(utterance);
                          }}
                          className="flex-shrink-0 p-0.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          title="Pronounce"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {v.ipa && <p className="text-xs text-muted-foreground font-mono">{v.ipa}</p>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{v.meaning}</p>
                      {v.part_of_speech && (
                        <p className="text-xs text-muted-foreground italic">{v.part_of_speech}</p>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      {v.category && (
                        <Badge variant="secondary" className="text-[10px] rounded-md bg-secondary/50 truncate max-w-full">
                          {v.category}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${difficultyColor(v.difficulty)}`}>
                        {v.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleToggleLearned(v.id, getIsLearned(v)); }}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        title={getIsLearned(v) ? "Mark as not learned" : "Mark as learned"}
                      >
                        {getIsLearned(v)
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <XCircle className="w-4 h-4 text-muted-foreground/30 hover:text-emerald-400" />
                        }
                      </button>
                      {v.is_favorite && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "grammar" && (
        <div className="space-y-3">
          {grammarNotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No grammar notes found</p>
            </div>
          ) : (
            grammarNotes.map((g) => (
              <Card
                key={g.id}
                className="border-black/5 dark:border-white/10 bg-white dark:bg-[#0f0f13] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedGrammar(expandedGrammar === g.id ? null : g.id)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground truncate">{g.title}</h3>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                    expandedGrammar === g.id ? "rotate-180" : ""
                  }`} />
                </button>
                {expandedGrammar === g.id && (
                  <CardContent className="pt-0 pb-4 px-4 space-y-3 animate-in slide-in-from-top-1 fade-in duration-200">
                    <div className="pl-11 space-y-3">
                      {/* Explanation */}
                      <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {g.explanation}
                      </div>
                      {/* Examples */}
                      {g.examples.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Examples</p>
                          {g.examples.map((ex: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2 rounded-lg">
                              <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>
                              <span className="text-foreground/85">{ex}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Notes */}
                      {g.notes && (
                        <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-200/50 dark:border-amber-500/10">
                          <strong>Note:</strong> {g.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Quiz History */}
      {quizHistory.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Quiz History
            </h3>
            {quizHistory.length > 0 && (() => {
              const best = Math.max(...quizHistory.map(a => Math.round((a.score / a.total_questions) * 100)));
              return (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  best >= 90 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : best >= 70 ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                }`}>
                  Best: {best}%
                </span>
              );
            })()}
          </div>
          <div className="rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0f0f13]">
            <div className="grid grid-cols-[1fr_100px_80px] sm:grid-cols-[1fr_120px_100px_80px] gap-3 px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Date</span>
              <span className="hidden sm:block">Score</span>
              <span>Result</span>
              <span className="text-right">Time</span>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {quizHistory.map((a) => {
                const pct = Math.round((a.score / a.total_questions) * 100);
                const mins = a.time_seconds ? Math.floor(a.time_seconds / 60) : 0;
                const secs = a.time_seconds ? a.time_seconds % 60 : 0;
                return (
                  <div key={a.id} className="grid grid-cols-[1fr_100px_80px] sm:grid-cols-[1fr_120px_100px_80px] gap-3 px-4 py-3 items-center">
                    <span className="text-sm text-foreground">
                      {new Date(a.created_at).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-sm font-semibold text-foreground hidden sm:block">{a.score}/{a.total_questions}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md w-fit ${
                      pct >= 90 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : pct >= 70 ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        : pct >= 50 ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                    }`}>
                      {pct}%
                    </span>
                    <span className="text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {mins}m {secs}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Stat Card sub-component ---
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <Card className="border-black/5 dark:border-white/10 bg-white dark:bg-[#0f0f13] rounded-2xl">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
