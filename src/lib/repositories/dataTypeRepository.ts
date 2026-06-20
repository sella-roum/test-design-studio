import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { DataType, BaseType, DataTypeConstraints } from '../models/dataType';
import type { ListOptions } from './listOptions';
import { filterRemoved } from './listOptions';

export function createDataTypeRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  type CreateInput = {
    projectId: string;
    name: string;
    baseType: BaseType;
    description?: string;
    constraints?: DataTypeConstraints;
    validExamples?: string[];
    invalidExamples?: string[];
  };

  type UpdateInput = Partial<
    Pick<
      DataType,
      'name' | 'baseType' | 'description' | 'constraints' | 'validExamples' | 'invalidExamples'
    >
  >;

  async function create(input: CreateInput): Promise<DataType> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('DataType name is required');
    }
    if (!input.baseType) {
      throw new ValidationError('baseType is required');
    }

    const dt: DataType = {
      id: generateId(),
      projectId: input.projectId,
      name: input.name.trim(),
      baseType: input.baseType,
      description: input.description?.trim() || undefined,
      constraints: input.constraints,
      validExamples: input.validExamples,
      invalidExamples: input.invalidExamples,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.dataTypes.add(dt);
    return dt;
  }

  async function get(id: string): Promise<DataType | undefined> {
    return db.dataTypes.get(id);
  }

  async function listByProject(projectId: string, options?: ListOptions): Promise<DataType[]> {
    const items = await db.dataTypes.where('projectId').equals(projectId).toArray();
    return filterRemoved(items, options);
  }

  async function update(id: string, patch: UpdateInput): Promise<DataType> {
    const existing = await db.dataTypes.get(id);
    if (!existing) {
      throw new NotFoundError('DataType', id);
    }

    const updates: Partial<DataType> = {};
    if (patch.name !== undefined) {
      if (patch.name.trim().length === 0) {
        throw new ValidationError('DataType name is required');
      }
      updates.name = patch.name.trim();
    }
    if (patch.baseType !== undefined) updates.baseType = patch.baseType;
    if (patch.description !== undefined) {
      updates.description = patch.description.trim() || '';
    }
    if (patch.constraints !== undefined) updates.constraints = patch.constraints;
    if (patch.validExamples !== undefined) updates.validExamples = patch.validExamples;
    if (patch.invalidExamples !== undefined) updates.invalidExamples = patch.invalidExamples;

    updates.updatedAt = now();
    await db.dataTypes.update(id, updates);
    return (await db.dataTypes.get(id))!;
  }

  async function markRemoved(id: string): Promise<DataType> {
    const existing = await db.dataTypes.get(id);
    if (!existing) {
      throw new NotFoundError('DataType', id);
    }

    await db.dataTypes.update(id, { status: 'removed', updatedAt: now() });
    return (await db.dataTypes.get(id))!;
  }

  return { create, get, listByProject, update, markRemoved };
}

export type DataTypeRepository = ReturnType<typeof createDataTypeRepository>;
