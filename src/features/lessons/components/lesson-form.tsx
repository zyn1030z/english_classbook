"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLesson } from "@/features/lessons/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Plus className="h-4 w-4" />
      {pending ? "Saving..." : "Create lesson"}
    </Button>
  );
}

export function LessonForm() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = () => {
    setTimeout(() => {
      setSelectedFile(null);
      formRef.current?.reset();
    }, 100);
  };

  return (
    <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md transition-colors">
      <CardHeader>
        <CardTitle>Add lesson</CardTitle>
        <CardDescription>Capture a class, video, article, or file import as a lesson.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={createLesson}
          onSubmit={handleFormSubmit}
          className="space-y-4"
        >
          <Input name="title" placeholder="Lesson title" required className="dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
          <Textarea name="description" placeholder="What did this lesson cover?" className="dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
          <Input name="tags" placeholder="Tags separated by commas" className="dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <Select name="status" defaultValue="draft">
              <SelectTrigger aria-label="Lesson status" className="dark:border-white/10 dark:bg-black/20 focus:ring-primary/50">
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
              className="max-w-[200px] truncate"
            >
              <FileUp className="h-4 w-4 shrink-0" />
              <span className="truncate">{selectedFile ? selectedFile.name : "Upload"}</span>
            </Button>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
