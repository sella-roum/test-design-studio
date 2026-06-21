import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createScreenRepository } from '../lib/repositories/screenRepository';
import type { Screen, ScreenType } from '../lib/models/screen';
import type { Confidence } from '../lib/types';

const repo = createScreenRepository(db);

export function useScreens(projectId: string) {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadSeqRef = useRef(0);

  const load = useCallback(
    async (options?: { reload?: boolean }) => {
      const seq = ++loadSeqRef.current;
      if (options?.reload) {
        setLoading(true);
      }
      try {
        const items = await repo.listByProject(projectId);
        if (seq !== loadSeqRef.current) return;
        setScreens(items);
        setError(null);
      } catch (e) {
        if (seq !== loadSeqRef.current) return;
        setError(e instanceof Error ? e.message : 'Failed to load screens');
      } finally {
        if (seq === loadSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [projectId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    load();
  }, [load]);

  const create = useCallback(
    async (input: {
      featureId: string;
      name: string;
      screenType?: ScreenType;
      urlPattern?: string;
      purpose?: string;
      preconditions?: string;
      description?: string;
      confidence?: Confidence;
    }) => {
      const screen = await repo.create({ projectId, ...input });
      await load();
      return screen;
    },
    [projectId, load],
  );

  const update = useCallback(
    async (
      id: string,
      patch: {
        name?: string;
        screenType?: ScreenType;
        urlPattern?: string;
        purpose?: string;
        preconditions?: string;
        description?: string;
        confidence?: Confidence;
      },
    ) => {
      const screen = await repo.update(id, patch);
      await load();
      return screen;
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

  return { screens, loading, error, create, update, markRemoved, reload };
}
