import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createChangeRecordRepository } from '../repositories/changeRecordRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-changerecord-repo';

describe('changeRecordRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createChangeRecordRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createChangeRecordRepository(db);
  });

  beforeEach(async () => {
    await db.changeRecords.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';

  it('creates a change record', async () => {
    const cr = await repo.create({
      projectId,
      targetType: 'feature',
      targetId: 'f1',
      changeType: 'added',
      summary: 'Feature created',
      confidence: 'confirmed',
    });

    expect(cr.id).toBeTruthy();
    expect(cr.targetType).toBe('feature');
    expect(cr.changeType).toBe('added');
    expect(cr.summary).toBe('Feature created');
  });

  it('creates with before/after values', async () => {
    const cr = await repo.create({
      projectId,
      targetType: 'businessRule',
      targetId: 'br1',
      changeType: 'updated',
      summary: 'Validation rule changed',
      before: 'min: 0',
      after: 'min: 1',
      reason: 'Business requirement change',
      confidence: 'confirmed',
    });

    expect(cr.before).toBe('min: 0');
    expect(cr.after).toBe('min: 1');
    expect(cr.reason).toBe('Business requirement change');
  });

  it('throws on empty summary', async () => {
    await expect(
      repo.create({
        projectId,
        targetType: 'feature',
        targetId: 'f1',
        changeType: 'added',
        summary: '',
        confidence: 'confirmed',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws on invalid changeType', async () => {
    await expect(
      repo.create({
        projectId,
        targetType: 'feature',
        targetId: 'f1',
        changeType: 'invalid' as never,
        summary: 'Test',
        confidence: 'confirmed',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws on invalid targetType', async () => {
    await expect(
      repo.create({
        projectId,
        targetType: 'invalid' as never,
        targetId: 'x',
        changeType: 'added',
        summary: 'Test',
        confidence: 'confirmed',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('lists by project', async () => {
    await repo.create({
      projectId,
      targetType: 'feature',
      targetId: 'f1',
      changeType: 'added',
      summary: 'A',
      confidence: 'confirmed',
    });
    await repo.create({
      projectId,
      targetType: 'feature',
      targetId: 'f2',
      changeType: 'updated',
      summary: 'B',
      confidence: 'confirmed',
    });

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(2);
  });

  it('lists by target', async () => {
    await repo.create({
      projectId,
      targetType: 'feature',
      targetId: 'f1',
      changeType: 'added',
      summary: 'A',
      confidence: 'confirmed',
    });
    await repo.create({
      projectId,
      targetType: 'feature',
      targetId: 'f1',
      changeType: 'updated',
      summary: 'B',
      confidence: 'confirmed',
    });
    await repo.create({
      projectId,
      targetType: 'feature',
      targetId: 'f2',
      changeType: 'added',
      summary: 'C',
      confidence: 'confirmed',
    });

    const list = await repo.listByTarget('feature', 'f1');
    expect(list).toHaveLength(2);
  });

  it('updates change record', async () => {
    const cr = await repo.create({
      projectId,
      targetType: 'feature',
      targetId: 'f1',
      changeType: 'updated',
      summary: 'Old summary',
      confidence: 'tentative',
    });

    const updated = await repo.update(cr.id, {
      summary: 'Updated summary',
      confidence: 'confirmed',
    });

    expect(updated.summary).toBe('Updated summary');
    expect(updated.confidence).toBe('confirmed');
  });

  it('marks removed', async () => {
    const cr = await repo.create({
      projectId,
      targetType: 'feature',
      targetId: 'f1',
      changeType: 'added',
      summary: 'Gone',
      confidence: 'confirmed',
    });

    const removed = await repo.markRemoved(cr.id);
    expect(removed.status).toBe('removed');
  });
});
