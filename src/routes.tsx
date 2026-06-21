import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ErrorPage } from './pages/ErrorPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectListPage } from './pages/ProjectListPage';
import { ProjectDashboardPage } from './pages/ProjectDashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectListPage /> },
      { path: 'projects/:projectId', element: <ProjectDashboardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
