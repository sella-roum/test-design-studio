import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider } from '../../components/common/Toast';
import { FeatureWorkspacePage } from '../FeatureWorkspacePage';
import { db } from '../../lib/db';
import { createProjectRepository } from '../../lib/repositories/projectRepository';
import { createFeatureRepository } from '../../lib/repositories/featureRepository';

async function renderFeature(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/projects/:projectId/features/:featureId',
        element: <FeatureWorkspacePage />,
      },
      {
        path: '/projects/:projectId',
        element: <div>Project Dashboard</div>,
      },
    ],
    { initialEntries: [path] },
  );

  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  );

  return router;
}

describe('FeatureWorkspacePage', () => {
  let projectId: string;
  let featureId: string;

  beforeEach(async () => {
    await db.projects.clear();
    await db.features.clear();
    const projectRepo = createProjectRepository(db);
    const featureRepo = createFeatureRepository(db);
    const project = await projectRepo.create({ name: 'Test Project' });
    projectId = project.id;
    const feature = await featureRepo.create({
      projectId,
      name: 'Test Feature',
      description: 'desc',
    });
    featureId = feature.id;
  });

  it('displays feature name for valid feature', async () => {
    await renderFeature(`/projects/${projectId}/features/${featureId}`);

    expect(await screen.findByText('Test Feature')).toBeInTheDocument();
    expect(screen.queryByText('機能が見つかりません')).not.toBeInTheDocument();
  });

  it('shows not found for non-existent feature id', async () => {
    await renderFeature(`/projects/${projectId}/features/nonexistent`);

    expect(await screen.findByText('機能が見つかりません')).toBeInTheDocument();
  });

  it('shows not found for removed feature', async () => {
    const featureRepo = createFeatureRepository(db);
    await featureRepo.markRemoved(featureId);

    await renderFeature(`/projects/${projectId}/features/${featureId}`);

    expect(await screen.findByText('機能が見つかりません')).toBeInTheDocument();
  });

  it('shows not found when feature belongs to a different project', async () => {
    const featureRepo = createFeatureRepository(db);
    const otherProject = await createProjectRepository(db).create({ name: 'Other' });
    const otherFeature = await featureRepo.create({
      projectId: otherProject.id,
      name: 'Other Feature',
    });

    await renderFeature(`/projects/${projectId}/features/${otherFeature.id}`);

    expect(await screen.findByText('機能が見つかりません')).toBeInTheDocument();
  });

  it('has a link back to project dashboard', async () => {
    await renderFeature(`/projects/${projectId}/features/${featureId}`);

    expect(await screen.findByText('Test Feature')).toBeInTheDocument();

    const link = screen.getByText('プロジェクト');
    expect(link.closest('a')).toHaveAttribute('href', `/projects/${projectId}`);
  });
});
