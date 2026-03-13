'use client';

import { BarChart3, BookOpen, Users, FolderOpen } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import type { NavItem } from '@/components/layout/app-sidebar';

const adminNavigation: NavItem[] = [
  { title: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  { title: 'Courses', href: '/dashboard/admin/courses', icon: BookOpen },
  { title: 'Users', href: '/dashboard/admin/users', icon: Users },
  { title: 'Groups', href: '/dashboard/admin/groups', icon: FolderOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navigation={adminNavigation}>{children}</DashboardShell>;
}
