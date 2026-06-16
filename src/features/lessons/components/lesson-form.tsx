"use client";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add lesson</CardTitle>
        <CardDescription>Capture a class, video, article, or file import as a lesson.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createLesson} className="space-y-4">
          <Input name="title" placeholder="Lesson title" required />
          <Textarea name="description" placeholder="What did this lesson cover?" />
          <Input name="tags" placeholder="Tags separated by commas" />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <Select name="status" defaultValue="draft">
              <SelectTrigger aria-label="Lesson status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline">
              <FileUp className="h-4 w-4" />
              Upload
            </Button>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
