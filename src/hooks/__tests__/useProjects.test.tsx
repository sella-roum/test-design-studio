import { renderHook, waitFor, act } from '@testing-library/react';
import { useProjects } from '../useProjects';
import { db } from '../../lib/db';
import { createProjectRepository } from '../../lib/repositories/projectRepository';

describe('useProjects', () => {
  const repo = createProjectRepository(db);

  beforeEach(async () => {
    await db.projects.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads projects on mount', async () => {
    await repo.create({ name: 'Initial Project' });
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('Initial Project');
  });

  it('creates a project and reloads list', async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.create({ name: 'New Project' });
    });

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('New Project');
  });

  it('marks a project as removed', async () => {
    const project = await repo.create({ name: 'To Remove' });
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markRemoved(project.id);
    });

    expect(result.current.projects).toHaveLength(0);
  });

  it('reloads when reload is called', async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await repo.create({ name: 'After Mount' });

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.projects).toHaveLength(1);
  });

  it('handles load errors gracefully', async () => {
    const mockCollection = {
      reverse: () => mockCollection,
      toArray: vi.fn().mockRejectedValueOnce(new Error('DB Error')),
    };
    vi.spyOn(db.projects, 'orderBy').mockReturnValue(
      mockCollection as unknown as ReturnType<typeof db.projects.orderBy>,
    );

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.error).toBe('DB Error');
    });
  });
});
