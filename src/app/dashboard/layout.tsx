import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}