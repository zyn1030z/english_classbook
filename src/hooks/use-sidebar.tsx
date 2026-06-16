"use client";

import * as React from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isOpenMobile: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleMobile: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = React.useState<boolean>(false);

  // Load initial state from localStorage on client side
  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  };

  const setOpenMobile = (open: boolean) => {
    setIsOpenMobile(open);
  };

  const toggleSidebar = () => {
    setCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsOpenMobile(!isOpenMobile);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isOpenMobile,
        setCollapsed,
        setOpenMobile,
        toggleSidebar,
        toggleMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
