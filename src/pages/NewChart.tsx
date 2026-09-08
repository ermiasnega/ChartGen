import { Card, CardContent } from '@/components/ui';

export const NewChart = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">Create New Chart</h1>
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Chart editor - Coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
};
