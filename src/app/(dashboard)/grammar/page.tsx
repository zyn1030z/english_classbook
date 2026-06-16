import { GrammarNotebook } from "@/features/grammar/components/grammar-notebook";

export default function GrammarPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Grammar notebook</p>
        <h1 className="mt-1 text-3xl font-semibold">Topic tree, notes, and examples</h1>
      </section>
      <GrammarNotebook />
    </div>
  );
}
