"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ArrowRight, Flag, RefreshCcw, Trophy, Zap, ChevronLeft, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveQuizAttempt } from "@/features/lessons/actions";

type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuizQuestion = {
  id: string;
  content: string;
  type: string;
  correctAnswer: string;
  explanation: string;
  options: QuizOption[];
};

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function QuizClient({ 
  quizId, 
  lessonId, 
  questions 
}: { 
  quizId: string; 
  lessonId: string; 
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const startTimeRef = useRef(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isFinished = currentIndex >= questions.length;
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isFinished) {
      // Calculate elapsed time
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      // Save attempt (only once)
      if (!hasSaved) {
        setHasSaved(true);
        saveQuizAttempt(quizId, lessonId, score, questions.length, elapsed).catch(console.error);
      }

      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const handleCheck = () => {
    if (!selectedOptionId) return;
    
    const isCorrect = currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setIsChecked(true);
  };

  const handleNext = () => {
    setIsChecked(false);
    setSelectedOptionId(null);
    setCurrentIndex(prev => prev + 1);
  };

  // --- FINISHED SCREEN ---
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const grade = percentage >= 90 ? "Outstanding!" : percentage >= 70 ? "Great job!" : percentage >= 50 ? "Good effort!" : "Keep practicing!";
    const gradeColor = percentage >= 90 ? "text-emerald-600 dark:text-emerald-400" : percentage >= 70 ? "text-blue-600 dark:text-blue-400" : percentage >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";

    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-8 animate-in fade-in duration-500 h-full px-4">
        {/* Trophy icon */}
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <Trophy className="w-14 h-14 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <Check className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Quiz Complete!</h1>
          <p className={`text-xl font-bold ${gradeColor}`}>{grade}</p>
        </div>
        
        {/* Score ring */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8" className="text-black/5 dark:text-white/5" />
            <circle cx="80" cy="80" r="70" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
              style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <div className="text-5xl font-black text-foreground">{percentage}%</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">{score}/{questions.length}</div>
          </div>
        </div>

        {/* Time elapsed */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</span>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-2xl shadow-sm px-6 h-12 font-semibold cursor-pointer border-black/10" 
            onClick={() => router.push("/lessons")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button 
            size="lg" 
            className="rounded-2xl shadow-md px-6 h-12 font-semibold cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white" 
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setIsChecked(false);
              setSelectedOptionId(null);
              setHasSaved(false);
              startTimeRef.current = Date.now();
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Play Again
          </Button>
        </div>
      </div>
    );
  }

  const progress = Math.round((currentIndex / questions.length) * 100);
  const isCurrentCorrect = currentQuestion?.options?.find(o => o.id === selectedOptionId)?.isCorrect;

  return (
    <div className="flex flex-col flex-1 h-full min-h-[500px]">
      {/* Header: close + progress + counter */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 cursor-pointer transition-colors" 
          onClick={() => router.push("/lessons")}
        >
          <X className="w-5 h-5" />
        </Button>
        
        {/* Progress bar */}
        <div className="flex-1 relative h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground tabular-nums">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-foreground">{currentIndex + 1}</span>
          <span>/</span>
          <span>{questions.length}</span>
        </div>
      </div>

      {/* Question Content — centered */}
      <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col justify-center space-y-8 mb-8 px-1">
        <div className="space-y-4">
          <Badge className="uppercase tracking-widest text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 rounded-lg shadow-none">
            {currentQuestion?.type || "Question"}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
            {currentQuestion?.content || "Loading question..."}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion?.options?.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const label = OPTION_LABELS[idx] || String(idx + 1);
            
            let containerClass = "";
            let labelBgClass = "";
            let iconNode: React.ReactNode = null;
            
            if (isChecked) {
              if (option.isCorrect) {
                containerClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/30";
                labelBgClass = "bg-emerald-500 text-white";
                iconNode = <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4 text-white" /></div>;
              } else if (isSelected && !option.isCorrect) {
                containerClass = "border-rose-500 bg-rose-50 dark:bg-rose-500/10 ring-2 ring-rose-500/30";
                labelBgClass = "bg-rose-500 text-white";
                iconNode = <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0"><X className="w-4 h-4 text-white" /></div>;
              } else {
                containerClass = " dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] opacity-50";
                labelBgClass = "bg-black/5 dark:bg-white/10 text-muted-foreground";
              }
            } else if (isSelected) {
              containerClass = "border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/25 shadow-md shadow-blue-500/5";
              labelBgClass = "bg-blue-500 text-white";
            } else {
              containerClass = "border-black/10 bg-white dark:bg-white/[0.03] hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 hover:shadow-md";
              labelBgClass = "bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400";
            }

            return (
              <button 
                key={option.id}
                type="button"
                className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer ${containerClass} ${isChecked ? 'pointer-events-none' : ''}`}
                onClick={() => !isChecked && setSelectedOptionId(option.id)}
              >
                {/* Label */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors ${labelBgClass}`}>
                  {label}
                </div>
                {/* Text */}
                <span className="font-semibold text-[15px] sm:text-base leading-snug text-foreground flex-1">{option.text}</span>
                {/* Result icon */}
                {iconNode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className={`mt-auto p-5 sm:p-6 rounded-t-3xl border-t-2 transition-all duration-500 ease-in-out ${
        isChecked 
          ? (isCurrentCorrect 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' 
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60') 
          : 'bg-white dark:bg-[#0c0c14] dark:border-white/5 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.3)]'
      }`}>
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            {isChecked && (
              <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className={`font-black text-xl sm:text-2xl mb-2 tracking-tight ${
                  isCurrentCorrect 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {isCurrentCorrect ? 'Excellent!' : 'Correct answer:'}
                </div>
                {!isCurrentCorrect && (
                  <div className="text-lg sm:text-xl font-bold mb-3 text-foreground">
                    {currentQuestion?.options?.find(o => o.isCorrect)?.text}
                  </div>
                )}
                <div className="flex items-start gap-3 text-sm sm:text-[15px] bg-white/60 dark:bg-black/20 backdrop-blur-sm p-4 rounded-xl border dark:border-white/5 shadow-sm text-foreground/80">
                  <Flag className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" />
                  <span className="leading-relaxed">{currentQuestion?.explanation}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto self-end">
            {!isChecked ? (
              <Button 
                size="lg" 
                className="w-full sm:w-52 h-14 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                disabled={!selectedOptionId}
                onClick={handleCheck}
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                size="lg" 
                className={`w-full sm:w-52 h-14 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-white cursor-pointer ${
                  isCurrentCorrect 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
                onClick={handleNext}
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
