import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createOpenQuestionRepository } from '../lib/repositories/openQuestionRepository';
import type { OpenQuestion, OpenQuestionStatus } from '../lib/models/openQuestion';
import type { Confidence } from '../lib/types';

const repo = createOpenQuestionRepository(db);

export function useOpenQuestions(projectId: string, featureId?: string) {
  const [openQuestions, setOpenQuestions] = useState<OpenQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    try {
      const items = featureId
        ? await repo.listByFeature(featureId)
        : await repo.listByProject(projectId);
      if (seq !== loadSeqRef.current) return;
      setOpenQuestions(items);
    } catch {
      // ignore
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, [projectId, featureId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    load();
  }, [load]);

  const create = useCallback(
    async (input: {
      question: string;
      context?: string;
      questionStatus: OpenQuestionStatus;
      confidence: Confidence;
    }) => {
      const oq = await repo.create({
        projectId,
        featureId,
        ...input,
      });
      await load();
      return oq;
    },
    [projectId, featureId, load],
  );

  const update = useCallback(
    async (
      id: string,
      patch: {
        question?: string;
        context?: string;
        answer?: string;
        questionStatus?: OpenQuestionStatus;
        confidence?: Confidence;
      },
    ) => {
      const oq = await repo.update(id, patch);
      await load();
      return oq;
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

  return { openQuestions, loading, create, update, markRemoved };
}
