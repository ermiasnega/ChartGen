import { Plus, BarChart3, LineChart, PieChart } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Link } from 'react-router-dom';

const chartTypes = [
  { name: 'Bar', icon: BarChart3, href: '/charts/new?type=bar' },
  { name: 'Line', icon: LineChart, href: '/charts/new?type=line' },
  { name: 'Pie', icon: PieChart, href: '/charts/new?type=pie' },
  { name: 'Doughnut', icon: PieChart, href: '/charts/new?type=doughnut' },
  { name: 'Area', icon: LineChart, href: '/charts/new?type=area' },
  { name: 'Scatter', icon: BarChart3, href: '/charts/new?type=scatter' },
];

const mockRecentCharts = [
  {
    id: '1',
    name: 'Sales Q4 2024',
    type: 'bar',
    lastModified: '2 hours ago',
    thumbnail: 'bg-blue-100 dark:bg-blue-900',
  },
  {
    id: '2',
    name: 'Website Analytics',
    type: 'line',
    lastModified: '1 day ago',
    thumbnail: 'bg-purple-100 dark:bg-purple-900',
  },
  {
    id: '3',
    name: 'Market Share',
    type: 'pie',
    lastModified: '3 days ago',
    thumbnail: 'bg-green-100 dark:bg-green-900',
  },
];

export const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to ChartGen</h1>
        <p className="text-lg text-muted-foreground">
          Create beautiful, interactive charts and visualizations in minutes
        </p>
      </div>

      {/* Create New Chart */}
      <div>
        <Link to="/charts/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create New Chart
          </Button>
        </Link>
      </div>

      {/* Quick Chart Types */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {chartTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Link key={type.name} to={type.href}>
                <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-accent">
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-accent" />
                    <p className="text-sm font-medium">{type.name}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Charts */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Charts</h2>
        {mockRecentCharts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRecentCharts.map((chart) => (
              <Card key={chart.id} className="cursor-pointer transition-all hover:shadow-lg hover:border-accent">
                <CardContent className="p-4">
                  <div className={`w-full h-32 rounded-md mb-4 ${chart.thumbnail}`} />
                  <h3 className="font-semibold text-lg">{chart.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {chart.type} • {chart.lastModified}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Charts Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first chart to get started</p>
              <Link to="/charts/new">
                <Button>Create Chart</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Templates Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Popular Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Business Analytics', 'Financial Report', 'Social Media Metrics'].map((template) => (
            <Card key={template} className="cursor-pointer transition-all hover:shadow-md hover:border-accent">
              <CardHeader>
                <CardTitle className="text-lg">{template}</CardTitle>
                <CardDescription>Ready-to-use template</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
