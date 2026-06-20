"use client";

import * as React from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function AuthCard({ message }: { message?: string }) {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);

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
  }

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <div className="lg:hidden mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <BookOpen className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to sign in
        </p>
      </div>

      {/* Error Message */}
      {message && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
          {message}
        </div>
      )}

      {/* Form */}
      <div className="grid gap-6">
        <form 
          action={(formData) => {
            setIsEmailLoading(true);
            signInWithEmail(formData).finally(() => setIsEmailLoading(false));
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isEmailLoading || isGoogleLoading}
                required
                className="h-10"
              />
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                  Password
                </label>
              </div>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                disabled={isEmailLoading || isGoogleLoading}
                required
                minLength={6}
                className="h-10"
              />
            </div>
            <Button 
              className="h-10 w-full mt-2" 
              disabled={isEmailLoading || isGoogleLoading}
              type="submit"
            >
              {isEmailLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          disabled={isGoogleLoading || isEmailLoading}
          onClick={handleGoogleLogin}
          className="h-10 w-full"
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Google
        </Button>
      </div>

      {/* Footer */}
      <p className="px-8 text-center text-sm text-muted-foreground">
        By clicking sign in, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
