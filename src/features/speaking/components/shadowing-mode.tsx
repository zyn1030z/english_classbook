"use client";

import * as React from "react";
import { Mic, Square, Volume2, ChevronRight, Award, SkipForward, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMediaRecorder } from "@/hooks/use-media-recorder";
import { playPronunciation } from "@/lib/utils/speech";
import type { ShadowingSentence } from "@/features/speaking/actions";

function diffText(original: string, spoken: string) {
  const origWords = original.split(/\s+/);
  const spokenWords = spoken.toLowerCase().replace(/[^\w\s']/g, "").split(/\s+/);

  let correctCount = 0;
  const nodes = origWords.map((originalWord) => {
    const cleanOrig = originalWord.toLowerCase().replace(/[^\w\s']/g, "");
    const isCorrect = cleanOrig && spokenWords.includes(cleanOrig);
    if (isCorrect) correctCount++;
    return { word: originalWord, isCorrect };
  });

  const accuracy = origWords.length > 0 ? Math.round((correctCount / origWords.length) * 100) : 0;
  return { nodes, accuracy };
}

export function ShadowingMode({ sentences }: { sentences: ShadowingSentence[] }) {
  const [current, setCurrent] = React.useState(0);
  const [transcript, setTranscript] = React.useState("");
  const [evalResult, setEvalResult] = React.useState<{ nodes: any[]; accuracy: number } | null>(null);
  
  const { isRecording, audioUrl, start, stop } = useMediaRecorder();
  const recognitionRef = React.useRef<any>(null);

  const sentence = sentences[current];

  const startRecording = React.useCallback(async () => {
    setTranscript("");
    setEvalResult(null);

    await start();

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

  React.useEffect(() => {
    if (!isRecording && transcript && sentence) {
      setEvalResult(diffText(sentence.en, transcript));
    }
  }, [isRecording, transcript, sentence]);

  const nextSentence = () => {
    setCurrent((v) => (v + 1) % sentences.length);
    setTranscript("");
    setEvalResult(null);
  };

  if (!sentence) return null;

  return (
    <div className="space-y-5">
      <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 py-3 border-b dark:border-white/5 bg-muted/20 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Sentence {current + 1} of {sentences.length}</span>
              <Badge variant="outline" className="text-[10px] rounded-md">{sentence.difficulty}</Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 cursor-pointer" onClick={() => playPronunciation(sentence.en)}>
              <Volume2 className="h-3 w-3" /> Listen
            </Button>
          </div>

          <div className="px-6 py-8 space-y-4">
            {evalResult ? (
              <div className="flex flex-wrap gap-x-2 gap-y-3 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                {evalResult.nodes.map((n, i) => (
                  <span key={i} className={n.isCorrect ? "text-emerald-500" : "text-red-500"}>
                    {n.word}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-foreground drop-shadow-sm">
                {sentence.en}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground italic">{sentence.vi}</p>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {evalResult && (
              <div className="flex items-center gap-3 bg-muted/30 dark:bg-white/5 rounded-xl px-4 py-3 border dark:border-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Accuracy Score</p>
                  <p className="text-xs text-muted-foreground">Based on pronunciation match</p>
                </div>
                <div className="ml-auto">
                  <Badge
                    tone={evalResult.accuracy >= 80 ? "green" : evalResult.accuracy >= 50 ? "amber" : "red"}
                    className="text-lg font-bold px-3 py-1"
                  >
                    {evalResult.accuracy}%
                  </Badge>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3">
                <div className="flex gap-0.5 items-end h-5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 rounded-full bg-red-500" style={{ animation: `speaking-wave 0.8s ease-in-out ${i * 0.15}s infinite alternate`, height: "40%" }} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-red-500">Recording... Repeat the sentence clearly.</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {isRecording ? (
                <Button onClick={stopRecording} variant="destructive" className="gap-2 rounded-xl font-semibold">
                  <Square className="h-4 w-4" /> Stop
                </Button>
              ) : (
                <Button onClick={startRecording} className="gap-2 rounded-xl font-semibold">
                  <Mic className="h-4 w-4" /> Start Shadowing
                </Button>
              )}
              <Button variant="outline" onClick={nextSentence} className="gap-2 rounded-xl">
                <SkipForward className="h-4 w-4" /> Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <style jsx>{`
        @keyframes speaking-wave { from { height: 20%; } to { height: 100%; } }
      `}</style>
    </div>
  );
}
