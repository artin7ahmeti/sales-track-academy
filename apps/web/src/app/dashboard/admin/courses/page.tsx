import { BookOpen, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your training courses.</p>
        </div>
        <Button>
          <Plus className="size-4 mr-1" />
          Create Course
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No courses yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Create your first course to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
