"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { EnhancedHeader } from "@/components/header";
import { useMounted } from "@/hooks/use-mount";



export default function HomeLayout({ children }) {
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col overflow-hidden">
            <EnhancedHeader />
            <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
