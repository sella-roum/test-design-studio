import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createTestViewpointRepository } from '../lib/repositories/testViewpointRepository';
import { createTestCaseRepository } from '../lib/repositories/testCaseRepository';
import { createTraceLinkRepository } from '../lib/repositories/traceLinkRepository';
import type { TestViewpoint, TestTechnique } from '../lib/models/testViewpoint';
import type { Priority, AutomationSuitability } from '../lib/types';
import type { TraceNodeType } from '../lib/models/traceLink';

const viewpointRepo = createTestViewpointRepository(db);
const testCaseRepo = createTestCaseRepository(db);
const traceLinkRepo = createTraceLinkRepository(db);

export function useTestViewpoints(projectId: string, featureId: string) {
  const [viewpoints, setViewpoints] = useState<TestViewpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [testCaseCounts, setTestCaseCounts] = useState<Record<string, number>>({});
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    try {
      const items = await viewpointRepo.listByFeature(featureId);
      if (seq !== loadSeqRef.current) return;
      setViewpoints(items);
      const counts: Record<string, number> = {};
      for (const vp of items) {
        const cases = await testCaseRepo.listByViewpoint(vp.id);
        counts[vp.id] = cases.length;
      }
      if (seq !== loadSeqRef.current) return;
      setTestCaseCounts(counts);
    } catch {
      // ignore
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, [featureId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    load();
  }, [load]);

  const create = useCallback(
    async (input: {
      title: string;
      description?: string;
      technique?: TestTechnique;
      priority?: Priority;
      automationSuitability?: AutomationSuitability;
      automationReason?: string;
      sourceElementIds?: { type: string; id: string }[];
    }) => {
      const vp = await viewpointRepo.create({ projectId, featureId, ...input });
      if (input.sourceElementIds && input.sourceElementIds.length > 0) {
        for (const se of input.sourceElementIds) {
          await traceLinkRepo.create({
            projectId,
            fromType: se.type as TraceNodeType,
            fromId: se.id,
            toType: 'testViewpoint',
            toId: vp.id,
            linkType: 'derived_from',
          });
        }
      }
      await load();
      return vp;
    },
    [projectId, featureId, load],
  );

  const update = useCallback(
    async (
      id: string,
      patch: {
        title?: string;
        description?: string;
        technique?: TestTechnique;
        priority?: Priority;
        automationSuitability?: AutomationSuitability;
        automationReason?: string;
      },
    ) => {
      const vp = await viewpointRepo.update(id, patch);
      await load();
      return vp;
    },
    [load],
  );

  const markRemoved = useCallback(
    async (id: string) => {
      await viewpointRepo.markRemoved(id);
      await load();
    },
    [load],
  );

  return { viewpoints, loading, testCaseCounts, create, update, markRemoved };
}
