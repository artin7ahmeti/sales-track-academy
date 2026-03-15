'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { assignCourse, getCourse } from '@/lib/api/courses';
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
  const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set());
  const [assignedGroupIds, setAssignedGroupIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Map<string, string>>(new Map());
  const [selectedGroups, setSelectedGroups] = useState<Map<string, string>>(new Map());
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [agentSearch, setAgentSearch] = useState('');
  const [agentFocused, setAgentFocused] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupFocused, setGroupFocused] = useState(false);
  const agentRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setAgentSearch('');
    setGroupSearch('');
    setSelectedUsers(new Map());
    setSelectedGroups(new Map());
    setDueDate('');

    Promise.all([
      getUsers({ limit: 100, role: 'AGENT' }),
      getGroups({ limit: 100 }),
      getCourse(courseId),
    ])
      .then(([usersRes, groupsRes, courseData]) => {
        setUsers(usersRes.data);
        setGroups(groupsRes.data);
        setAssignedUserIds(new Set(courseData.assignedUserIds));
        setAssignedGroupIds(new Set(courseData.assignedGroupIds));
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [open, courseId]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (agentRef.current && !agentRef.current.contains(e.target as Node)) setAgentFocused(false);
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) setGroupFocused(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const agentSuggestions = useMemo(() => {
    if (!agentSearch.trim()) return [];
    const q = agentSearch.toLowerCase();
    return users.filter(
      (u) =>
        !selectedUsers.has(u.id) &&
        (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    );
  }, [users, agentSearch, selectedUsers]);

  const groupSuggestions = useMemo(() => {
    if (!groupSearch.trim()) return [];
    const q = groupSearch.toLowerCase();
    return groups.filter(
      (g) => !selectedGroups.has(g.id) && g.name.toLowerCase().includes(q),
    );
  }, [groups, groupSearch, selectedGroups]);

  function selectAgent(u: User) {
    if (assignedUserIds.has(u.id)) return;
    setSelectedUsers((prev) => new Map(prev).set(u.id, u.name));
    setAgentSearch('');
  }

  function removeAgent(id: string) {
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  function selectGroup(g: Group) {
    if (assignedGroupIds.has(g.id)) return;
    setSelectedGroups((prev) => new Map(prev).set(g.id, g.name));
    setGroupSearch('');
  }

  function removeGroup(id: string) {
    setSelectedGroups((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedUsers.size === 0 && selectedGroups.size === 0) {
      toast.error('Select at least one agent or group');
      return;
    }
    setSubmitting(true);
    try {
      await assignCourse(courseId, {
        userIds: selectedUsers.size > 0 ? Array.from(selectedUsers.keys()) : undefined,
        groupIds: selectedGroups.size > 0 ? Array.from(selectedGroups.keys()) : undefined,
        dueDate: dueDate || undefined,
      });
      toast.success('Course assigned');
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
            Search and select agents or groups to assign this course to.
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

            {/* Agent search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Agents</Label>
              <div ref={agentRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search agents by name or email..."
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    onFocus={() => setAgentFocused(true)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                {agentFocused && agentSearch.trim() && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md max-h-44 overflow-y-auto">
                    {agentSuggestions.length > 0 ? (
                      agentSuggestions.map((u) => {
                        const alreadyAssigned = assignedUserIds.has(u.id);
                        return (
                          <button
                            key={u.id}
                            type="button"
                            disabled={alreadyAssigned}
                            onClick={() => selectAgent(u)}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left ${
                              alreadyAssigned
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-muted cursor-pointer'
                            }`}
                          >
                            {alreadyAssigned && <CheckCircle className="size-3.5 text-primary shrink-0" />}
                            <span className="truncate">{u.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto shrink-0">
                              {alreadyAssigned ? 'Already assigned' : u.email}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No agents found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedUsers.size > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selectedUsers).map(([id, name]) => (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1">
                      {name}
                      <button
                        type="button"
                        onClick={() => removeAgent(id)}
                        className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Group search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Groups</Label>
              <div ref={groupRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search groups..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    onFocus={() => setGroupFocused(true)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                {groupFocused && groupSearch.trim() && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md max-h-44 overflow-y-auto">
                    {groupSuggestions.length > 0 ? (
                      groupSuggestions.map((g) => {
                        const alreadyAssigned = assignedGroupIds.has(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            disabled={alreadyAssigned}
                            onClick={() => selectGroup(g)}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left ${
                              alreadyAssigned
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-muted cursor-pointer'
                            }`}
                          >
                            {alreadyAssigned && <CheckCircle className="size-3.5 text-primary shrink-0" />}
                            <span>{g.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto shrink-0">
                              {alreadyAssigned ? 'Already assigned' : `${g.memberCount} members`}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No groups found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedGroups.size > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selectedGroups).map(([id, name]) => (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1">
                      {name}
                      <button
                        type="button"
                        onClick={() => removeGroup(id)}
                        className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
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
