import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createTestCaseRepository } from '../lib/repositories/testCaseRepository';
import type { TestCase, TestStepAction } from '../lib/models/testCase';
import type { Priority, AutomationSuitability } from '../lib/types';

const repo = createTestCaseRepository(db);

export type StepInput = {
  id?: string;
  action: TestStepAction;
  instruction: string;
  targetUiNodeId?: string;
  expectedResult?: string;
  testData?: string;
};

type StepRowWithId = StepInput & { id: string };

function normalizeStep(step: StepRowWithId, index: number) {
  return {
    id: step.id,
    order: index + 1,
    action: step.action,
    instruction: step.instruction,
    targetUiNodeId: step.targetUiNodeId || undefined,
    expectedResult: step.expectedResult?.trim() || undefined,
    testData: step.testData?.trim() || undefined,
  };
}

export function useTestCases(projectId: string, featureId?: string) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    try {
      const items = featureId
        ? await repo.listByFeature(featureId)
        : await repo.listByProject(projectId);
      if (seq !== loadSeqRef.current) return;
      setTestCases(items);
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
      title: string;
      viewpointId?: string;
      preconditions?: string;
      steps?: StepRowWithId[];
      priority?: Priority;
      automationSuitability?: AutomationSuitability;
      automationReason?: string;
    }) => {
      const { steps, ...rest } = input;
      const tc = await repo.create({
        ...rest,
        projectId,
        featureId: featureId ?? '',
        steps: steps?.map((s, i) => normalizeStep(s, i)),
      });
      await load();
      return tc;
    },
    [projectId, featureId, load],
  );

  const update = useCallback(
    async (
      id: string,
      patch: {
        title?: string;
        viewpointId?: string;
        preconditions?: string;
        steps?: StepRowWithId[];
        priority?: Priority;
        automationSuitability?: AutomationSuitability;
        automationReason?: string;
      },
    ) => {
      const { steps, ...rest } = patch;
      const tc = await repo.update(id, {
        ...rest,
        steps: steps?.map((s, i) => normalizeStep(s, i)),
      });
      await load();
      return tc;
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

  return { testCases, loading, create, update, markRemoved };
}
