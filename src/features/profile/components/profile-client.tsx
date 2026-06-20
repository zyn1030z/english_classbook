"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
 User, Mail, GraduationCap, Target, Calendar, BookOpen,
 Brain, Sparkles, Save, Loader2, CheckCircle2, Flame,
 Sun, Moon, Monitor, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateUserProfile, saveThemePreference } from "@/features/profile/actions";
import { AchievementGallery } from "@/features/profile/components/achievement-gallery";

type ProfileData = {
 name: string;
 email: string;
 englishLevel: string;
 learningGoal: string;
 themePreference: string;
 streakCount: number;
 createdAt: string;
 stats: {
 vocabCount: number;
 lessonCount: number;
 quizCount: number;
 bestQuizScore: number;
 flashcardMastered: number;
 totalReviews: number;
 };
};

const LEVELS = [
 { value: "A1", label: "A1 · Beginner", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
 { value: "A2", label: "A2 · Elementary", color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
 { value: "B1", label: "B1 · Intermediate", color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
 { value: "B2", label: "B2 · Upper-Int", color: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" },
];

export function ProfileClient({ profile }: { profile: ProfileData }) {
 const { theme, setTheme } = useTheme();
 const [isPending, startTransition] = useTransition();
 const [saved, setSaved] = useState(false);
 const [name, setName] = useState(profile.name);
 const [level, setLevel] = useState(profile.englishLevel);
 const [goal, setGoal] = useState(profile.learningGoal);
 const [quizCount, setQuizCount] = useState(30);
 const prefsRef = useRef<HTMLDivElement>(null);

 // Auto-scroll to preferences section if hash is #preferences
 useEffect(() => {
 if (window.location.hash === "#preferences" && prefsRef.current) {
 setTimeout(() => prefsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
 }
 }, []);

 const handleSave = () => {
 const formData = new FormData();
 formData.set("name", name);
 formData.set("englishLevel", level);
 formData.set("learningGoal", goal);
 startTransition(async () => {
 const res = await updateUserProfile(formData);
 if (res.ok) {
 setSaved(true);
 // Reload after brief feedback so header dropdown updates
 setTimeout(() => window.location.reload(), 800);
 } else {
 alert("Update failed: " + res.message);
 }
 });
 };

 const initials = name
 .split(" ")
 .map((n) => n[0])
 .join("")
 .toUpperCase()
 .slice(0, 2);

 const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
 month: "long",
 year: "numeric",
 });

 return (
 <div className="mx-auto max-w-3xl space-y-6 py-6 px-4">
 {/* Header */}
 <section>
 <p className="text-sm text-muted-foreground">Account settings</p>
 <h1 className="mt-1 text-3xl font-bold tracking-tight">Profile</h1>
 </section>

 {/* Profile Card */}
 <Card className=" rounded-2xl overflow-hidden">
 {/* Gradient banner */}
 <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 relative">
 <div className="absolute -bottom-10 left-6">
 <div className="w-20 h-20 rounded-2xl bg-card shadow-xl flex items-center justify-center text-2xl font-bold text-primary border-4 border-white dark:border-[#0f0f13]">
 {initials}
 </div>
 </div>
 </div>
 <CardContent className="pt-14 pb-6 px-6">
 <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
 <div>
 <h2 className="text-xl font-bold text-foreground">{name}</h2>
 <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
 <Mail className="w-3.5 h-3.5" />
 {profile.email}
 </div>
 <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
 <Calendar className="w-3.5 h-3.5" />
 Member since {memberSince}
 </div>
 </div>
 <div className="flex items-center gap-2">
 {LEVELS.find((l) => l.value === level) && (
 <span className={`text-xs font-bold px-3 py-1 rounded-lg ${LEVELS.find((l) => l.value === level)?.color}`}>
 {LEVELS.find((l) => l.value === level)?.label}
 </span>
 )}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Stats */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatCard icon={BookOpen} label="Lessons" value={profile.stats.lessonCount} color="blue" />
 <StatCard icon={Brain} label="Words" value={profile.stats.vocabCount} color="indigo" />
 <StatCard icon={Sparkles} label="Quizzes" value={profile.stats.quizCount} color="emerald" />
 <StatCard icon={Flame} label="Streak" value={profile.streakCount} color="amber" suffix=" days" />
 </div>

 {/* Edit Form */}
 <Card className=" rounded-2xl">
 <CardContent className="p-6 space-y-5">
 <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Personal Information</h3>

 <div className="space-y-4">
 {/* Name */}
 <div className="space-y-1.5">
 <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground">
 <User className="w-4 h-4 text-muted-foreground" />
 Display Name
 </label>
 <Input
 id="name"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border-black/10 focus-visible:ring-primary/30"
 />
 </div>

 {/* Email (read-only) */}
 <div className="space-y-1.5">
 <label className="flex items-center gap-2 text-sm font-medium text-foreground">
 <Mail className="w-4 h-4 text-muted-foreground" />
 Email
 </label>
 <Input
 value={profile.email}
 disabled
 className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border-black/10 opacity-60"
 />
 <p className="text-[11px] text-muted-foreground">Email cannot be changed</p>
 </div>

 {/* English Level */}
 <div className="space-y-2">
 <label className="flex items-center gap-2 text-sm font-medium text-foreground">
 <GraduationCap className="w-4 h-4 text-muted-foreground" />
 English Level
 </label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 {LEVELS.map((l) => (
 <button
 key={l.value}
 type="button"
 onClick={() => setLevel(l.value)}
 className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2 ${
 level === l.value
 ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm"
 : "border-transparent bg-black/[0.02] dark:bg-white/[0.03] text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
 }`}
 >
 {l.label}
 </button>
 ))}
 </div>
 </div>

 {/* Learning Goal */}
 <div className="space-y-1.5">
 <label htmlFor="goal" className="flex items-center gap-2 text-sm font-medium text-foreground">
 <Target className="w-4 h-4 text-muted-foreground" />
 Learning Goal
 </label>
 <Textarea
 id="goal"
 value={goal}
 onChange={(e) => setGoal(e.target.value)}
 placeholder="e.g., Pass IELTS 7.0, Improve speaking fluency, Read English novels..."
 rows={3}
 className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border-black/10 resize-none focus-visible:ring-primary/30"
 />
 </div>
 </div>

 {/* Save Button */}
 <div className="flex items-center gap-3 pt-2">
 <Button
 onClick={handleSave}
 disabled={isPending}
 className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all font-semibold gap-2 px-6 cursor-pointer"
 >
 {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
 {isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
 </Button>
 {saved && (
 <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-300">
 Profile updated
 </span>
 )}
 </div>
 </CardContent>
 </Card>

 {/* System Preferences */}
 <div ref={prefsRef} id="preferences">
 <Card className=" rounded-2xl">
 <CardContent className="p-6 space-y-6">
 <div className="flex items-center gap-2">
 <Settings className="w-4 h-4 text-muted-foreground" />
 <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System Preferences</h3>
 </div>

 {/* Theme */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Appearance</label>
 <div className="grid grid-cols-3 gap-2">
 {[
 { value: "light", label: "Light", icon: Sun },
 { value: "dark", label: "Dark", icon: Moon },
 { value: "system", label: "System", icon: Monitor },
 ].map((t) => (
 <button
 key={t.value}
 type="button"
 onClick={() => {
 setTheme(t.value);
 saveThemePreference(t.value).catch(console.error);
 }}
 className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2 ${
 theme === t.value
 ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm"
 : "border-transparent bg-black/[0.02] dark:bg-white/[0.03] text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
 }`}
 >
 <t.icon className="w-4 h-4" />
 {t.label}
 </button>
 ))}
 </div>
 </div>

 {/* Quiz Count */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Default Quiz Questions</label>
 <p className="text-xs text-muted-foreground">Number of questions generated per quiz</p>
 <div className="grid grid-cols-3 gap-2">
 {[10, 20, 30].map((n) => (
 <button
 key={n}
 type="button"
 onClick={() => setQuizCount(n)}
 className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2 ${
 quizCount === n
 ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm"
 : "border-transparent bg-black/[0.02] dark:bg-white/[0.03] text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
 }`}
 >
 {n} questions
 </button>
 ))}
 </div>
 </div>

 {/* Keyboard Shortcuts hint */}
 <div className="pt-2 border-t dark:border-white/5">
 <p className="text-xs text-muted-foreground">💡 Tip: Use the moon/sun icon in the header bar for quick theme switching.</p>
 </div>
 </CardContent>
 </Card>

 {/* Achievements */}
 <Card className=" rounded-2xl">
 <CardContent className="p-6">
 <AchievementGallery
 stats={{
 ...profile.stats,
 streakCount: profile.streakCount,
 }}
 />
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

function StatCard({ icon: Icon, label, value, color, suffix = "" }: { icon: any; label: string; value: number; color: string; suffix?: string }) {
 const colorMap: Record<string, string> = {
 blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
 indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
 emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
 amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
 };
 return (
 <Card className=" rounded-2xl">
 <CardContent className="p-4 flex items-center gap-3">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
 <Icon className="w-5 h-5" />
 </div>
 <div>
 <p className="text-2xl font-bold text-foreground tracking-tight">{value}{suffix}</p>
 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
 </div>
 </CardContent>
 </Card>
 );
}
