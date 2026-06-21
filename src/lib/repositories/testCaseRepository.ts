import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { TestCase, TestStep, TestStepAction } from '../models/testCase';
import type { Priority, AutomationSuitability } from '../types';
import type { ListOptions } from './listOptions';
import { filterRemoved } from './listOptions';

export function createTestCaseRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  const VALID_STEP_ACTIONS: TestStepAction[] = [
    'navigate',
    'click',
    'fill',
    'select',
    'check',
    'assert',
    'wait',
    'other',
  ];

  const VALID_PRIORITIES: Priority[] = ['high', 'medium', 'low'];
  const VALID_AUTOMATION_SUITABILITIES: AutomationSuitability[] = [
    'high',
    'medium',
    'low',
    'manual-only',
  ];

  type StepInput = {
    id?: string;
    action: TestStepAction;
    instruction: string;
    targetUiNodeId?: string;
    expectedResult?: string;
    testData?: string;
  };

  type CreateInput = {
    projectId: string;
    featureId: string;
    title: string;
    viewpointId?: string;
    preconditions?: string;
    steps?: StepInput[];
    expectedResult?: string;
    testData?: string;
    priority?: Priority;
    automationSuitability?: AutomationSuitability;
    automationReason?: string;
  };

  type UpdateInput = Partial<
    Pick<
      TestCase,
      | 'title'
      | 'viewpointId'
      | 'preconditions'
      | 'expectedResult'
      | 'testData'
      | 'priority'
      | 'automationSuitability'
      | 'automationReason'
    >
  > & {
    steps?: StepInput[];
  };

  function buildSteps(inputs?: StepInput[]): TestStep[] {
    if (!inputs || inputs.length === 0) return [];
    return inputs.map((s, i) => {
      if (!VALID_STEP_ACTIONS.includes(s.action)) {
        throw new ValidationError(`Invalid step action: ${s.action}`);
      }
      if (!s.instruction || s.instruction.trim().length === 0) {
        throw new ValidationError('Step instruction is required');
      }
      return {
        id: s.id ?? generateId(),
        order: i + 1,
        action: s.action,
        instruction: s.instruction.trim(),
        targetUiNodeId: s.targetUiNodeId || undefined,
        expectedResult: s.expectedResult?.trim() || undefined,
        testData: s.testData?.trim() || undefined,
      };
    });
  }

  async function create(input: CreateInput): Promise<TestCase> {
    if (!input.projectId) throw new ValidationError('projectId is required');
    if (!input.featureId) throw new ValidationError('featureId is required');
    if (!input.title || input.title.trim().length === 0)
      throw new ValidationError('TestCase title is required');
    if (input.priority && !VALID_PRIORITIES.includes(input.priority)) {
      throw new ValidationError(`Invalid priority: ${input.priority}`);
    }
    if (
      input.automationSuitability &&
      !VALID_AUTOMATION_SUITABILITIES.includes(input.automationSuitability)
    ) {
      throw new ValidationError(`Invalid automationSuitability: ${input.automationSuitability}`);
    }

    const testCase: TestCase = {
      id: generateId(),
      projectId: input.projectId,
      featureId: input.featureId,
      viewpointId: input.viewpointId || undefined,
      title: input.title.trim(),
      preconditions: input.preconditions?.trim() || undefined,
      steps: buildSteps(input.steps),
      expectedResult: input.expectedResult?.trim() || undefined,
      testData: input.testData?.trim() || undefined,
      priority: input.priority,
      automationSuitability: input.automationSuitability,
      automationReason: input.automationReason?.trim() || undefined,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.testCases.add(testCase);
    return testCase;
  }

  async function get(id: string): Promise<TestCase | undefined> {
    return db.testCases.get(id);
  }

  async function listByProject(projectId: string, options?: ListOptions): Promise<TestCase[]> {
    const items = await db.testCases.where('projectId').equals(projectId).toArray();
    return filterRemoved(items, options);
  }

  async function listByFeature(featureId: string, options?: ListOptions): Promise<TestCase[]> {
    const items = await db.testCases.where('featureId').equals(featureId).toArray();
    return filterRemoved(items, options);
  }

  async function listByViewpoint(viewpointId: string, options?: ListOptions): Promise<TestCase[]> {
    const items = await db.testCases.where('viewpointId').equals(viewpointId).toArray();
    return filterRemoved(items, options);
  }

  async function update(id: string, patch: UpdateInput): Promise<TestCase> {
    const existing = await db.testCases.get(id);
    if (!existing) throw new NotFoundError('TestCase', id);

    const updates: Partial<TestCase> = {};
    if (patch.title !== undefined) {
      if (patch.title.trim().length === 0) throw new ValidationError('TestCase title is required');
      updates.title = patch.title.trim();
    }
    if (patch.viewpointId !== undefined) updates.viewpointId = patch.viewpointId || undefined;
    if (patch.preconditions !== undefined) updates.preconditions = patch.preconditions.trim() || '';
    if (patch.steps !== undefined) updates.steps = buildSteps(patch.steps);
    if (patch.expectedResult !== undefined)
      updates.expectedResult = patch.expectedResult.trim() || '';
    if (patch.testData !== undefined) updates.testData = patch.testData.trim() || '';
    if (patch.priority !== undefined) {
      if (patch.priority && !VALID_PRIORITIES.includes(patch.priority)) {
        throw new ValidationError(`Invalid priority: ${patch.priority}`);
      }
      updates.priority = patch.priority || undefined;
    }
    if (patch.automationSuitability !== undefined) {
      if (
        patch.automationSuitability &&
        !VALID_AUTOMATION_SUITABILITIES.includes(patch.automationSuitability)
      ) {
        throw new ValidationError(`Invalid automationSuitability: ${patch.automationSuitability}`);
      }
      updates.automationSuitability = patch.automationSuitability || undefined;
    }
    if (patch.automationReason !== undefined)
      updates.automationReason = patch.automationReason.trim() || '';

    updates.updatedAt = now();
    await db.testCases.update(id, updates);
    return (await db.testCases.get(id))!;
  }

  async function markRemoved(id: string): Promise<TestCase> {
    const existing = await db.testCases.get(id);
    if (!existing) throw new NotFoundError('TestCase', id);

    await db.testCases.update(id, { status: 'removed', updatedAt: now() });
    return (await db.testCases.get(id))!;
  }

  return { create, get, listByProject, listByFeature, listByViewpoint, update, markRemoved };
}

export type TestCaseRepository = ReturnType<typeof createTestCaseRepository>;
