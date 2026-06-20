import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createDataTypeRepository } from '../repositories/dataTypeRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-datatype-repo';

describe('dataTypeRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createDataTypeRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createDataTypeRepository(db);
  });

  beforeEach(async () => {
    await db.dataTypes.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';

  it('creates a data type', async () => {
    const dt = await repo.create({
      projectId,
      name: 'Email',
      baseType: 'string',
    });

    expect(dt.id).toBeTruthy();
    expect(dt.name).toBe('Email');
    expect(dt.baseType).toBe('string');
    expect(dt.status).toBe('active');
  });

  it('creates with constraints', async () => {
    const dt = await repo.create({
      projectId,
      name: 'Age',
      baseType: 'number',
      constraints: { min: 0, max: 150, required: true },
      validExamples: ['25', '0'],
      invalidExamples: ['-1', '200'],
    });

    expect(dt.constraints?.min).toBe(0);
    expect(dt.constraints?.max).toBe(150);
    expect(dt.constraints?.required).toBe(true);
    expect(dt.validExamples).toEqual(['25', '0']);
    expect(dt.invalidExamples).toEqual(['-1', '200']);
  });

  it('creates enum type', async () => {
    const dt = await repo.create({
      projectId,
      name: 'Status',
      baseType: 'enum',
      constraints: { enumValues: ['active', 'inactive'] },
    });

    expect(dt.baseType).toBe('enum');
    expect(dt.constraints?.enumValues).toEqual(['active', 'inactive']);
  });

  it('throws on empty name', async () => {
    await expect(repo.create({ projectId, name: '', baseType: 'string' })).rejects.toThrow(
      ValidationError,
    );
  });

  it('throws on missing baseType', async () => {
    await expect(
      // @ts-expect-error testing missing baseType
      repo.create({ projectId, name: 'Test' }),
    ).rejects.toThrow(ValidationError);
  });

  it('lists by project', async () => {
    await repo.create({ projectId, name: 'Email', baseType: 'string' });
    await repo.create({ projectId, name: 'Age', baseType: 'number' });

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(2);
  });

  it('updates data type', async () => {
    const dt = await repo.create({
      projectId,
      name: 'Old',
      baseType: 'string',
    });
    const updated = await repo.update(dt.id, {
      name: 'New',
      constraints: { minLength: 1 },
    });

    expect(updated.name).toBe('New');
    expect(updated.constraints?.minLength).toBe(1);
  });

  it('marks removed', async () => {
    const dt = await repo.create({ projectId, name: 'Gone', baseType: 'string' });
    const removed = await repo.markRemoved(dt.id);

    expect(removed.status).toBe('removed');
  });

  it('excludes removed from list', async () => {
    const dt = await repo.create({ projectId, name: 'Hide', baseType: 'string' });
    await repo.markRemoved(dt.id);

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(0);
  });

  it('includes removed when includeRemoved is true in listByProject', async () => {
    const dt = await repo.create({ projectId, name: 'Hide', baseType: 'string' });
    await repo.markRemoved(dt.id);

    const list = await repo.listByProject(projectId, { includeRemoved: true });
    expect(list).toHaveLength(1);
  });
});
