import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

interface Props { children: ReactNode; }
interface State { error: Error | null; }
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ChartGen UI error', error, info); }
  render() { if (!this.state.error) return this.props.children; return <div className="flex min-h-screen items-center justify-center bg-background p-6"><Card className="max-w-lg"><CardContent className="p-8 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-destructive" /><h1 className="mt-4 text-xl font-semibold">Something went wrong</h1><p className="mt-2 text-sm text-muted-foreground">The workspace could not render this view. Your saved data is still stored locally.</p><Button className="mt-5" onClick={() => this.setState({ error: null })}><RotateCcw className="mr-2 h-4 w-4" />Try again</Button></CardContent></Card></div>; }
}
