import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DailyQuest } from "@/types";
import Link from "next/link";
import { CheckCircle2, Circle, Target, BookOpen, BrainCircuit, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DailyQuestsProps {
  quests: DailyQuest[];
}

export function DailyQuests({ quests }: DailyQuestsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "review_flashcards": return <BrainCircuit className="h-5 w-5" />;
      case "add_vocabulary": return <BookOpen className="h-5 w-5" />;
      case "take_quiz": return <Target className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getActionUrl = (type: string) => {
    switch (type) {
      case "review_flashcards": return "/flashcards";
      case "add_vocabulary": return "/flashcards";
      case "take_quiz": return "/lessons";
      default: return "/dashboard";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Nhiệm vụ hàng ngày
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {quests.filter(q => q.isCompleted).length}/{quests.length}
          </span>
        </CardTitle>
        <CardDescription>Hoàn thành các nhiệm vụ này để duy trì chuỗi học tập của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {quests.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Bạn không có nhiệm vụ nào hôm nay.</p>
        )}
        {quests.map((quest) => {
          const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100));
          return (
            <Link
              key={quest.id}
              href={getActionUrl(quest.type)}
              className={cn(
                "group flex gap-3 p-3 -mx-3 rounded-xl transition-all hover:bg-accent/50",
                quest.isCompleted && "opacity-60 hover:opacity-100"
              )}
            >
              <div className="mt-0.5 text-primary shrink-0 transition-transform group-hover:scale-110">
                {quest.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-medium leading-none flex items-center gap-1.5 group-hover:text-primary transition-colors">
                      {getIcon(quest.type)}
                      <span className={cn(quest.isCompleted && "line-through")}>{quest.title}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{quest.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      {quest.progress} / {quest.target}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                  </div>
                </div>
                <Progress value={progressPercent} className="h-2 mt-2" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
