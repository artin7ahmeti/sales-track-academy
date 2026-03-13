import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AgentCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">Browse and continue your assigned courses.</p>
      </div>

      <Tabs defaultValue="in-progress">
        <TabsList>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="assigned">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">No assigned courses.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="in-progress">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">No courses in progress.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">No completed courses.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
