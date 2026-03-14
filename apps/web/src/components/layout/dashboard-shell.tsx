'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar, type NavItem } from './app-sidebar';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';

interface DashboardShellProps {
  navigation: NavItem[];
  children: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  '/dashboard/admin/analytics': 'Analytics',
  '/dashboard/admin/courses': 'Courses',
  '/dashboard/admin/users': 'Users',
  '/dashboard/admin/groups': 'Groups',
  '/dashboard/agent': 'Dashboard',
  '/dashboard/agent/courses': 'My Courses',
  '/dashboard/agent/progress': 'Progress',
};

export function DashboardShell({ navigation, children }: DashboardShellProps) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || 'SalesTrack Academy';

  return (
    <SidebarProvider>
      <AppSidebar navigation={navigation} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 bg-background/60 backdrop-blur-sm sticky top-0 z-30">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <span className="text-sm font-medium">{pageTitle}</span>
        </header>
        <main className="flex-1 p-6 animate-page-in">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
