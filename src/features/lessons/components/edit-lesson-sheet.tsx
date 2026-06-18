import { useState, useTransition, useEffect } from "react";
import { Edit2, Loader2, Save, FileUp } from "lucide-react";
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
import { updateLesson, getLessonFile, reExtractVocabulary, uploadLessonFileAndExtract } from "@/features/lessons/actions";
import type { Lesson } from "@/types";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function EditLessonSheet({ lesson, open, onOpenChange }: { lesson: Lesson, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [isExtracting, startExtracting] = useTransition();
  const [vocabLimit, setVocabLimit] = useState(10);
  const [grammarLimit, setGrammarLimit] = useState(3);
  const [attachedFile, setAttachedFile] = useState<{ id: string; file_name: string } | null>(null);
  const [selectedNewFile, setSelectedNewFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      getLessonFile(lesson.id).then(setAttachedFile);
    }
  }, [open, lesson.id]);

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateLesson(lesson.id, formData);
      if (result?.ok) {
        onOpenChange(false);
      } else {
        alert("Cập nhật thất bại: " + result?.message);
      }
    });
  };

  const handleReExtract = () => {
    startExtracting(async () => {
      const result = await reExtractVocabulary(lesson.id, vocabLimit, grammarLimit);
      if (result.ok) {
        onOpenChange(false);
      } else {
        alert("Trích xuất lại thất bại: " + result.message);
      }
    });
  };

  const handleUploadNewFile = () => {
    if (!selectedNewFile) return;
    const formData = new FormData();
    formData.append("file", selectedNewFile);
    formData.append("vocabLimit", vocabLimit.toString());
    formData.append("grammarLimit", grammarLimit.toString());

    startExtracting(async () => {
      const result = await uploadLessonFileAndExtract(lesson.id, formData);
      if (result.ok && result.file) {
        setAttachedFile(result.file);
        setSelectedNewFile(null);
        onOpenChange(false);
      } else {
        alert("Upload và trích xuất thất bại: " + result.message);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      
      <SheetContent 
        className="sm:max-w-[450px] overflow-y-auto"
        onInteractOutside={(e) => {
          // Ngăn Sheet tự đóng khi mất focus (do mở hộp thoại chọn file của OS)
          e.preventDefault();
        }}
      >
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

          {attachedFile ? (
            <div className="rounded-xl border border-dashed border-border p-4 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <span>📎 Attached File:</span>
                <span className="text-foreground truncate font-semibold">{attachedFile.file_name}</span>
              </div>
              
              <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Grammar Limit</span>
                  <span className="text-primary font-semibold">{grammarLimit} topics</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={grammarLimit}
                  onChange={(e) => setGrammarLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none dark:bg-white/10"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleReExtract}
                disabled={isExtracting || isPending}
                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
              >
                {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>🪄</span>}
                {isExtracting ? "Extracting with AI..." : "Re-extract Vocab & Grammar"}
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/50 p-4 bg-muted/10 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">No document attached</p>
                <p className="text-xs text-muted-foreground">
                  Bài học này chưa có tài liệu. Tải lên tệp PDF để AI trích xuất từ vựng tự động.
                </p>
              </div>

              <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Grammar Limit</span>
                  <span className="text-primary font-semibold">{grammarLimit} topics</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={grammarLimit}
                  onChange={(e) => setGrammarLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none dark:bg-white/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  id={`file-upload-new-${lesson.id}`}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedNewFile(e.target.files[0]);
                    }
                  }}
                />
                <label
                  htmlFor={`file-upload-new-${lesson.id}`}
                  className="flex items-center justify-center w-full h-9 gap-2 border border-dashed border-muted-foreground/30 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  <FileUp className="h-4 w-4" />
                  <span className="truncate">{selectedNewFile ? selectedNewFile.name : "Chọn tệp tài liệu"}</span>
                </label>

                {selectedNewFile && (
                  <Button
                    type="button"
                    onClick={handleUploadNewFile}
                    disabled={isExtracting || isPending}
                    className="w-full gap-2"
                  >
                    {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>🪄</span>}
                    {isExtracting ? "Uploading & Extracting..." : "Upload & Extract"}
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <SheetFooter className="pt-4 mt-6 border-t border-border/50">
            <Button 
              type="submit" 
              disabled={isPending || isExtracting}
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
