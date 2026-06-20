import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { DataEntity } from '../models/dataEntity';

export function createDataEntityRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  type CreateInput = {
    projectId: string;
    name: string;
    description?: string;
  };

  type UpdateInput = Partial<Pick<DataEntity, 'name' | 'description'>>;

  async function create(input: CreateInput): Promise<DataEntity> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('DataEntity name is required');
    }

    const entity: DataEntity = {
      id: generateId(),
      projectId: input.projectId,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.dataEntities.add(entity);
    return entity;
  }

  async function get(id: string): Promise<DataEntity | undefined> {
    return db.dataEntities.get(id);
  }

  async function listByProject(projectId: string): Promise<DataEntity[]> {
    return db.dataEntities.where('[projectId+status]').equals([projectId, 'active']).toArray();
  }

  async function update(id: string, patch: UpdateInput): Promise<DataEntity> {
    const existing = await db.dataEntities.get(id);
    if (!existing) {
      throw new NotFoundError('DataEntity', id);
    }

    const updates: Partial<DataEntity> = {};
    if (patch.name !== undefined) {
      if (patch.name.trim().length === 0) {
        throw new ValidationError('DataEntity name is required');
      }
      updates.name = patch.name.trim();
    }
    if (patch.description !== undefined) {
      updates.description = patch.description.trim() || '';
    }

    updates.updatedAt = now();
    await db.dataEntities.update(id, updates);
    return (await db.dataEntities.get(id))!;
  }

  async function markRemoved(id: string): Promise<DataEntity> {
    const existing = await db.dataEntities.get(id);
    if (!existing) {
      throw new NotFoundError('DataEntity', id);
    }

    await db.dataEntities.update(id, { status: 'removed', updatedAt: now() });
    return (await db.dataEntities.get(id))!;
  }

  return { create, get, listByProject, update, markRemoved };
}

export type DataEntityRepository = ReturnType<typeof createDataEntityRepository>;
