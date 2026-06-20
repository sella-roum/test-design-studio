import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { Screen, ScreenType } from '../models/screen';
import type { Confidence } from '../types';
import type { ListOptions } from './listOptions';
import { filterRemoved } from './listOptions';

export function createScreenRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  type CreateInput = {
    projectId: string;
    featureId: string;
    name: string;
    screenType?: ScreenType;
    urlPattern?: string;
    purpose?: string;
    preconditions?: string;
    description?: string;
    confidence?: Confidence;
  };

  type UpdateInput = Partial<
    Pick<
      Screen,
      | 'name'
      | 'screenType'
      | 'urlPattern'
      | 'purpose'
      | 'preconditions'
      | 'description'
      | 'confidence'
    >
  >;

  async function create(input: CreateInput): Promise<Screen> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }
    if (!input.featureId) {
      throw new ValidationError('featureId is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Screen name is required');
    }

    const screen: Screen = {
      id: generateId(),
      projectId: input.projectId,
      featureId: input.featureId,
      name: input.name.trim(),
      screenType: input.screenType,
      urlPattern: input.urlPattern?.trim(),
      purpose: input.purpose?.trim(),
      preconditions: input.preconditions?.trim(),
      description: input.description?.trim(),
      confidence: input.confidence,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.screens.add(screen);
    return screen;
  }

  async function get(id: string): Promise<Screen | undefined> {
    return db.screens.get(id);
  }

  async function listByProject(projectId: string, options?: ListOptions): Promise<Screen[]> {
    const items = await db.screens.where('projectId').equals(projectId).toArray();
    return filterRemoved(items, options);
  }

  async function listByFeature(featureId: string, options?: ListOptions): Promise<Screen[]> {
    const items = await db.screens.where('featureId').equals(featureId).toArray();
    return filterRemoved(items, options);
  }

  async function update(id: string, patch: UpdateInput): Promise<Screen> {
    const existing = await db.screens.get(id);
    if (!existing) {
      throw new NotFoundError('Screen', id);
    }

    const updates: Partial<Screen> = {};
    if (patch.name !== undefined) {
      if (patch.name.trim().length === 0) {
        throw new ValidationError('Screen name is required');
      }
      updates.name = patch.name.trim();
    }
    if (patch.screenType !== undefined) updates.screenType = patch.screenType;
    if (patch.urlPattern !== undefined) updates.urlPattern = patch.urlPattern.trim() || '';
    if (patch.purpose !== undefined) updates.purpose = patch.purpose.trim() || '';
    if (patch.preconditions !== undefined) updates.preconditions = patch.preconditions.trim() || '';
    if (patch.description !== undefined) updates.description = patch.description.trim() || '';
    if (patch.confidence !== undefined) updates.confidence = patch.confidence || undefined;

    updates.updatedAt = now();
    await db.screens.update(id, updates);
    return (await db.screens.get(id))!;
  }

  async function markRemoved(id: string): Promise<Screen> {
    const existing = await db.screens.get(id);
    if (!existing) {
      throw new NotFoundError('Screen', id);
    }

    await db.screens.update(id, { status: 'removed', updatedAt: now() });
    return (await db.screens.get(id))!;
  }

  return { create, get, listByProject, listByFeature, update, markRemoved };
}

export type ScreenRepository = ReturnType<typeof createScreenRepository>;
