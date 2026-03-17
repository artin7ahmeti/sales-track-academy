'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users, UserPlus, Search, MoreHorizontal,
  Pencil, Trash2, Mail, Shield, ShieldCheck, Copy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FadeIn } from '@/components/animations/fade-in';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useThumbnailUrl } from '@/hooks/use-thumbnail-url';
import {
  getUsers, inviteUser, updateUser, deleteUser,
  type User,
} from '@/lib/api/users';

function UserAvatar({ user }: { user: User }) {
  const url = useThumbnailUrl(user.avatarUrl);
  const initial = user.name.charAt(0).toUpperCase();
  return (
    <Avatar className="size-8">
      {url ? <AvatarImage src={url} alt={user.name} /> : null}
      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const hasActiveFilters = !!search.trim() || roleFilter !== 'ALL';

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('AGENT');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('AGENT');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getUsers({
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      });
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function resetInviteForm() {
    setInviteEmail('');
    setInviteRole('AGENT');
    setInviteLink(null);
  }

  function handleInviteDialogChange(open: boolean) {
    setInviteOpen(open);
    if (!open) {
      resetInviteForm();
    }
  }

  async function copyInviteLink(url: string, showToast = true) {
    try {
      await navigator.clipboard.writeText(url);
      if (showToast) {
        toast.success('Invite link copied to clipboard');
      }
    } catch {
      toast.error('Failed to copy invite link');
    }
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditActive(user.isActive);
    setEditOpen(true);
  }

  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setInviting(true);
    try {
      const result = await inviteUser({ email, role: inviteRole });
      setInviteLink(result.inviteUrl ?? null);

      if (result.emailStatus === 'sent') {
        toast.success('Invitation email sent');
        handleInviteDialogChange(false);
        return;
      }

      if (result.inviteUrl) {
        await copyInviteLink(result.inviteUrl, false);
      }

      if (result.emailStatus === 'skipped') {
        toast.success('Invitation created, but SMTP is not configured. Share the link manually.');
      } else {
        toast.error('Invitation created, but email delivery failed. Share the link manually.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  }

  async function handleEditSave() {
    if (!editingUser || !editName.trim()) return;
    setSaving(true);
    try {
      await updateUser(editingUser.id, {
        name: editName,
        role: editRole,
        isActive: editActive,
      });
      toast.success('User updated');
      setEditOpen(false);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-56 mt-2" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn duration={500}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground mt-1">
              Manage sales agents and admins.
            </p>
          </div>
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4 mr-1" />
            Invite User
          </Button>
        </div>
      </FadeIn>

      {(users.length > 0 || hasActiveFilters) && (
        <FadeIn delay={100}>
          <div className="flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? 'ALL')}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={150}>
        {users.length === 0 && !hasActiveFilters ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Users className="size-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium">No users yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Invite your first sales agent to get started.
              </p>
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="size-4 mr-1" />
                Invite User
              </Button>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-sm">
                No users match your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-md transition-shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Joined</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="group/row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <span className="font-medium">{user.name}</span>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role === 'ADMIN' ? (
                          <ShieldCheck className="size-3 mr-0.5" />
                        ) : (
                          <Shield className="size-3 mr-0.5" />
                        )}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.isActive ? 'default' : 'outline'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </FadeIn>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={handleInviteDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="agent@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v ?? 'AGENT')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inviteLink && (
              <div className="space-y-2 rounded-lg border border-dashed p-3">
                <div>
                  <p className="text-sm font-medium">Manual invite link</p>
                  <p className="text-xs text-muted-foreground">
                    Email delivery was not completed. Share this link directly with the invited user.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyInviteLink(inviteLink)}
                    aria-label="Copy invite link"
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleInviteDialogChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
            >
              {inviting ? 'Sending...' : (
                <>
                  <Mail className="size-4 mr-1" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details for {editingUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v ?? 'AGENT')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-medium">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive users cannot sign in.
                </p>
              </div>
              <Button
                variant={editActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditActive(!editActive)}
              >
                {editActive ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={!editName.trim() || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
