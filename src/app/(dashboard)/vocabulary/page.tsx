"use client";

import * as React from "react";
import { VocabularyTable } from "@/features/vocabulary/components/vocabulary-table";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { vocabularies as demoVocabularies } from "@/lib/utils/demo-data";
import { toggleVocabularyFavorite, toggleVocabularyLearned } from "@/features/vocabulary/actions";
import type { Vocabulary } from "@/types";

export default function VocabularyPage() {
  const [vocabularies, setVocabularies] = React.useState<Vocabulary[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!hasSupabaseConfig()) {
      setVocabularies(demoVocabularies);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("vocabularies")
          .select(`
            *,
            example_sentences (*),
            lessons (title)
          `)
          .eq("user_id", user.id)
          .then(({ data, error }) => {
            if (!error && data) {
              const formatted: Vocabulary[] = data.map((v: any) => ({
                id: v.id,
                userId: v.user_id,
                lessonId: v.lesson_id,
                lesson: v.lessons ? { title: v.lessons.title } : undefined,
                word: v.word,
                meaning: v.meaning,
                ipa: v.ipa || "",
                partOfSpeech: v.part_of_speech || "",
                category: v.category || "",
                difficulty: v.difficulty,
                isLearned: v.is_learned,
                isFavorite: v.is_favorite,
                examples: v.example_sentences?.map((e: any) => ({
                  id: e.id,
                  vocabularyId: e.vocabulary_id,
                  sentence: e.sentence,
                  translation: e.translation || "",
                  difficulty: e.difficulty
                })) || []
              }));
              setVocabularies(formatted);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleToggleFavorite = async (id: string) => {
    const target = vocabularies.find((v) => v.id === id);
    if (!target) return;

    const newFavorite = !target.isFavorite;
    setVocabularies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isFavorite: newFavorite } : v))
    );

    if (hasSupabaseConfig()) {
      await toggleVocabularyFavorite(id, newFavorite);
    }
  };

  const handleToggleLearned = async (id: string) => {
    const target = vocabularies.find((v) => v.id === id);
    if (!target) return;

    const newLearned = !target.isLearned;
    setVocabularies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isLearned: newLearned } : v))
    );

    if (hasSupabaseConfig()) {
      await toggleVocabularyLearned(id, newLearned);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading vocabulary...</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Vocabulary</p>
        <h1 className="mt-1 text-3xl font-semibold">Search, review, and pronounce words</h1>
      </section>
      <VocabularyTable
        vocabularies={vocabularies}
        onToggleFavorite={handleToggleFavorite}
        onToggleLearned={handleToggleLearned}
      />
    </div>
  );
}
