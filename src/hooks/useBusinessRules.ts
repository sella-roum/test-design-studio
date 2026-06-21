import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createBusinessRuleRepository } from '../lib/repositories/businessRuleRepository';
import type { BusinessRule, BusinessRuleType } from '../lib/models/businessRule';
import type { Confidence } from '../lib/types';

const repo = createBusinessRuleRepository(db);

export function useBusinessRules(projectId: string, featureId?: string) {
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    try {
      const items = featureId
        ? await repo.listByFeature(featureId)
        : await repo.listByProject(projectId);
      if (seq !== loadSeqRef.current) return;
      setBusinessRules(items);
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
      name: string;
      description: string;
      ruleType: BusinessRuleType;
      confidence?: Confidence;
      featureId?: string;
    }) => {
      const { featureId: inputFeatureId, ...rest } = input;
      const br = await repo.create({
        projectId,
        featureId: inputFeatureId ?? featureId,
        ...rest,
        confidence: rest.confidence ?? 'unknown',
      });
      await load();
      return br;
    },
    [projectId, featureId, load],
  );

  const update = useCallback(
    async (
      id: string,
      patch: {
        name?: string;
        description?: string;
        ruleType?: BusinessRuleType;
        confidence?: Confidence;
      },
    ) => {
      const br = await repo.update(id, patch);
      await load();
      return br;
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

  return { businessRules, loading, create, update, markRemoved };
}
