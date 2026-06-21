import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider } from '../../components/common/Toast';
import { ProjectDashboardPage } from '../ProjectDashboardPage';
import { db } from '../../lib/db';
import { createProjectRepository } from '../../lib/repositories/projectRepository';
import { createFeatureRepository } from '../../lib/repositories/featureRepository';
import { createScreenRepository } from '../../lib/repositories/screenRepository';
import { createOpenQuestionRepository } from '../../lib/repositories/openQuestionRepository';
import { createTestViewpointRepository } from '../../lib/repositories/testViewpointRepository';
import { createTestCaseRepository } from '../../lib/repositories/testCaseRepository';

function renderWithMemoryRouter(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/projects/:projectId',
        element: <ProjectDashboardPage />,
      },
      {
        path: '/projects',
        element: <div>Project List Page</div>,
      },
      {
        path: '/projects/:projectId/features/:featureId',
        element: <div>Feature Workspace Page</div>,
      },
    ],
    {
      initialEntries: [initialPath],
    },
  );

  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  );

  return router;
}

describe('ProjectDashboardPage', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  it('shows loading state initially', () => {
    renderWithMemoryRouter('/projects/some-id');
    expect(screen.getByText('プロジェクトダッシュボード')).toBeInTheDocument();
  });

  it('displays project info when project exists', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({
      name: 'Test Dashboard',
      description: 'A test project',
      targetAppName: 'TestApp',
      targetAppUrl: 'https://test.example.com',
    });

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    });
    expect(screen.getByText('A test project')).toBeInTheDocument();
    expect(screen.getByText(/対象アプリ:\s*TestApp/)).toBeInTheDocument();
    expect(screen.getByText('https://test.example.com')).toBeInTheDocument();
    expect(screen.queryByText('プロジェクトが見つかりません')).not.toBeInTheDocument();
  });

  it('shows project not found for non-existent project', async () => {
    renderWithMemoryRouter('/projects/non-existent-id');

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });
  });

  it('shows project not found for removed project', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'Gone' });
    await repo.markRemoved(project.id);

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });
  });

  it('recovers from not-found state when navigating to existing project on the same router', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'Recovered Project' });

    const router = renderWithMemoryRouter('/projects/missing-id');

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
    });

    await act(async () => {
      await router.navigate(`/projects/${project.id}`);
    });

    await waitFor(() => {
      expect(screen.getByText('Recovered Project')).toBeInTheDocument();
    });
    expect(screen.queryByText('プロジェクトが見つかりません')).not.toBeInTheDocument();
  });

  it('has a link back to project list', async () => {
    const repo = createProjectRepository(db);
    const project = await repo.create({ name: 'With Back Link' });

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('With Back Link')).toBeInTheDocument();
    });

    const backLinks = screen.getAllByText('プロジェクト一覧');
    expect(backLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('shows KPI counts with data', async () => {
    const projectRepo = createProjectRepository(db);
    const featureRepo = createFeatureRepository(db);
    const screenRepo = createScreenRepository(db);
    const oqRepo = createOpenQuestionRepository(db);
    const vpRepo = createTestViewpointRepository(db);
    const tcRepo = createTestCaseRepository(db);

    const project = await projectRepo.create({ name: 'KPI Project' });
    const feature = await featureRepo.create({ projectId: project.id, name: 'KPI Feature' });
    await screenRepo.create({ projectId: project.id, featureId: feature.id, name: 'Screen 1' });
    await oqRepo.create({
      projectId: project.id,
      featureId: feature.id,
      question: 'Test question',
      questionStatus: 'open',
      confidence: 'unknown',
    });
    await vpRepo.create({ projectId: project.id, featureId: feature.id, title: 'Viewpoint 1' });
    await tcRepo.create({ projectId: project.id, featureId: feature.id, title: 'Case 1' });

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('KPI Project')).toBeInTheDocument();
    });

    expect(screen.getByTestId('kpi-features-count')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-screens-count')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-viewpoints-count')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-test-cases-count')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-open-questions-count')).toHaveTextContent('1');
  });

  it('creates a feature via dialog and navigates to workspace', async () => {
    const projectRepo = createProjectRepository(db);
    const project = await projectRepo.create({ name: 'Feature Create Test' });

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('Feature Create Test')).toBeInTheDocument();
    });

    const newFeatureBtns = screen.getAllByText('新規機能');
    await userEvent.click(newFeatureBtns[0]);

    const dialogTitle = await screen.findByRole('heading', { name: '新規機能' });
    expect(dialogTitle).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('例: ログイン認証');
    await userEvent.type(nameInput, 'New Feature');

    await userEvent.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByText('Feature Workspace Page')).toBeInTheDocument();
    });
  });

  it('creates a screen via dialog', async () => {
    const projectRepo = createProjectRepository(db);
    const featureRepo = createFeatureRepository(db);
    const project = await projectRepo.create({ name: 'Screen Create Test' });
    await featureRepo.create({ projectId: project.id, name: 'Parent Feature' });

    renderWithMemoryRouter(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('Screen Create Test')).toBeInTheDocument();
    });

    const newScreenBtns = screen.getAllByText('新規画面');
    await userEvent.click(newScreenBtns[0]);

    const dialogTitle = await screen.findByRole('heading', { name: '新規画面' });
    expect(dialogTitle).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('例: ログイン画面');
    await userEvent.type(nameInput, 'New Screen');

    await userEvent.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByText('New Screen')).toBeInTheDocument();
    });
  });
});
