import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createTestViewpointRepository } from '../repositories/testViewpointRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-testviewpoint-repo';

describe('testViewpointRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createTestViewpointRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createTestViewpointRepository(db);
  });

  beforeEach(async () => {
    await db.testViewpoints.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';
  const featureId = 'test-feature';

  it('creates a test viewpoint', async () => {
    const vp = await repo.create({
      projectId,
      featureId,
      title: '入力値のバリデーション',
    });

    expect(vp.id).toBeTruthy();
    expect(vp.title).toBe('入力値のバリデーション');
    expect(vp.featureId).toBe(featureId);
    expect(vp.status).toBe('active');
  });

  it('creates with technique and priority', async () => {
    const vp = await repo.create({
      projectId,
      featureId,
      title: '境界値分析',
      technique: 'boundary',
      priority: 'high',
      description: '境界値周辺の挙動確認',
    });

    expect(vp.technique).toBe('boundary');
    expect(vp.priority).toBe('high');
    expect(vp.description).toBe('境界値周辺の挙動確認');
  });

  it('creates with automation settings', async () => {
    const vp = await repo.create({
      projectId,
      featureId,
      title: 'Automated',
      automationSuitability: 'high',
      automationReason: 'Easy to automate',
    });

    expect(vp.automationSuitability).toBe('high');
    expect(vp.automationReason).toBe('Easy to automate');
  });

  it('throws on empty title', async () => {
    await expect(repo.create({ projectId, featureId, title: '' })).rejects.toThrow(ValidationError);
  });

  it('throws on missing featureId', async () => {
    await expect(repo.create({ projectId, featureId: '', title: 'Test' })).rejects.toThrow(
      ValidationError,
    );
  });

  it('lists by project', async () => {
    await repo.create({ projectId, featureId, title: 'A' });
    await repo.create({ projectId, featureId, title: 'B' });

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(2);
  });

  it('lists by feature', async () => {
    await repo.create({ projectId, featureId, title: 'Mine' });
    await repo.create({ projectId, featureId: 'other-f', title: 'Other' });

    const list = await repo.listByFeature(featureId);
    expect(list).toHaveLength(1);
  });

  it('updates viewpoint', async () => {
    const vp = await repo.create({ projectId, featureId, title: 'Old' });
    const updated = await repo.update(vp.id, { title: 'New', priority: 'low' });

    expect(updated.title).toBe('New');
    expect(updated.priority).toBe('low');
  });

  it('marks removed', async () => {
    const vp = await repo.create({ projectId, featureId, title: 'Gone' });
    const removed = await repo.markRemoved(vp.id);

    expect(removed.status).toBe('removed');
  });
});
