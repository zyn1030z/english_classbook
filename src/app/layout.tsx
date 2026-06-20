import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/shared/query-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
 title: "English Learning Notebook",
 description: "AI-powered notebook for English lessons, vocabulary, flashcards, grammar, speaking, and analytics."
};

async function getServerTheme(): Promise<string | undefined> {
 if (!hasSupabaseConfig()) return undefined;
 try {
 const { createClient } = await import("@/lib/supabase/server");
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return undefined;
 const { data } = await supabase
 .from("users")
 .select("theme_preference")
 .eq("id", user.id)
 .single();
 return data?.theme_preference || undefined;
 } catch {
 return undefined;
 }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 const serverTheme = await getServerTheme();

 return (
 <html lang="en" suppressHydrationWarning>
 <body suppressHydrationWarning>
 <ThemeProvider serverTheme={serverTheme}>
 <QueryProvider>{children}</QueryProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
