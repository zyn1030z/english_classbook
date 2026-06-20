import { WritingLab } from "@/features/writing/components/writing-lab";
import { getWritingPrompts } from "@/features/writing/actions";

export default async function WritingPage() {
 const { prompts } = await getWritingPrompts();

 return (
 <div className="space-y-6">
 <section>
 <p className="text-sm text-muted-foreground">Grammarly-style grammar checker</p>
 <h1 className="mt-1 text-3xl font-bold tracking-tight">Writing Lab</h1>
 </section>
 
 <WritingLab prompts={prompts} />
 </div>
 );
}
