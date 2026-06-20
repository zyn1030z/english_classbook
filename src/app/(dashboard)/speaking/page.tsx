import { SpeakingLab } from "@/features/speaking/components/speaking-lab";
import { getSpeakingPrompts, getShadowingSentences, getRoleplayScenarios } from "@/features/speaking/actions";

export default async function SpeakingPage() {
 const { questions } = await getSpeakingPrompts();
 const { sentences } = await getShadowingSentences();
 const { scenarios } = await getRoleplayScenarios();

 return (
 <div className="space-y-6">
 <section>
 <p className="text-sm text-muted-foreground">Practice & improve fluency</p>
 <h1 className="mt-1 text-3xl font-bold tracking-tight">Speaking Lab</h1>
 </section>
 <SpeakingLab 
 questions={questions} 
 shadowingSentences={sentences} 
 roleplayScenarios={scenarios} 
 />
 </div>
 );
}
