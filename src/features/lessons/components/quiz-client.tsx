"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ArrowRight, Flag, RefreshCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const isFinished = currentIndex >= questions.length;
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isFinished) {
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

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-8 animate-in fade-in duration-500 h-full">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Quiz Complete! 🎉</h1>
          <p className="text-xl text-muted-foreground">You scored {score} out of {questions.length}</p>
        </div>
        
        <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-primary/20 bg-primary/5 shadow-inner">
          <div className="text-5xl font-black text-primary">{percentage}%</div>
        </div>

        <div className="flex gap-4 pt-8">
          <Button size="lg" variant="outline" className="rounded-xl shadow-sm" onClick={() => router.push("/lessons")}>
            Back to Lessons
          </Button>
          <Button size="lg" className="rounded-xl shadow-md" onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setIsChecked(false);
            setSelectedOptionId(null);
          }}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Play Again
          </Button>
        </div>
      </div>
    );
  }

  const progress = Math.round((currentIndex / questions.length) * 100);

  return (
    <div className="flex flex-col flex-1 h-full min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => router.push("/lessons")}>
          <X className="w-6 h-6" />
        </Button>
        <Progress value={progress} className="h-3.5 flex-1 bg-muted shadow-inner" />
      </div>

      {/* Question Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col justify-center space-y-8 mb-8">
        <div className="space-y-4">
          <Badge variant="outline" className="uppercase tracking-widest text-primary border-primary/30 shadow-sm bg-primary/5">
            {currentQuestion?.type || "Question"}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            {currentQuestion?.content || "Loading question..."}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {currentQuestion?.options?.map((option) => {
            const isSelected = selectedOptionId === option.id;
            let stateClass = "border-border hover:border-primary/40 hover:bg-primary/5 hover:shadow-md";
            
            if (isChecked) {
              if (option.isCorrect) {
                stateClass = "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 ring-2 ring-green-500/20";
              } else if (isSelected && !option.isCorrect) {
                stateClass = "border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive/20";
              } else {
                stateClass = "border-border opacity-50 bg-muted/30";
              }
            } else if (isSelected) {
              stateClass = "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm";
            }

            return (
              <Card 
                key={option.id}
                className={`p-5 cursor-pointer transition-all duration-300 border-2 ${stateClass}`}
                onClick={() => !isChecked && setSelectedOptionId(option.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-lg leading-snug">{option.text}</span>
                  {isChecked && option.isCorrect && <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/50"><Check className="w-5 h-5 text-green-600 dark:text-green-400" /></div>}
                  {isChecked && isSelected && !option.isCorrect && <div className="p-1 rounded-full bg-destructive/10"><X className="w-5 h-5 text-destructive" /></div>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer / Actions - Fixed at bottom */}
      <div className={`mt-auto p-4 sm:p-6 rounded-t-3xl border-t transition-all duration-500 ease-in-out ${isChecked ? (currentQuestion?.options?.find(o => o.id === selectedOptionId)?.isCorrect ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50') : 'bg-card border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)]'}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            {isChecked && (
              <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className={`font-black text-2xl mb-2 tracking-tight ${currentQuestion?.options?.find(o => o.id === selectedOptionId)?.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {currentQuestion?.options?.find(o => o.id === selectedOptionId)?.isCorrect ? 'Excellent! 🎉' : 'Correct answer:'}
                </div>
                {!currentQuestion?.options?.find(o => o.id === selectedOptionId)?.isCorrect && (
                  <div className="text-xl font-bold mb-3 text-foreground/90">
                    {currentQuestion?.options?.find(o => o.isCorrect)?.text}
                  </div>
                )}
                <div className="text-muted-foreground flex items-start gap-3 text-sm sm:text-base bg-background/60 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-sm">
                  <Flag className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="leading-relaxed">{currentQuestion?.explanation}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto self-end">
            {!isChecked ? (
              <Button 
                size="lg" 
                className="w-full sm:w-48 h-14 rounded-2xl font-bold text-lg shadow-lg hover:-translate-y-1 transition-all"
                disabled={!selectedOptionId}
                onClick={handleCheck}
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                size="lg" 
                className={`w-full sm:w-48 h-14 rounded-2xl font-bold text-lg shadow-lg hover:-translate-y-1 transition-all ${currentQuestion?.options?.find(o => o.id === selectedOptionId)?.isCorrect ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-destructive hover:bg-destructive/90 text-white'}`}
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
