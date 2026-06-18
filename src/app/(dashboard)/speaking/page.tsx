import { SpeakingPractice } from "@/features/speaking/components/speaking-practice";
import { getSpeakingPrompts } from "@/features/speaking/actions";

export default async function SpeakingPage() {
  const { questions } = await getSpeakingPrompts();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Practice & improve fluency</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Speaking Lab</h1>
      </section>
      <SpeakingPractice questions={questions} />
    </div>
  );
}
