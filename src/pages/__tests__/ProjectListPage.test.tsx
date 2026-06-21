import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/common/Toast';
import { ProjectListPage } from '../ProjectListPage';
import { db } from '../../lib/db';
import { createProjectRepository } from '../../lib/repositories/projectRepository';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/projects']}>{ui}</MemoryRouter>
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
    renderWithProviders(<ProjectListPage />);
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
