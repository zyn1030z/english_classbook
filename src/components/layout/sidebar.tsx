"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Mic2,
  PenTool,
  X
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSidebar } from "@/hooks/use-sidebar";

const menuGroups = [
  {
    title: "General",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/analytics", label: "Analytics", icon: BarChart3 }
    ]
  },
  {
    title: "Learning",
    items: [
      { href: "/lessons", label: "Lessons", icon: FileText },
      { href: "/vocabulary", label: "Vocabulary", icon: BookOpen },
      { href: "/flashcards", label: "Flashcards", icon: Layers },
      { href: "/grammar", label: "Grammar", icon: Brain },
      { href: "/speaking", label: "Speaking", icon: Mic2 },
      { href: "/writing", label: "Writing", icon: PenTool }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isOpenMobile, toggleSidebar, setOpenMobile } = useSidebar();

  const sidebarContent = (
    <div className={cn(
      "flex h-full flex-col bg-card border-r border-border/60 transition-all duration-300",
      "fixed left-0 top-0 h-screen z-30",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-border/60 px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <p className="text-sm font-semibold truncate leading-none">English Notebook</p>
              <p className="mt-1 text-[10px] text-muted-foreground truncate leading-none">AI Study workspace</p>
            </div>
          )}
        </div>
        {isOpenMobile && (
          <button
            onClick={() => setOpenMobile(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                {group.title}
              </p>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      className={cn(
                        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200 relative",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      {!isCollapsed && (
                        <span className="truncate transition-all duration-200">{item.label}</span>
                      )}
                    </Link>

                    {/* Custom HTML/CSS Tooltip when collapsed */}
                    {isCollapsed && (
                      <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 rounded-md bg-popover border border-border/80 px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-all duration-200 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 z-50">
                        {item.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Toggle Button */}
      <div className="hidden border-t border-border/60 p-3 md:block">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-full items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : (
            <div className="flex items-center gap-2 text-sm font-medium">
              <ChevronLeft className="h-4.5 w-4.5" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block shrink-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div className={cn(
        "fixed inset-0 z-50 bg-background/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
        isOpenMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={() => setOpenMobile(false)}>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden",
            isOpenMobile ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
