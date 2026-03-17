'use client';

import { Home, BookOpen, TrendingUp, Award } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import type { NavItem } from '@/components/layout/app-sidebar';

const agentNavigation: NavItem[] = [
  { title: 'My Learning', href: '/dashboard/agent', icon: Home },
  { title: 'My Courses', href: '/dashboard/agent/courses', icon: BookOpen },
  { title: 'Progress', href: '/dashboard/agent/progress', icon: TrendingUp },
  { title: 'Certifications', href: '/dashboard/agent/certifications', icon: Award },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navigation={agentNavigation}>{children}</DashboardShell>;
}
