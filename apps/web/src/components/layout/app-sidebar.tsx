'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { LogOut, GraduationCap, Camera, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import { useThumbnailUrl } from '@/hooks/use-thumbnail-url';
import { getUploadUrl, confirmUpload } from '@/lib/api/storage';
import { updateMyProfile } from '@/lib/api/users';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface AppSidebarProps {
  navigation: NavItem[];
}

function uploadAvatar(file: File, userId: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const { uploadUrl, key } = await getUploadUrl({
        fileName: file.name,
        contentType: file.type,
        entityType: 'user-avatar',
        entityId: userId,
      });

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          await confirmUpload(key);
          resolve(key);
        } else {
          reject(new Error('Upload failed'));
        }
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(file);
    } catch (err) {
      reject(err);
    }
  });
}

export function AppSidebar({ navigation }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const avatarUrl = useThumbnailUrl(user?.avatarUrl);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const isAdmin = user?.role === 'ADMIN';

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || uploading) return;

    if (file.size > MAX_AVATAR_SIZE) {
      alert('Image must be under 2 MB');
      return;
    }

    setUploading(true);
    try {
      const key = await uploadAvatar(file, user.id);
      const updated = await updateMyProfile({ avatarUrl: key });
      updateUser({ avatarUrl: updated.avatarUrl });
      setPopoverOpen(false);
    } catch {
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemoveAvatar() {
    if (!user || uploading) return;
    setUploading(true);
    try {
      await updateMyProfile({ avatarUrl: null });
      updateUser({ avatarUrl: null });
      setPopoverOpen(false);
    } catch {
      alert('Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Sidebar className="sidebar-glow">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2 select-none">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="size-4.5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">SalesTrack</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Academy</span>
          </div>
        </div>
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
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
              className="relative cursor-pointer group/avatar-trigger shrink-0"
              aria-label="Change profile picture"
            >
              <Avatar className="size-8 ring-2 ring-background">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={user?.name || ''} />
                ) : null}
                <AvatarFallback className={`text-xs font-medium ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar-trigger:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="size-3.5 text-white" />
              </div>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" sideOffset={8} className="w-56 p-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="hidden"
                onChange={handleFileSelect}
              />

              {avatarUrl && (
                <div className="flex justify-center mb-2 pt-1">
                  <Image
                    src={avatarUrl}
                    alt="Current avatar"
                    width={80}
                    height={80}
                    className="size-20 rounded-full object-cover ring-2 ring-border"
                    unoptimized
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs h-8"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-3.5 mr-2 animate-spin" />
                  ) : (
                    <Camera className="size-3.5 mr-2" />
                  )}
                  {user?.avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {user?.avatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-xs h-8 text-destructive hover:text-destructive"
                    disabled={uploading}
                    onClick={handleRemoveAvatar}
                  >
                    {uploading ? (
                      <Loader2 className="size-3.5 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5 mr-2" />
                    )}
                    Remove Photo
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
