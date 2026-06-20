import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { TestViewpoint, TestTechnique } from '../models/testViewpoint';
import type { Priority, AutomationSuitability } from '../types';
import type { ListOptions } from './listOptions';
import { filterRemoved } from './listOptions';

export function createTestViewpointRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  const VALID_TECHNIQUES: TestTechnique[] = [
    'equivalence',
    'boundary',
    'state-transition',
    'decision-table',
    'use-case',
    'exploratory',
  ];

  const VALID_PRIORITIES: Priority[] = ['high', 'medium', 'low'];
  const VALID_AUTOMATION_SUITABILITIES: AutomationSuitability[] = [
    'high',
    'medium',
    'low',
    'manual-only',
  ];

  type CreateInput = {
    projectId: string;
    featureId: string;
    title: string;
    description?: string;
    technique?: TestTechnique;
    priority?: Priority;
    automationSuitability?: AutomationSuitability;
    automationReason?: string;
  };

  type UpdateInput = Partial<
    Pick<
      TestViewpoint,
      | 'title'
      | 'description'
      | 'technique'
      | 'priority'
      | 'automationSuitability'
      | 'automationReason'
    >
  >;

  async function create(input: CreateInput): Promise<TestViewpoint> {
    if (!input.projectId) throw new ValidationError('projectId is required');
    if (!input.featureId) throw new ValidationError('featureId is required');
    if (!input.title || input.title.trim().length === 0)
      throw new ValidationError('TestViewpoint title is required');
    if (input.technique && !VALID_TECHNIQUES.includes(input.technique)) {
      throw new ValidationError(`Invalid technique: ${input.technique}`);
    }
    if (input.priority && !VALID_PRIORITIES.includes(input.priority)) {
      throw new ValidationError(`Invalid priority: ${input.priority}`);
    }
    if (
      input.automationSuitability &&
      !VALID_AUTOMATION_SUITABILITIES.includes(input.automationSuitability)
    ) {
      throw new ValidationError(`Invalid automationSuitability: ${input.automationSuitability}`);
    }

    const viewpoint: TestViewpoint = {
      id: generateId(),
      projectId: input.projectId,
      featureId: input.featureId,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      technique: input.technique,
      priority: input.priority,
      automationSuitability: input.automationSuitability,
      automationReason: input.automationReason?.trim() || undefined,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.testViewpoints.add(viewpoint);
    return viewpoint;
  }

  async function get(id: string): Promise<TestViewpoint | undefined> {
    return db.testViewpoints.get(id);
  }

  async function listByProject(projectId: string, options?: ListOptions): Promise<TestViewpoint[]> {
    const items = await db.testViewpoints.where('projectId').equals(projectId).toArray();
    return filterRemoved(items, options);
  }

  async function listByFeature(featureId: string, options?: ListOptions): Promise<TestViewpoint[]> {
    const items = await db.testViewpoints.where('featureId').equals(featureId).toArray();
    return filterRemoved(items, options);
  }

  async function update(id: string, patch: UpdateInput): Promise<TestViewpoint> {
    const existing = await db.testViewpoints.get(id);
    if (!existing) throw new NotFoundError('TestViewpoint', id);

    const updates: Partial<TestViewpoint> = {};
    if (patch.title !== undefined) {
      if (patch.title.trim().length === 0)
        throw new ValidationError('TestViewpoint title is required');
      updates.title = patch.title.trim();
    }
    if (patch.description !== undefined) updates.description = patch.description.trim() || '';
    if (patch.technique !== undefined) {
      if (patch.technique && !VALID_TECHNIQUES.includes(patch.technique)) {
        throw new ValidationError(`Invalid technique: ${patch.technique}`);
      }
      updates.technique = patch.technique || undefined;
    }
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
    await db.testViewpoints.update(id, updates);
    return (await db.testViewpoints.get(id))!;
  }

  async function markRemoved(id: string): Promise<TestViewpoint> {
    const existing = await db.testViewpoints.get(id);
    if (!existing) throw new NotFoundError('TestViewpoint', id);

    await db.testViewpoints.update(id, { status: 'removed', updatedAt: now() });
    return (await db.testViewpoints.get(id))!;
  }

  return { create, get, listByProject, listByFeature, update, markRemoved };
}

export type TestViewpointRepository = ReturnType<typeof createTestViewpointRepository>;
