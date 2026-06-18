"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, FileUp, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLesson } from "@/features/lessons/actions";
import { cn } from "@/lib/utils/cn";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2 font-medium">
      {pending ? (
        <Sparkles className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {pending ? "Creating..." : "Create lesson"}
    </Button>
  );
}

export function LessonForm() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [vocabLimit, setVocabLimit] = React.useState(10);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = () => {
    setTimeout(() => {
      setSelectedFile(null);
      setVocabLimit(10);
      formRef.current?.reset();
      setIsExpanded(false);
    }, 100);
  };

  return (
    <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md overflow-hidden transition-all duration-300">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Add new lesson</h3>
            <p className="text-xs text-muted-foreground">Import a file or create manually</p>
          </div>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-300",
          isExpanded && "rotate-180"
        )} />
      </button>

      {/* Collapsible content */}
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <CardContent className="pt-0 pb-5">
            <form
              ref={formRef}
              action={async (formData: FormData) => { await createLesson(formData); }}
              onSubmit={handleFormSubmit}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="title" placeholder="Lesson title" required className="dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
                <Input name="tags" placeholder="Tags separated by commas" className="dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
              </div>
              <Textarea name="description" placeholder="What did this lesson cover?" rows={2} className="dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50 resize-none" />

              <div className="flex flex-wrap items-end gap-4">
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
                  <SelectTrigger aria-label="Lesson status" className="w-[140px] dark:border-white/10 dark:bg-black/20 focus:ring-primary/50">
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

                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
