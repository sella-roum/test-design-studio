import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createDataEntityRepository } from '../repositories/dataEntityRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-dataentity-repo';

describe('dataEntityRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createDataEntityRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createDataEntityRepository(db);
  });

  beforeEach(async () => {
    await db.dataEntities.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';

  it('creates a data entity', async () => {
    const entity = await repo.create({ projectId, name: 'User' });

    expect(entity.id).toBeTruthy();
    expect(entity.name).toBe('User');
    expect(entity.status).toBe('active');
  });

  it('creates with description', async () => {
    const entity = await repo.create({
      projectId,
      name: 'Order',
      description: 'Order entity',
    });

    expect(entity.description).toBe('Order entity');
  });

  it('throws on empty name', async () => {
    await expect(repo.create({ projectId, name: '' })).rejects.toThrow(ValidationError);
  });

  it('gets by id', async () => {
    const created = await repo.create({ projectId, name: 'Product' });
    const found = await repo.get(created.id);

    expect(found).toBeTruthy();
    expect(found!.name).toBe('Product');
  });

  it('lists by project', async () => {
    await repo.create({ projectId, name: 'A' });
    await repo.create({ projectId, name: 'B' });

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(2);
  });

  it('updates name', async () => {
    const entity = await repo.create({ projectId, name: 'Old' });
    const updated = await repo.update(entity.id, { name: 'New' });

    expect(updated.name).toBe('New');
  });

  it('marks removed', async () => {
    const entity = await repo.create({ projectId, name: 'Gone' });
    const removed = await repo.markRemoved(entity.id);

    expect(removed.status).toBe('removed');
  });

  it('excludes removed from list', async () => {
    const entity = await repo.create({ projectId, name: 'Hide' });
    await repo.markRemoved(entity.id);

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(0);
  });

  it('includes removed when includeRemoved is true in listByProject', async () => {
    const entity = await repo.create({ projectId, name: 'Hide' });
    await repo.markRemoved(entity.id);

    const list = await repo.listByProject(projectId, { includeRemoved: true });
    expect(list).toHaveLength(1);
  });
});
