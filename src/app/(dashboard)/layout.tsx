"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/hooks/use-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 return (
 <SidebarProvider>
 <div className="min-h-screen bg-background">
 <div className="flex items-start">
 <Sidebar />
 <div className="min-w-0 flex-1 flex flex-col min-h-screen transition-all duration-300">
 <AppHeader />
 <main className="flex-1 w-full px-4 py-6 md:px-6">
 {children}
 </main>
 </div>
 </div>
 </div>
 </SidebarProvider>
 );
}
