import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createTestCaseRepository } from '../lib/repositories/testCaseRepository';
import type { TestCase, TestStepAction } from '../lib/models/testCase';
import type { Priority, AutomationSuitability } from '../lib/types';

const repo = createTestCaseRepository(db);

export type StepInput = {
  action: TestStepAction;
  instruction: string;
  targetUiNodeId?: string;
  expectedResult?: string;
  testData?: string;
};

type StepRowWithId = StepInput & { id: string };

function stripStepId(step: StepRowWithId): StepInput {
  return {
    action: step.action,
    instruction: step.instruction,
    targetUiNodeId: step.targetUiNodeId,
    expectedResult: step.expectedResult,
    testData: step.testData,
  };
}

export function useTestCases(projectId: string, featureId: string) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    try {
      const items = await repo.listByFeature(featureId);
      if (seq !== loadSeqRef.current) return;
      setTestCases(items);
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
        featureId,
        steps: steps?.map(stripStepId),
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
        steps: steps?.map(stripStepId),
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
