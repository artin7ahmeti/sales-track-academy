import { UserPlus, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage sales agents and admins.</p>
        </div>
        <Button>
          <UserPlus className="size-4 mr-1" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No users yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Invite your first sales agent to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
