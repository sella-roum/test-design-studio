import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { createProjectRepository } from '../lib/repositories/projectRepository';
import type { Project } from '../lib/models/project';

const repo = createProjectRepository(db);

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (options?: { reload?: boolean }) => {
    if (options?.reload) {
      setLoading(true);
    }
    try {
      const items = await repo.list();
      setProjects(items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const create = useCallback(
    async (input: {
      name: string;
      description?: string;
      targetAppName?: string;
      targetAppUrl?: string;
    }) => {
      const project = await repo.create(input);
      await load();
      return project;
    },
    [load],
  );

  const update = useCallback(
    async (
      id: string,
      patch: { name?: string; description?: string; targetAppName?: string; targetAppUrl?: string },
    ) => {
      const project = await repo.update(id, patch);
      await load();
      return project;
    },
    [load],
  );

  const markRemoved = useCallback(
    async (id: string) => {
      await repo.markRemoved(id);
      await load();
    },
    [load],
  );

  const reload = useCallback(() => load({ reload: true }), [load]);

  return { projects, loading, error, create, update, markRemoved, reload };
}
