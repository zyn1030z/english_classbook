"use client";

import * as React from "react";
import { BookOpen, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signInWithEmail, signUpWithEmail } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function AuthCard({ message }: { message?: string }) {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("[Google OAuth] Error:", error.message);
      setIsGoogleLoading(false);
    }
    // If no error, browser will redirect to Google
  }

  return (
    <Card className="w-full max-w-md shadow-xl transition-all duration-300 dark:border-white/10 dark:bg-[#161616]">
      <CardHeader className="space-y-1">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
          <BookOpen className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in to your notebook" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {mode === "signin" 
            ? "Enter your email and password to access your notebook" 
            : "Get started by creating a free learning account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive font-medium border border-destructive/20">
            {message}
          </p>
        ) : null}

        {mode === "signin" ? (
          <form action={signInWithEmail} className="space-y-3">
            <Input name="email" type="email" placeholder="Email address" required className="h-10 dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
            <Input name="password" type="password" placeholder="Password" required minLength={6} className="h-10 dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
            <Button className="w-full h-10 font-medium" type="submit">
              Sign in
            </Button>
          </form>
        ) : (
          <form action={signUpWithEmail} className="space-y-3">
            <Input name="email" type="email" placeholder="Email address" required className="h-10 dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
            <Input name="password" type="password" placeholder="Password" required minLength={6} className="h-10 dark:border-white/10 dark:bg-black/20 focus-visible:ring-primary/50" />
            <Button className="w-full h-10 font-medium" type="submit" variant="default">
              Create account
            </Button>
          </form>
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-10"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
            )}
            Google
          </Button>
          <Button variant="outline" className="h-10" disabled>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="hover:text-primary underline underline-offset-4 font-medium transition-colors"
            >
              Don&apos;t have an account? Sign up
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="hover:text-primary underline underline-offset-4 font-medium transition-colors"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
