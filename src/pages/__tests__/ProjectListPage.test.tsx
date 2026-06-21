import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../components/common/Toast';
import { ProjectListPage } from '../ProjectListPage';
import { ProjectDashboardPage } from '../ProjectDashboardPage';
import { db } from '../../lib/db';
import { createProjectRepository } from '../../lib/repositories/projectRepository';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/projects']}>{ui}</MemoryRouter>
    </ToastProvider>,
  );
}

function renderWithRoutes() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:projectId" element={<ProjectDashboardPage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ProjectListPage', () => {
  beforeEach(async () => {
    await db.projects.clear();
  });

  it('shows empty state when no projects exist', async () => {
    renderWithProviders(<ProjectListPage />);
    await waitFor(() => {
      expect(screen.getByText('まだプロジェクトがありません')).toBeInTheDocument();
    });
  });

  it('creates a project and navigates to dashboard', async () => {
    renderWithRoutes();

    await waitFor(() => {
      expect(screen.getByText('まだプロジェクトがありません')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('プロジェクトを作成'));

    const nameInput = screen.getByLabelText(/プロジェクト名/);
    await userEvent.type(nameInput, 'New Test Project');

    await userEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(screen.getByText('プロジェクトを作成しました')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Project')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('プロジェクト一覧')).toBeInTheDocument();
    });
  });

  it('shows error when project name is empty', async () => {
    renderWithProviders(<ProjectListPage />);
    await waitFor(() => {
      expect(screen.getByText('まだプロジェクトがありません')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('プロジェクトを作成'));
    await userEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(screen.getByText('プロジェクト名は必須です')).toBeInTheDocument();
    });
  });

  it('displays project list after creation', async () => {
    const repo = createProjectRepository(db);
    await repo.create({ name: 'Existing Project' });

    renderWithProviders(<ProjectListPage />);
    await waitFor(() => {
      expect(screen.getByText('Existing Project')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on row click', async () => {
    const repo = createProjectRepository(db);
    await repo.create({ name: 'Click Project' });

    renderWithRoutes();

    await waitFor(() => {
      expect(screen.getByText('Click Project')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('button', { name: /Click Project/ });
    await userEvent.click(rows[0]);

    await waitFor(() => {
      expect(screen.getByText('Click Project')).toBeInTheDocument();
    });

    const links = screen.getAllByText('プロジェクト一覧');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to dashboard on Enter key', async () => {
    const repo = createProjectRepository(db);
    await repo.create({ name: 'Enter Project' });

    renderWithRoutes();

    await waitFor(() => {
      expect(screen.getByText('Enter Project')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('button', { name: /Enter Project/ });
    await userEvent.type(rows[0], '{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Enter Project')).toBeInTheDocument();
    });

    const links = screen.getAllByText('プロジェクト一覧');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to dashboard on Space key', async () => {
    const repo = createProjectRepository(db);
    await repo.create({ name: 'Space Project' });

    renderWithRoutes();

    await waitFor(() => {
      expect(screen.getByText('Space Project')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('button', { name: /Space Project/ });
    await userEvent.type(rows[0], '{Space}');

    await waitFor(() => {
      expect(screen.getByText('Space Project')).toBeInTheDocument();
    });

    const links = screen.getAllByText('プロジェクト一覧');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('edits a project', async () => {
    const repo = createProjectRepository(db);
    await repo.create({ name: 'Old Name' });

    renderWithProviders(<ProjectListPage />);
    await waitFor(() => {
      expect(screen.getByText('Old Name')).toBeInTheDocument();
    });

    const editBtn = screen.getAllByText('編集')[0];
    await userEvent.click(editBtn);

    const nameInput = screen.getByLabelText(/プロジェクト名/);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    await userEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(screen.getByText('プロジェクトを更新しました')).toBeInTheDocument();
    });
    expect(screen.getByText('Updated Name')).toBeInTheDocument();
  });

  it('deletes a project', async () => {
    const repo = createProjectRepository(db);
    await repo.create({ name: 'Project To Delete' });

    renderWithProviders(<ProjectListPage />);
    await waitFor(() => {
      expect(screen.getByText('Project To Delete')).toBeInTheDocument();
    });

    const deleteBtn = screen.getAllByText('削除')[0];
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('削除する'));

    await waitFor(() => {
      expect(screen.getByText('プロジェクトを削除しました')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('まだプロジェクトがありません')).toBeInTheDocument();
    });
  });
});
