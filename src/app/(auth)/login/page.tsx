import { AuthCard } from "@/features/auth/components/auth-card";
import { BookOpen, Sparkles, Brain, Trophy, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* Top right anchor - Right section */}
      <Link
        href="/"
        className="absolute right-4 top-4 md:right-8 md:top-8 z-50 text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to website
      </Link>

      {/* Left section - Branding/Marketing */}
      <div className="relative hidden h-full flex-col bg-zinc-950 p-10 text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950" />
        
        {/* Decorative glow elements */}
        <div className="absolute -left-[20%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-blue-500/10 blur-[120px]" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-zinc-950/20" />
        
        <div className="relative z-20 flex items-center gap-2 text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          English Classbook
        </div>

        {/* Center the marketing copy */}
        <div className="relative z-20 flex flex-1 flex-col justify-center">
          <div className="space-y-6 max-w-[420px]">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Master English faster with AI-powered personalized learning.
            </h2>
            <div className="space-y-4 text-zinc-300">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p>Smart flashcards that adapt to your memory</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                  <Brain className="h-4 w-4" />
                </div>
                <p>Interactive grammar and vocabulary practices</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                  <Trophy className="h-4 w-4" />
                </div>
                <p>Track your progress and build streaks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2 border-l-2 border-primary pl-4">
            <p className="text-lg text-zinc-300">
              "This platform completely changed how I learn English. The AI feedback is like having a personal tutor available 24/7."
            </p>
            <footer className="text-sm text-zinc-400">Sofia Davis, Student</footer>
          </blockquote>
        </div>
      </div>

      {/* Right section - Login Form */}
      <div className="p-4 lg:p-8 flex items-center justify-center h-full bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <AuthCard message={params.message} />
        </div>
      </div>
    </div>
  );
}
