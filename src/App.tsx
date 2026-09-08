import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from '@/store';
import { Layout } from '@/components/layout';
import {
  Home,
  Dashboard,
  Charts,
  NewChart,
  Templates,
  Settings,
  NotFound,
} from '@/pages';

function App() {
  const { isDark } = useThemeStore();

  // Apply theme on mount and change
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/charts"
          element={
            <Layout>
              <Charts />
            </Layout>
          }
        />
        <Route
          path="/charts/new"
          element={
            <Layout>
              <NewChart />
            </Layout>
          }
        />
        <Route
          path="/templates"
          element={
            <Layout>
              <Templates />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
