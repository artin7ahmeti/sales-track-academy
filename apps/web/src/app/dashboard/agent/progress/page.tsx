import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your learning journey.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Course Completion</span>
              <span className="text-muted-foreground">0%</span>
            </div>
            <Progress value={0} />
          </div>
          <p className="text-muted-foreground text-sm">
            Your detailed progress will appear here once you start completing courses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
