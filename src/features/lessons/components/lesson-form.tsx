"use client";

import * as React from "react";
import { ChevronDown, FileUp, Plus, Sparkles, Brain, BookOpen, Lightbulb, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createLesson } from "@/features/lessons/actions";
import { cn } from "@/lib/utils/cn";

const CREATE_TIPS = [
 { icon: Brain, text: "Đang tạo bài học mới..." },
 { icon: BookOpen, text: "AI đang đọc tài liệu..." },
 { icon: Lightbulb, text: "Đang trích xuất từ vựng..." },
 { icon: Sparkles, text: "Đang phân tích ngữ pháp..." },
 { icon: Wand2, text: "Sắp xong, đang lưu dữ liệu..." },
];

export function LessonForm() {
 const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
 const [vocabLimit, setVocabLimit] = React.useState(10);
 const [isOpen, setIsOpen] = React.useState(false);
 const [isCreating, startCreating] = React.useTransition();
 const formRef = React.useRef<HTMLFormElement>(null);

 // --- Creating overlay animation ---
 const [createProgress, setCreateProgress] = React.useState(0);
 const [tipIndex, setTipIndex] = React.useState(0);
 const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

 React.useEffect(() => {
 if (isCreating) {
 setCreateProgress(0);
 setTipIndex(0);
 const startTime = Date.now();
 intervalRef.current = setInterval(() => {
 const elapsed = (Date.now() - startTime) / 1000;
 const progress = Math.min(92, 100 * (1 - Math.exp(-elapsed / 12)));
 setCreateProgress(Math.round(progress));
 setTipIndex(Math.min(CREATE_TIPS.length - 1, Math.floor(elapsed / 5)));
 }, 200);
 } else {
 if (intervalRef.current) clearInterval(intervalRef.current);
 setCreateProgress(0);
 }
 return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
 }, [isCreating]);

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files.length > 0) {
 setSelectedFile(e.target.files[0]);
 }
 };

 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 const formData = new FormData(e.currentTarget);
 startCreating(async () => {
 await createLesson(formData);
 setSelectedFile(null);
 setVocabLimit(10);
 formRef.current?.reset();
 setIsOpen(false);
 });
 };

 return (
 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogTrigger asChild>
 <Button className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-4">
 <Plus className="h-4 w-4" />
 <span className="hidden sm:inline font-semibold">Add new lesson</span>
 <span className="sm:hidden font-semibold">Add</span>
 </Button>
 </DialogTrigger>
 
 <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 bg-background rounded-2xl shadow-2xl">
 <DialogHeader className="px-6 py-4 border-b bg-muted/30">
 <DialogTitle className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <Plus className="h-4 w-4" />
 </div>
 Create New Lesson
 </DialogTitle>
 </DialogHeader>

 <div className="relative">
 {/* Creating Overlay */}
 {isCreating && (
 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300 h-full w-full">
 <div className="relative mb-6">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 animate-pulse">
 {(() => { const TipIcon = CREATE_TIPS[tipIndex].icon; return <TipIcon className="w-7 h-7 text-white" />; })()}
 </div>
 <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
 <Sparkles className="w-3 h-3 text-white" />
 </div>
 </div>

 <div className="w-3/4 max-w-[200px] mb-3">
 <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
 <div 
 className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
 style={{ width: `${createProgress}%` }}
 />
 </div>
 </div>

 <p className="text-sm font-bold text-foreground mb-1">{createProgress}%</p>
 <p className="text-[13px] text-muted-foreground font-medium animate-in fade-in duration-500" key={tipIndex}>
 {CREATE_TIPS[tipIndex].text}
 </p>
 </div>
 )}

 <div className="p-6">
 <form
 ref={formRef}
 onSubmit={handleSubmit}
 className="space-y-4"
 >
 <div className="grid gap-4 md:grid-cols-2">
 <Input name="title" placeholder="Lesson title" required className=" dark:bg-black/20 focus-visible:ring-primary/50" />
 <Input name="tags" placeholder="Tags separated by commas" className=" dark:bg-black/20 focus-visible:ring-primary/50" />
 </div>
 <Textarea name="description" placeholder="What did this lesson cover?" rows={2} className=" dark:bg-black/20 focus-visible:ring-primary/50 resize-none" />

 <div className="flex flex-wrap items-end gap-4 mt-2">
 <div className="flex-1 min-w-[200px] space-y-2">
 <div className="flex justify-between text-xs font-medium text-muted-foreground">
 <span>Vocabulary Limit</span>
 <span className="text-primary font-semibold">{vocabLimit} words</span>
 </div>
 <input
 type="range"
 min="5"
 max="100"
 step="5"
 value={vocabLimit}
 onChange={(e) => setVocabLimit(Number(e.target.value))}
 className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none dark:bg-white/10"
 />
 <input type="hidden" name="vocabLimit" value={vocabLimit} />
 </div>

 <Select name="status" defaultValue="draft">
 <SelectTrigger aria-label="Lesson status" className="w-[140px] dark:bg-black/20 focus:ring-primary/50">
 <SelectValue placeholder="Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="draft">Draft</SelectItem>
 <SelectItem value="published">Published</SelectItem>
 <SelectItem value="archived">Archived</SelectItem>
 </SelectContent>
 </Select>

 <input
 type="file"
 name="file"
 accept=".pdf,.docx,.txt"
 className="hidden"
 id="file-upload"
 onChange={handleFileChange}
 />
 <Button
 type="button"
 variant="outline"
 onClick={() => document.getElementById("file-upload")?.click()}
 className="max-w-[180px] truncate gap-2"
 >
 <FileUp className="h-4 w-4 shrink-0" />
 <span className="truncate">{selectedFile ? selectedFile.name : "Upload file"}</span>
 </Button>

 <Button type="submit" disabled={isCreating} className="gap-2 font-medium bg-primary w-full sm:w-auto">
 {isCreating ? (
 <Sparkles className="h-4 w-4 animate-spin" />
 ) : (
 <Plus className="h-4 w-4" />
 )}
 {isCreating ? "Creating..." : "Create lesson"}
 </Button>
 </div>
 </form>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}
