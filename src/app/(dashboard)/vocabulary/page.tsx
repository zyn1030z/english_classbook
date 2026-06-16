import { VocabularyCards } from "@/features/vocabulary/components/vocabulary-cards";
import { VocabularyTable } from "@/features/vocabulary/components/vocabulary-table";

export default function VocabularyPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Vocabulary</p>
        <h1 className="mt-1 text-3xl font-semibold">Search, review, and pronounce words</h1>
      </section>
      <VocabularyCards />
      <VocabularyTable />
    </div>
  );
}
