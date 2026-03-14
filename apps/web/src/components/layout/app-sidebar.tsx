'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface AppSidebarProps {
  navigation: NavItem[];
}

export function AppSidebar({ navigation }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const isAdmin = user?.role === 'ADMIN';

  return (
    <Sidebar className="sidebar-glow">
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="size-4.5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">SalesTrack</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Academy</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} className="flex items-center gap-2.5 w-full">
                        <item.icon className="size-4" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
          <Avatar className="size-8 ring-2 ring-background">
            <AvatarFallback className={`text-xs font-medium ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-tight">{user?.name}</p>
            <Badge
              variant={isAdmin ? 'default' : 'secondary'}
              className="text-[9px] h-3.5 px-1 mt-0.5"
            >
              {user?.role}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="shrink-0 size-8 text-muted-foreground hover:text-foreground">
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
