import { Outlet } from "react-router-dom";
import { LabSidebar } from "@/components/layout/lab-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function Layout() {
  return (
    <SidebarProvider className="h-svh overflow-hidden bg-background text-foreground">
      <LabSidebar />
      <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
