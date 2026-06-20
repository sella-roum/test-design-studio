import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createDataFieldRepository } from '../repositories/dataFieldRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-datafield-repo';

describe('dataFieldRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createDataFieldRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createDataFieldRepository(db);
  });

  beforeEach(async () => {
    await db.dataFields.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';
  const entityId = 'test-entity';
  const dataTypeId = 'test-datatype';

  it('creates a data field', async () => {
    const field = await repo.create({
      projectId,
      entityId,
      name: 'email',
    });

    expect(field.id).toBeTruthy();
    expect(field.entityId).toBe(entityId);
    expect(field.name).toBe('email');
  });

  it('creates with dataTypeId and options', async () => {
    const field = await repo.create({
      projectId,
      entityId,
      name: 'age',
      dataTypeId,
      required: true,
      unique: false,
      description: 'User age',
    });

    expect(field.dataTypeId).toBe(dataTypeId);
    expect(field.required).toBe(true);
    expect(field.unique).toBe(false);
    expect(field.description).toBe('User age');
  });

  it('throws on empty name', async () => {
    await expect(repo.create({ projectId, entityId, name: '' })).rejects.toThrow(ValidationError);
  });

  it('throws on missing entityId', async () => {
    await expect(repo.create({ projectId, entityId: '', name: 'x' })).rejects.toThrow(
      ValidationError,
    );
  });

  it('lists by entity', async () => {
    await repo.create({ projectId, entityId, name: 'a' });
    await repo.create({ projectId, entityId, name: 'b' });

    const list = await repo.listByEntity(entityId);
    expect(list).toHaveLength(2);
  });

  it('does not mix entities', async () => {
    await repo.create({ projectId, entityId, name: 'mine' });
    const list = await repo.listByEntity('other-entity');
    expect(list).toHaveLength(0);
  });

  it('updates field', async () => {
    const field = await repo.create({ projectId, entityId, name: 'old' });
    const updated = await repo.update(field.id, { name: 'new' });

    expect(updated.name).toBe('new');
  });

  it('marks removed', async () => {
    const field = await repo.create({ projectId, entityId, name: 'gone' });
    const removed = await repo.markRemoved(field.id);

    expect(removed.status).toBe('removed');
  });
});
