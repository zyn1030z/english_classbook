import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface RecentLesson {
 id: string;
 title: string;
 description: string;
 status: string;
}

export function RecentLessons({ lessons }: { lessons: RecentLesson[] }) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Recent lessons</CardTitle>
 <CardDescription>Your latest imported and created lessons.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {lessons.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-6 text-center">
 <BookOpen className="h-8 w-8 text-muted-foreground/30 mb-2" />
 <p className="text-sm text-muted-foreground">No lessons yet. Create your first lesson!</p>
 </div>
 ) : (
 <div className="flex flex-col">
 {lessons.map((lesson) => (
 <Link 
 key={lesson.id} 
 href={`/lessons/${lesson.id}`} 
 className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
 >
 <div className="flex items-center gap-4">
 <BookOpen className="h-4 w-4 text-muted-foreground" />
 <div>
 <p className="font-medium text-sm leading-none">{lesson.title}</p>
 <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1 max-w-[200px] sm:max-w-[300px]">
 {lesson.description || "No description provided."}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <Badge 
 variant="secondary"
 className="hidden sm:inline-flex"
 >
 {lesson.status}
 </Badge>
 <ChevronRight className="h-4 w-4 text-muted-foreground" />
 </div>
 </Link>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 );
}
