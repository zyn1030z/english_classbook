"use client";

import * as React from "react";
import { BookOpen, Github, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function AuthCard({ message }: { message?: string }) {
 const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
 const [isFocused, setIsFocused] = React.useState<string | null>(null);

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
 <div className="relative w-full max-w-[420px]">
 {/* Animated glow border */}
 <div
 className="absolute -inset-[1px] rounded-3xl opacity-50 blur-[2px]"
 style={{
 background: "conic-gradient(from 0deg, hsl(220 70% 50%), hsl(260 55% 45%), hsl(200 60% 45%), hsl(220 70% 50%))",
 animation: "authBorderSpin 6s linear infinite",
 }}
 />

 {/* Card */}
 <div className="relative rounded-3xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/[0.06] shadow-2xl overflow-hidden">
 {/* Top accent line */}
 <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

 <div className="p-8 pt-7">
 {/* Header */}
 <div className="mb-7 text-center">
 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
 <BookOpen className="h-5 w-5 text-white" />
 </div>
 <h1 className="text-[22px] font-bold tracking-tight text-white">
 Welcome back
 </h1>
 <p className="mt-1.5 text-[13px] text-white/40 leading-relaxed">
 Sign in to continue your learning journey
 </p>
 </div>

 {/* Error message */}
 {message && (
 <div className="mb-5 rounded-xl bg-red-500/8 border border-red-500/15 px-4 py-2.5 text-[13px] text-red-400 font-medium animate-in fade-in-0 slide-in-from-top-2">
 {message}
 </div>
 )}

 {/* Google — primary CTA */}
 <Button
 className="w-full h-11 rounded-xl font-semibold text-[13px] bg-card hover:bg-white/90 text-[#1a1a2e] border-0 shadow-md shadow-white/5 hover:shadow-white/10 transition-all duration-300 gap-2.5 cursor-pointer mb-5"
 onClick={handleGoogleLogin}
 disabled={isGoogleLoading}
 >
 {isGoogleLoading ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : (
 <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
 </svg>
 )}
 Continue with Google
 </Button>

 {/* Divider */}
 <div className="relative mb-5">
 <div className="absolute inset-0 flex items-center">
 <span className="w-full border-t border-white/[0.06]" />
 </div>
 <div className="relative flex justify-center">
 <span className="bg-[#0c0c14] px-3 text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">or with email</span>
 </div>
 </div>

 {/* Email form */}
 <form action={signInWithEmail} className="space-y-3">
 <div className={`rounded-xl transition-all duration-200 ${isFocused === "email" ? "ring-1 ring-blue-500/30" : ""}`}>
 <label className="sr-only" htmlFor="login-email">Email</label>
 <Input
 id="login-email"
 name="email"
 type="email"
 placeholder="Email address"
 required
 autoComplete="email"
 onFocus={() => setIsFocused("email")}
 onBlur={() => setIsFocused(null)}
 className="h-11 rounded-xl border-white/[0.06] bg-white/[0.03] text-white text-[13px] placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-white/15 transition-all"
 />
 </div>
 <div className={`rounded-xl transition-all duration-200 ${isFocused === "password" ? "ring-1 ring-blue-500/30" : ""}`}>
 <label className="sr-only" htmlFor="login-password">Password</label>
 <Input
 id="login-password"
 name="password"
 type="password"
 placeholder="Password"
 required
 minLength={6}
 autoComplete="current-password"
 onFocus={() => setIsFocused("password")}
 onBlur={() => setIsFocused(null)}
 className="h-11 rounded-xl border-white/[0.06] bg-white/[0.03] text-white text-[13px] placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-white/15 transition-all"
 />
 </div>
 <Button
 type="submit"
 className="w-full h-11 rounded-xl font-semibold text-[13px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-lg shadow-blue-600/15 hover:shadow-blue-500/25 transition-all duration-300 gap-2 cursor-pointer"
 >
 Sign in <ArrowRight className="h-3.5 w-3.5" />
 </Button>
 </form>

 {/* Footer */}
 <p className="mt-6 text-center text-[11px] text-white/20 leading-relaxed">
 By signing in, you agree to our Terms of Service
 </p>
 </div>
 </div>

 <style>{`
 @keyframes authBorderSpin {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
 }
 `}</style>
 </div>
 );
}
