"use client";

import { Bell, ChevronRight, Menu, Moon, Search, Sun, User, LogOut, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/hooks/use-sidebar";
import { demoUser } from "@/lib/utils/demo-data";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  lessons: "Lessons",
  vocabulary: "Vocabulary",
  flashcards: "Flashcards",
  grammar: "Grammar",
  speaking: "Speaking",
  analytics: "Analytics"
};

export function AppHeader() {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const { toggleMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<{
    name: string;
    email: string;
    englishLevel: string;
  } | null>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const isDark = mounted && resolvedTheme === "dark";

  React.useEffect(() => {
    setMounted(true);
    
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Load user profile
    if (!hasSupabaseConfig()) {
      setUserProfile({
        name: demoUser.name,
        email: demoUser.email,
        englishLevel: demoUser.englishLevel,
      });
    } else {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from("users")
            .select("name, email, english_level")
            .eq("id", user.id)
            .single()
            .then(({ data: profile }) => {
              setUserProfile({
                name: profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
                email: user.email || "",
                englishLevel: profile?.english_level || "A2",
              });
            });
        }
      });
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate breadcrumbs based on pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment) => {
    const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href: `/${segment}` };
  });

  // Initials for avatar
  const initials = userProfile
    ? userProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur md:px-6">
      
      {/* Left side: Toggle button on Mobile & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="hidden items-center space-x-1.5 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              <span className={cn(
                "transition-colors",
                idx === breadcrumbs.length - 1 ? "text-foreground font-semibold" : "hover:text-foreground"
              )}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right side: Search, Theme Toggle, Notification & Profile */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden min-w-0 md:block md:w-60 lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input className="h-9 pl-9 pr-4 text-xs bg-muted/30 border-border/60 hover:bg-muted/50 focus:bg-background transition-all" placeholder="Search lessons, words, grammar..." />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground border border-border/60 hover:bg-accent hover:text-foreground transition-all duration-200"
          >
            {initials}
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-border/80 bg-popover p-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-50 transition-all duration-200">
              <div className="px-3 py-2 border-b border-border/60">
                <p className="text-xs font-semibold text-foreground truncate">{userProfile?.name || "Loading..."}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userProfile?.email || ""}</p>
                <div className="mt-1.5 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Level {userProfile?.englishLevel || "A2"}
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setIsProfileOpen(false); window.location.href = "/profile"; }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Profile Settings</span>
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <Settings className="h-3.5 w-3.5" />
                  <span>System Preferences</span>
                </button>
              </div>
              <div className="border-t border-border/60 py-1">
                <button
                  onClick={async () => {
                    if (hasSupabaseConfig()) {
                      const supabase = createClient();
                      await supabase.auth.signOut();
                    }
                    window.location.href = "/login";
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
