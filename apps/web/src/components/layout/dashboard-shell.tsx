'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar, type NavItem } from './app-sidebar';
import { Separator } from '@/components/ui/separator';

interface DashboardShellProps {
  navigation: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({ navigation, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar navigation={navigation} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm text-muted-foreground">SalesTrack Academy</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
