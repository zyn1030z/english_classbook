"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Type, Brain, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { globalSearch, type SearchResult } from "@/features/search/actions";

export function SearchCommand() {
 const router = useRouter();
 const [query, setQuery] = useState("");
 const [results, setResults] = useState<SearchResult | null>(null);
 const [isOpen, setIsOpen] = useState(false);
 const [isPending, startTransition] = useTransition();
 const containerRef = useRef<HTMLDivElement>(null);
 const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 // Debounced search
 useEffect(() => {
 if (debounceRef.current) clearTimeout(debounceRef.current);
 if (query.length < 2) {
 setResults(null);
 setIsOpen(false);
 return;
 }
 debounceRef.current = setTimeout(() => {
 startTransition(async () => {
 const res = await globalSearch(query);
 setResults(res);
 setIsOpen(true);
 });
 }, 300);
 return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
 }, [query]);

 // Close on click outside
 useEffect(() => {
 const handler = (e: MouseEvent) => {
 if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
 setIsOpen(false);
 }
 };
 document.addEventListener("mousedown", handler);
 return () => document.removeEventListener("mousedown", handler);
 }, []);

 // Close on ESC
 useEffect(() => {
 const handler = (e: KeyboardEvent) => {
 if (e.key === "Escape") setIsOpen(false);
 };
 document.addEventListener("keydown", handler);
 return () => document.removeEventListener("keydown", handler);
 }, []);

 const navigate = (href: string) => {
 setIsOpen(false);
 setQuery("");
 router.push(href);
 };

 const totalResults = results
 ? results.lessons.length + results.vocabularies.length + results.grammarNotes.length
 : 0;

 return (
 <div ref={containerRef} className="relative hidden min-w-0 md:block md:w-60 lg:w-72">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
 {isPending && (
 <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60 animate-spin" />
 )}
 <Input
 className="h-9 pl-9 pr-9 text-xs bg-muted/30 border-border/60 hover:bg-muted/50 focus:bg-background transition-all"
 placeholder="Search lessons, words, grammar..."
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 onFocus={() => { if (results && totalResults > 0) setIsOpen(true); }}
 />

 {/* Dropdown Results */}
 {isOpen && results && (
 <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-border/80 bg-popover shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto">
 {totalResults === 0 ? (
 <div className="px-4 py-6 text-center text-xs text-muted-foreground">
 No results for &ldquo;{query}&rdquo;
 </div>
 ) : (
 <>
 {/* Lessons */}
 {results.lessons.length > 0 && (
 <div>
 <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-black/[0.02] dark:bg-white/[0.02]">
 Lessons
 </div>
 {results.lessons.map((l) => (
 <button
 key={l.id}
 onClick={() => navigate(`/lessons/${l.id}`)}
 className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-accent transition-colors cursor-pointer"
 >
 <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
 <div className="min-w-0">
 <p className="text-xs font-semibold text-foreground truncate">{l.title}</p>
 {l.description && <p className="text-[10px] text-muted-foreground truncate">{l.description}</p>}
 </div>
 </button>
 ))}
 </div>
 )}

 {/* Vocabularies */}
 {results.vocabularies.length > 0 && (
 <div>
 <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-black/[0.02] dark:bg-white/[0.02]">
 Vocabulary
 </div>
 {results.vocabularies.map((v) => (
 <button
 key={v.id}
 onClick={() => navigate(`/vocabulary`)}
 className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-accent transition-colors cursor-pointer"
 >
 <Type className="w-4 h-4 text-emerald-500 flex-shrink-0" />
 <div className="min-w-0">
 <p className="text-xs font-semibold text-foreground truncate">{v.word}</p>
 <p className="text-[10px] text-muted-foreground truncate">{v.meaning}</p>
 </div>
 </button>
 ))}
 </div>
 )}

 {/* Grammar Notes */}
 {results.grammarNotes.length > 0 && (
 <div>
 <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-black/[0.02] dark:bg-white/[0.02]">
 Grammar
 </div>
 {results.grammarNotes.map((g) => (
 <button
 key={g.id}
 onClick={() => navigate(`/grammar`)}
 className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-accent transition-colors cursor-pointer"
 >
 <Brain className="w-4 h-4 text-indigo-500 flex-shrink-0" />
 <div className="min-w-0">
 <p className="text-xs font-semibold text-foreground truncate">{g.title}</p>
 </div>
 </button>
 ))}
 </div>
 )}
 </>
 )}
 </div>
 )}
 </div>
 );
}
