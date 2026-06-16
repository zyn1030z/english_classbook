import { SpeakingPractice } from "@/features/speaking/components/speaking-practice";

export default function SpeakingPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Speaking practice</p>
        <h1 className="mt-1 text-3xl font-semibold">Record, replay, and improve fluency</h1>
      </section>
      <SpeakingPractice />
    </div>
  );
}
