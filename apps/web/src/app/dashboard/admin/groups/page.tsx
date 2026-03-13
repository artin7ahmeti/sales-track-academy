import { FolderOpen, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Organize agents into groups for course assignment.</p>
        </div>
        <Button>
          <Plus className="size-4 mr-1" />
          Create Group
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No groups yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Create a group to assign courses to multiple agents at once.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
