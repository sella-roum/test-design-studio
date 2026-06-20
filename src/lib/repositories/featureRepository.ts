import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { Feature } from '../models/feature';
import type { Priority, Confidence } from '../types';

export function createFeatureRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  type CreateInput = {
    projectId: string;
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
  };

  type UpdateInput = Partial<
    Pick<
      Feature,
      | 'name'
      | 'description'
      | 'purpose'
      | 'actor'
      | 'preconditions'
      | 'successCriteria'
      | 'failureConditions'
      | 'priority'
      | 'riskLevel'
      | 'confidence'
    >
  >;

  async function create(input: CreateInput): Promise<Feature> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Feature name is required');
    }

    const feature: Feature = {
      id: generateId(),
      projectId: input.projectId,
      name: input.name.trim(),
      description: input.description?.trim(),
      purpose: input.purpose?.trim(),
      actor: input.actor?.trim(),
      preconditions: input.preconditions?.trim(),
      successCriteria: input.successCriteria?.trim(),
      failureConditions: input.failureConditions?.trim(),
      priority: input.priority,
      riskLevel: input.riskLevel,
      confidence: input.confidence,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.features.add(feature);
    return feature;
  }

  async function get(id: string): Promise<Feature | undefined> {
    return db.features.get(id);
  }

  async function listByProject(projectId: string): Promise<Feature[]> {
    return db.features.where('[projectId+status]').equals([projectId, 'active']).toArray();
  }

  async function update(id: string, patch: UpdateInput): Promise<Feature> {
    const existing = await db.features.get(id);
    if (!existing) {
      throw new NotFoundError('Feature', id);
    }

    const updates: Partial<Feature> = {};
    if (patch.name !== undefined) {
      if (patch.name.trim().length === 0) {
        throw new ValidationError('Feature name is required');
      }
      updates.name = patch.name.trim();
    }
    if (patch.description !== undefined) updates.description = patch.description.trim() || '';
    if (patch.purpose !== undefined) updates.purpose = patch.purpose.trim() || '';
    if (patch.actor !== undefined) updates.actor = patch.actor.trim() || '';
    if (patch.preconditions !== undefined) updates.preconditions = patch.preconditions.trim() || '';
    if (patch.successCriteria !== undefined)
      updates.successCriteria = patch.successCriteria.trim() || '';
    if (patch.failureConditions !== undefined)
      updates.failureConditions = patch.failureConditions.trim() || '';
    if (patch.priority !== undefined) updates.priority = patch.priority || undefined;
    if (patch.riskLevel !== undefined) updates.riskLevel = patch.riskLevel || undefined;
    if (patch.confidence !== undefined) updates.confidence = patch.confidence || undefined;

    updates.updatedAt = now();
    await db.features.update(id, updates);
    return (await db.features.get(id))!;
  }

  async function markRemoved(id: string): Promise<Feature> {
    const existing = await db.features.get(id);
    if (!existing) {
      throw new NotFoundError('Feature', id);
    }

    await db.features.update(id, { status: 'removed', updatedAt: now() });
    return (await db.features.get(id))!;
  }

  return { create, get, listByProject, update, markRemoved };
}

export type FeatureRepository = ReturnType<typeof createFeatureRepository>;
