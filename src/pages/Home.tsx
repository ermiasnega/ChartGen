import { Card, CardContent } from '@/components/ui';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { BarChart3 } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-12 h-12 text-accent" />
            <h1 className="text-5xl font-bold">ChartGen</h1>
          </div>
          <p className="text-xl text-muted-foreground">Modern web-based chart generator and visualization editor</p>
        </div>
        <Card className="bg-card border border-border">
          <CardContent className="p-8">
            <p className="text-muted-foreground mb-6">Create beautiful, interactive charts and visualizations with ChartGen's intuitive editor.</p>
            <Link to="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
