"use client";

import * as React from "react";
import { Loader2, ArrowRight, Check, Copy, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { checkGrammarWithAI, type GrammarCorrection, type WritingFeedback, type WritingPrompt } from "@/features/writing/actions";

export function WritingLab({ prompts }: { prompts: WritingPrompt[] }) {
  const [selectedPrompt, setSelectedPrompt] = React.useState<WritingPrompt>(prompts[0]);
  const [text, setText] = React.useState("");
  const [isChecking, setIsChecking] = React.useState(false);
  const [feedback, setFeedback] = React.useState<WritingFeedback | null>(null);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleCheck = async () => {
    if (wordCount < 3) {
      setError("Please write at least 3 words.");
      return;
    }
    setError("");
    setIsChecking(true);
    setFeedback(null);

    const result = await checkGrammarWithAI(text, selectedPrompt.title);
    if (result.ok && result.data) {
      setFeedback(result.data);
    } else {
      setError(result.message || "Failed to analyze text.");
    }
    setIsChecking(false);
  };

  const handleReset = () => {
    setFeedback(null);
    setError("");
  };

  const copyNativeVersion = () => {
    if (feedback?.native_version) {
      navigator.clipboard.writeText(feedback.native_version);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderHighlightedText = () => {
    if (!feedback || feedback.corrections.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed text-lg">{text}</p>;
    }

    let parts: { text: string; correction?: GrammarCorrection }[] = [{ text: text }];

    for (const corr of feedback.corrections) {
      const newParts = [];
      for (const p of parts) {
        if (p.correction) {
          newParts.push(p);
        } else {
          const idx = p.text.indexOf(corr.original);
          if (idx !== -1) {
            newParts.push({ text: p.text.substring(0, idx) });
            newParts.push({ text: corr.original, correction: corr });
            newParts.push({ text: p.text.substring(idx + corr.original.length) });
          } else {
            newParts.push(p);
          }
        }
      }
      parts = newParts;
    }

    return (
      <p className="whitespace-pre-wrap leading-relaxed text-lg">
        {parts.map((part, i) => {
          if (!part.correction) return <span key={i}>{part.text}</span>;

          return (
            <Popover key={i}>
              <PopoverTrigger asChild>
                <span className="cursor-pointer border-b-2 border-red-500 font-medium text-red-500/90 hover:bg-red-500/10 transition-colors pb-0.5">
                  {part.text}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 space-y-3 rounded-xl border-red-500/20 shadow-xl bg-background" sideOffset={8}>
                <div className="flex gap-2 items-start">
                  <div className="mt-0.5 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Change to: <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">{part.correction.replacement}</span></p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{part.correction.explanation}</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </p>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Prompt Selector & Instructions */}
      {!feedback && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-muted/20 dark:bg-white/5 p-4 rounded-2xl border">
          <Select
            value={selectedPrompt.id}
            onValueChange={(val) => {
              const p = prompts.find(p => p.id === val);
              if (p) setSelectedPrompt(p);
            }}
          >
            <SelectTrigger className="w-[240px] shrink-0 h-10 bg-background">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {prompts.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-4 py-1">
            {selectedPrompt.description}
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {feedback && feedback.analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 rounded-2xl border bg-card shadow-sm text-center space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</p>
            <p className="text-3xl font-black text-primary">{feedback.analytics.score}</p>
          </div>
          <div className="p-4 rounded-2xl border bg-card shadow-sm text-center space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tone</p>
            <p className="text-xl font-bold mt-2">{feedback.analytics.tone}</p>
          </div>
          <div className="p-4 rounded-2xl border bg-card shadow-sm text-center space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CEFR Level</p>
            <p className="text-3xl font-black text-blue-500">{feedback.analytics.cefr_level}</p>
          </div>
          <div className="p-4 rounded-2xl border bg-card shadow-sm flex flex-col items-center justify-center space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advanced Words</p>
            <div className="flex flex-wrap justify-center gap-1">
              {feedback.analytics.advanced_words?.length > 0 ? (
                feedback.analytics.advanced_words.slice(0, 3).map((w, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] truncate max-w-[80px]">{w}</Badge>
                ))
              ) : (
                <span className="text-sm font-medium text-muted-foreground/50">None detected</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col transition-all">
        <div className="p-4 border-b dark:border-white/5 flex items-center justify-between bg-muted/20 dark:bg-white/[0.02]">
          <div className="text-sm font-medium">Grammar Check</div>
          <div className="text-xs font-medium text-muted-foreground">{wordCount} words</div>
        </div>

        <div className="p-6 relative min-h-[300px]">
          {!feedback ? (
            <textarea
              className="w-full h-full min-h-[250px] resize-none bg-transparent border-none focus:ring-0 text-lg leading-relaxed placeholder:text-muted-foreground/50 outline-none"
              placeholder="Start writing or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isChecking}
              autoFocus
            />
          ) : (
            <div className="min-h-[250px] p-2 bg-transparent rounded-lg">
              {renderHighlightedText()}
            </div>
          )}

          {/* Checking Overlay */}
          {isChecking && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-b-2xl">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 text-primary font-medium animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing text...
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-muted/10 dark:bg-black/20 border-t dark:border-white/5 flex items-center justify-between">
          <div className="text-sm text-red-500 font-medium">
            {error && error}
            {feedback && feedback.corrections.length === 0 && <span className="text-emerald-500">No grammar issues found! ✨</span>}
            {feedback && feedback.corrections.length > 0 && <span>Found {feedback.corrections.length} issues. Click red words to fix.</span>}
          </div>
          
          <div>
            {!feedback ? (
              <Button 
                onClick={handleCheck} 
                disabled={isChecking || wordCount === 0}
                size="lg"
                className="rounded-full font-bold px-8"
              >
                Check Grammar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleReset} 
                variant="outline"
                size="lg"
                className="rounded-full font-bold px-8"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Edit Text
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Native Version Card */}
      {feedback && feedback.native_version && (
        <div className="rounded-2xl border bg-emerald-500/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 border-b border-emerald-500/10 flex items-center justify-between bg-emerald-500/10">
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Native Version Suggestion</div>
            <Button variant="ghost" size="sm" onClick={copyNativeVersion} className="h-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="p-6">
            <p className="text-lg leading-relaxed italic text-foreground/90">
              "{feedback.native_version}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
