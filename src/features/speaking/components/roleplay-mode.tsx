"use client";

import * as React from "react";
import { Mic, Square, Loader2, Bot, User, MessageCircle, AlertTriangle, Lightbulb, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMediaRecorder } from "@/hooks/use-media-recorder";
import { playPronunciation } from "@/lib/utils/speech";
import { chatWithAI } from "@/features/speaking/actions";
import type { RoleplayScenario, RoleplayMessage } from "@/features/speaking/actions";

export function RoleplayMode({ scenarios }: { scenarios: RoleplayScenario[] }) {
 const [scenario, setScenario] = React.useState<RoleplayScenario>(scenarios[0]);
 const [messages, setMessages] = React.useState<RoleplayMessage[]>([]);
 const [isAiTyping, setIsAiTyping] = React.useState(false);
 const [transcript, setTranscript] = React.useState("");
 const [error, setError] = React.useState("");
 
 const { isRecording, start, stop } = useMediaRecorder();
 const recognitionRef = React.useRef<any>(null);
 const chatEndRef = React.useRef<HTMLDivElement>(null);

 // Initialize conversation
 React.useEffect(() => {
 if (scenario) {
 setMessages([{ role: "ai", content: scenario.firstMessage }]);
 playPronunciation(scenario.firstMessage);
 }
 }, [scenario]);

 // Auto-scroll
 React.useEffect(() => {
 chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, isAiTyping, transcript]);

 const startRecording = React.useCallback(async () => {
 setTranscript("");
 setError("");
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

 const cancelRecording = React.useCallback(() => {
 stop();
 recognitionRef.current?.stop();
 setTranscript("");
 setError("");
 }, [stop]);

 const stopRecording = React.useCallback(async () => {
 stop();
 recognitionRef.current?.stop();
 
 if (!transcript.trim()) return;

 // Add user message
 const newMessages: RoleplayMessage[] = [...messages, { role: "user", content: transcript }];
 setMessages(newMessages);
 setTranscript("");
 setIsAiTyping(true);

 // Call AI
 const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
 const result = await chatWithAI(apiMessages, scenario);
 
 setIsAiTyping(false);
 if (result.ok && result.responseMessage) {
 setMessages([...newMessages, { 
 role: "ai", 
 content: result.responseMessage,
 feedback: result.feedback 
 }]);
 playPronunciation(result.responseMessage);
 } else {
 setError(result.message || "Failed to get AI response.");
 }
 }, [stop, transcript, messages, scenario]);

 if (!scenario) return null;

 return (
 <div className="grid gap-5 lg:grid-cols-[280px_1fr] items-start h-[calc(100vh-160px)] min-h-[600px]">
 {/* Sidebar: Scenario Selection */}
 <Card className=" shadow-md rounded-2xl h-full flex flex-col">
 <div className="p-4 border-b dark:border-white/5 font-bold text-sm">Select Scenario</div>
 <div className="p-3 flex-1 overflow-y-auto space-y-2">
 {scenarios.map(s => (
 <button
 key={s.id}
 onClick={() => setScenario(s)}
 className={`w-full text-left p-3 rounded-xl transition-all ${
 scenario.id === s.id 
 ? "bg-primary/10 border-primary/20 border text-primary" 
 : "hover:bg-muted/50 border border-transparent text-muted-foreground"
 }`}
 >
 <p className="font-bold text-sm mb-1">{s.title}</p>
 <p className="text-xs opacity-70 line-clamp-2">{s.description}</p>
 </button>
 ))}
 </div>
 </Card>

 {/* Main Chat Area */}
 <Card className=" shadow-md rounded-2xl h-full flex flex-col overflow-hidden relative">
 {/* Header */}
 <div className="flex items-center gap-3 px-6 py-4 border-b dark:border-white/5 bg-muted/20 dark:bg-white/[0.02]">
 <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
 <Bot className="h-5 w-5" />
 </div>
 <div>
 <h3 className="font-bold text-sm">{scenario.title}</h3>
 <p className="text-xs text-muted-foreground">AI Roleplay Partner</p>
 </div>
 </div>

 {/* Chat Messages */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6">
 {messages.map((m, i) => (
 <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
 <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
 m.role === "user" ? "bg-primary text-primary-foreground" : "bg-blue-500/10 text-blue-500"
 }`}>
 {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
 </div>
 
 <div className={`flex flex-col gap-1 max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"}`}>
 <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
 m.role === "user" 
 ? "bg-primary text-primary-foreground rounded-tr-sm" 
 : "bg-muted/50 dark:bg-white/5 rounded-tl-sm"
 }`}>
 {m.content}
 </div>
 
 {m.feedback && (
 <div className="flex items-start gap-1.5 mt-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-xl text-xs max-w-sm">
 <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />
 <span>{m.feedback}</span>
 </div>
 )}
 </div>
 </div>
 ))}
 
 {transcript && (
 <div className="flex gap-3 flex-row-reverse">
 <div className="h-8 w-8 rounded-full bg-primary/50 text-primary-foreground flex items-center justify-center shrink-0">
 <User className="h-4 w-4" />
 </div>
 <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed bg-primary/20 text-primary rounded-tr-sm opacity-70">
 {transcript}
 <span className="ml-1 inline-block w-1.5 h-3.5 bg-primary animate-pulse" />
 </div>
 </div>
 )}

 {isAiTyping && (
 <div className="flex gap-3 flex-row">
 <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
 <Bot className="h-4 w-4" />
 </div>
 <div className="px-4 py-3 rounded-2xl bg-muted/50 dark:bg-white/5 rounded-tl-sm flex items-center gap-1.5">
 <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-bounce" />
 <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-bounce" style={{ animationDelay: "150ms" }} />
 <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-bounce" style={{ animationDelay: "300ms" }} />
 </div>
 </div>
 )}
 
 <div ref={chatEndRef} />
 </div>

 {error && (
 <div className="mx-6 mb-2 flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-2 rounded-lg">
 <AlertTriangle className="h-3.5 w-3.5" /> {error}
 </div>
 )}

 {/* Control Area */}
 <div className="p-4 bg-muted/10 dark:bg-black/20 border-t dark:border-white/5 flex justify-center gap-3">
 {isRecording ? (
 <>
 <Button 
 onClick={cancelRecording} 
 variant="outline" 
 size="icon"
 className="rounded-full h-12 w-12 border-red-500/30 text-red-500 hover:bg-red-500/10 shrink-0"
 title="Cancel & Retry"
 >
 <X className="h-5 w-5" />
 </Button>
 <Button 
 onClick={stopRecording} 
 variant="default" 
 size="lg"
 className="rounded-full w-48 h-12 bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse font-bold"
 >
 <Send className="h-5 w-5 mr-2" /> Send
 </Button>
 </>
 ) : (
 <Button 
 onClick={startRecording} 
 size="lg"
 disabled={isAiTyping}
 className="rounded-full w-48 h-12 font-bold shadow-md hover:shadow-lg transition-all"
 >
 <Mic className="h-5 w-5 mr-2" /> Tap to Speak
 </Button>
 )}
 </div>
 </Card>
 </div>
 );
}
