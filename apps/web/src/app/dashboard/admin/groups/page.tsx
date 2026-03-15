'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FolderOpen, Plus, MoreHorizontal,
  Pencil, Trash2, Users, UserPlus, X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FadeIn } from '@/components/animations/fade-in';
import {
  getGroups, getGroup, createGroup, updateGroup, deleteGroup,
  addMembers, removeMembers,
  type Group, type GroupDetail,
} from '@/lib/api/groups';
import { getUsers, type User } from '@/lib/api/users';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  // Members dialog
  const [membersGroup, setMembersGroup] = useState<GroupDetail | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  function openCreate() {
    setEditingGroup(null);
    setFormName('');
    setFormDesc('');
    setFormOpen(true);
  }

  function openEdit(group: Group) {
    setEditingGroup(group);
    setFormName(group.name);
    setFormDesc(group.description || '');
    setFormOpen(true);
  }

  async function openMembers(group: Group) {
    setMembersLoading(true);
    setMembersOpen(true);
    try {
      const [detail, usersRes] = await Promise.all([
        getGroup(group.id),
        getUsers({ limit: 100 }),
      ]);
      setMembersGroup(detail);
      setAllUsers(usersRes.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load group members');
      setMembersOpen(false);
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formName.trim()) return;
    setSubmitting(true);
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, {
          name: formName,
          description: formDesc || undefined,
        });
        toast.success('Group updated');
      } else {
        await createGroup({
          name: formName,
          description: formDesc || undefined,
        });
        toast.success('Group created');
      }
      setFormOpen(false);
      fetchGroups();
    } catch {
      toast.error(editingGroup ? 'Failed to update group' : 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteGroup(deleteTarget.id);
      toast.success('Group deleted');
      setDeleteTarget(null);
      fetchGroups();
    } catch {
      toast.error('Failed to delete group');
    }
  }

  async function handleAddMember() {
    if (!membersGroup || !selectedUserId) return;
    try {
      const updated = await addMembers(membersGroup.id, [selectedUserId]);
      setMembersGroup(updated);
      setSelectedUserId('');
      fetchGroups();
      toast.success('Member added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add member');
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!membersGroup) return;
    try {
      await removeMembers(membersGroup.id, [userId]);
      setMembersGroup({
        ...membersGroup,
        members: membersGroup.members.filter((m) => m.userId !== userId),
      });
      fetchGroups();
      toast.success('Member removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    }
  }

  const availableUsers = allUsers.filter(
    (u) => u.isActive && !membersGroup?.members.some((m) => m.userId === u.id),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-8 w-36" />
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
            <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
            <p className="text-muted-foreground mt-1">
              Organize agents into groups for course assignment.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4 mr-1" />
            Create Group
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        {groups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FolderOpen className="size-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium">No groups yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Create a group to assign courses to multiple agents at once.
              </p>
              <Button onClick={openCreate}>
                <Plus className="size-4 mr-1" />
                Create Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-md transition-shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id} className="group/row">
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {group.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openMembers(group)}
                        className="text-xs"
                      >
                        <Users className="size-3.5 mr-1" />
                        {group.memberCount}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(group)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openMembers(group)}>
                            <Users className="size-4" />
                            Manage Members
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(group)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit Group' : 'Create Group'}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? 'Update the group details below.'
                : 'Create a new group to organize agents.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Name</Label>
              <Input
                id="group-name"
                placeholder="e.g. East Region Team"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-desc">Description</Label>
              <Textarea
                id="group-desc"
                placeholder="Group description..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formName.trim() || submitting}
            >
              {submitting
                ? 'Saving...'
                : editingGroup
                  ? 'Save Changes'
                  : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Members &mdash; {membersGroup?.name}
            </DialogTitle>
            <DialogDescription>
              Add or remove members from this group.
            </DialogDescription>
          </DialogHeader>

          {membersLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Add member */}
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select a user to add...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={!selectedUserId}
                  onClick={handleAddMember}
                >
                  <UserPlus className="size-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Member list */}
              {membersGroup?.members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No members in this group yet.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {membersGroup?.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {m.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{m.user.name}</span>
                          <p className="text-xs text-muted-foreground">{m.user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveMember(m.userId)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersOpen(false)}>
              Done
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
            <DialogTitle>Delete Group</DialogTitle>
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
