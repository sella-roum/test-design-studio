import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { DataField } from '../models/dataField';

export function createDataFieldRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  type CreateInput = {
    projectId: string;
    entityId: string;
    name: string;
    dataTypeId?: string;
    required?: boolean;
    unique?: boolean;
    description?: string;
  };

  type UpdateInput = Partial<
    Pick<DataField, 'name' | 'dataTypeId' | 'required' | 'unique' | 'description'>
  >;

  async function create(input: CreateInput): Promise<DataField> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }
    if (!input.entityId) {
      throw new ValidationError('entityId is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('DataField name is required');
    }

    const field: DataField = {
      id: generateId(),
      projectId: input.projectId,
      entityId: input.entityId,
      name: input.name.trim(),
      dataTypeId: input.dataTypeId || undefined,
      required: input.required,
      unique: input.unique,
      description: input.description?.trim() || undefined,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.dataFields.add(field);
    return field;
  }

  async function get(id: string): Promise<DataField | undefined> {
    return db.dataFields.get(id);
  }

  async function listByEntity(entityId: string): Promise<DataField[]> {
    return db.dataFields.where('entityId').equals(entityId).toArray();
  }

  async function listByProject(projectId: string): Promise<DataField[]> {
    return db.dataFields.where('projectId').equals(projectId).toArray();
  }

  async function update(id: string, patch: UpdateInput): Promise<DataField> {
    const existing = await db.dataFields.get(id);
    if (!existing) {
      throw new NotFoundError('DataField', id);
    }

    const updates: Partial<DataField> = {};
    if (patch.name !== undefined) {
      if (patch.name.trim().length === 0) {
        throw new ValidationError('DataField name is required');
      }
      updates.name = patch.name.trim();
    }
    if (patch.dataTypeId !== undefined) updates.dataTypeId = patch.dataTypeId || undefined;
    if (patch.required !== undefined) updates.required = patch.required;
    if (patch.unique !== undefined) updates.unique = patch.unique;
    if (patch.description !== undefined) {
      updates.description = patch.description.trim() || '';
    }

    updates.updatedAt = now();
    await db.dataFields.update(id, updates);
    return (await db.dataFields.get(id))!;
  }

  async function markRemoved(id: string): Promise<DataField> {
    const existing = await db.dataFields.get(id);
    if (!existing) {
      throw new NotFoundError('DataField', id);
    }

    await db.dataFields.update(id, { status: 'removed', updatedAt: now() });
    return (await db.dataFields.get(id))!;
  }

  return { create, get, listByEntity, listByProject, update, markRemoved };
}

export type DataFieldRepository = ReturnType<typeof createDataFieldRepository>;
