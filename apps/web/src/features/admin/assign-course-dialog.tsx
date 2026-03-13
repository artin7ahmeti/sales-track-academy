'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { assignCourse } from '@/lib/api/courses';
import { getUsers, type User } from '@/lib/api/users';
import { getGroups, type Group } from '@/lib/api/groups';

interface AssignCourseDialogProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignCourseDialog({
  courseId, open, onOpenChange, onSuccess,
}: AssignCourseDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([getUsers({ limit: 100, role: 'AGENT' }), getGroups({ limit: 100 })])
      .then(([usersRes, groupsRes]) => {
        setUsers(usersRes.data);
        setGroups(groupsRes.data);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load users/groups'))
      .finally(() => setLoading(false));
  }, [open]);

  function toggleUser(id: string) {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleGroup(id: string) {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedUsers.size === 0 && selectedGroups.size === 0) {
      toast.error('Select at least one user or group');
      return;
    }
    setSubmitting(true);
    try {
      await assignCourse(courseId, {
        userIds: selectedUsers.size > 0 ? Array.from(selectedUsers) : undefined,
        groupIds: selectedGroups.size > 0 ? Array.from(selectedGroups) : undefined,
        dueDate: dueDate || undefined,
      });
      toast.success('Course assigned');
      setSelectedUsers(new Set());
      setSelectedGroups(new Set());
      setDueDate('');
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Failed to assign course');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Course</DialogTitle>
          <DialogDescription>
            Select users and/or groups to assign this course to.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date (optional)</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Agents ({selectedUsers.size} selected)
              </Label>
              {users.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border p-2">
                  {users.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(u.id)}
                        onChange={() => toggleUser(u.id)}
                        className="accent-primary"
                      />
                      <span>{u.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{u.email}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground rounded-lg border p-3 text-center">
                  No agents found. Invite agents first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Groups ({selectedGroups.size} selected)
              </Label>
              {groups.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border p-2">
                  {groups.map((g) => (
                    <label
                      key={g.id}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(g.id)}
                        onChange={() => toggleGroup(g.id)}
                        className="accent-primary"
                      />
                      <span>{g.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {g.memberCount} members
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground rounded-lg border p-3 text-center">
                  No groups found. Create groups first.
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Assigning...' : 'Assign Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
