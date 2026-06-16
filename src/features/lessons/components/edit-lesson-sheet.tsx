"use client";

import { useState, useTransition } from "react";
import { Edit2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLesson } from "@/features/lessons/actions";
import type { Lesson } from "@/types";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function EditLessonSheet({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateLesson(lesson.id, formData);
      if (result?.ok) {
        setOpen(false);
      } else {
        alert("Cập nhật thất bại: " + result?.message);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault(); // Tránh Dropdown đóng ngay lập tức làm mất event mở Sheet
            setOpen(true);
          }}
          className="gap-2 cursor-pointer"
        >
          <Edit2 className="h-4 w-4 text-muted-foreground" /> Edit lesson
        </DropdownMenuItem>
      </SheetTrigger>
      
      <SheetContent className="sm:max-w-[450px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle>Edit Lesson</SheetTitle>
          <SheetDescription>
            Cập nhật lại thông tin của bài học này. File đính kèm sẽ không bị ảnh hưởng.
          </SheetDescription>
        </SheetHeader>
        
        <form action={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Lesson title</label>
            <Input 
              id="title" 
              name="title" 
              defaultValue={lesson.title} 
              required 
              className="focus-visible:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={lesson.description} 
              rows={4}
              className="resize-none focus-visible:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">Tags (comma separated)</label>
            <Input 
              id="tags" 
              name="tags" 
              defaultValue={lesson.tags.join(", ")} 
              className="focus-visible:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <Select name="status" defaultValue={lesson.status}>
              <SelectTrigger className="focus:ring-primary/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <SheetFooter className="pt-4 mt-6 border-t border-border/50">
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full sm:w-auto shadow-md"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
