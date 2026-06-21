import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createFeatureRepository } from '../lib/repositories/featureRepository';
import type { Feature } from '../lib/models/feature';
import type { Priority, Confidence } from '../lib/types';

const repo = createFeatureRepository(db);

export function useFeatures(projectId: string) {
  const [features, setFeatures] = useState<Feature[]>([]);
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
        setFeatures(items);
        setError(null);
      } catch (e) {
        if (seq !== loadSeqRef.current) return;
        setError(e instanceof Error ? e.message : 'Failed to load features');
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
      name: string;
      description?: string;
      purpose?: string;
      actor?: string;
      preconditions?: string;
      successCriteria?: string;
      failureConditions?: string;
      priority?: Priority;
      riskLevel?: Priority;
      confidence?: Confidence;
    }) => {
      const feature = await repo.create({ projectId, ...input });
      await load();
      return feature;
    },
    [projectId, load],
  );

  const update = useCallback(
    async (
      id: string,
      patch: {
        name?: string;
        description?: string;
        purpose?: string;
        actor?: string;
        preconditions?: string;
        successCriteria?: string;
        failureConditions?: string;
        priority?: Priority;
        riskLevel?: Priority;
        confidence?: Confidence;
      },
    ) => {
      const feature = await repo.update(id, patch);
      await load();
      return feature;
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

  return { features, loading, error, create, update, markRemoved, reload };
}
