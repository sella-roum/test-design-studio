import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createTraceLinkRepository } from '../repositories/traceLinkRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-tracelink-repo';

describe('traceLinkRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createTraceLinkRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createTraceLinkRepository(db);
  });

  beforeEach(async () => {
    await db.traceLinks.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';

  it('creates a trace link', async () => {
    const link = await repo.create({
      projectId,
      fromType: 'testViewpoint',
      fromId: 'vp1',
      toType: 'testCase',
      toId: 'tc1',
      linkType: 'covers',
    });

    expect(link.id).toBeTruthy();
    expect(link.fromType).toBe('testViewpoint');
    expect(link.toType).toBe('testCase');
    expect(link.linkType).toBe('covers');
  });

  it('creates with reason', async () => {
    const link = await repo.create({
      projectId,
      fromType: 'testCase',
      fromId: 'tc1',
      toType: 'feature',
      toId: 'f1',
      linkType: 'validates',
      reason: 'Validates login feature',
    });

    expect(link.reason).toBe('Validates login feature');
  });

  it('throws on invalid fromType', async () => {
    await expect(
      repo.create({
        projectId,
        fromType: 'invalid' as never,
        fromId: 'x',
        toType: 'feature',
        toId: 'y',
        linkType: 'covers',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws on invalid linkType', async () => {
    await expect(
      repo.create({
        projectId,
        fromType: 'feature',
        fromId: 'x',
        toType: 'feature',
        toId: 'y',
        linkType: 'invalid' as never,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('lists by project', async () => {
    await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f1',
      toType: 'screen',
      toId: 's1',
      linkType: 'covers',
    });
    await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f2',
      toType: 'screen',
      toId: 's2',
      linkType: 'covers',
    });

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(2);
  });

  it('lists by from', async () => {
    await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f1',
      toType: 'screen',
      toId: 's1',
      linkType: 'covers',
    });
    await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f1',
      toType: 'screen',
      toId: 's2',
      linkType: 'covers',
    });
    await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f2',
      toType: 'screen',
      toId: 's3',
      linkType: 'covers',
    });

    const list = await repo.listByFrom('feature', 'f1');
    expect(list).toHaveLength(2);
  });

  it('lists by to', async () => {
    await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f1',
      toType: 'screen',
      toId: 's1',
      linkType: 'covers',
    });
    await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f2',
      toType: 'screen',
      toId: 's1',
      linkType: 'covers',
    });

    const list = await repo.listByTo('screen', 's1');
    expect(list).toHaveLength(2);
  });

  it('updates link type', async () => {
    const link = await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f1',
      toType: 'testCase',
      toId: 'tc1',
      linkType: 'covers',
    });

    const updated = await repo.update(link.id, { linkType: 'validates' });
    expect(updated.linkType).toBe('validates');
  });

  it('marks removed', async () => {
    const link = await repo.create({
      projectId,
      fromType: 'feature',
      fromId: 'f1',
      toType: 'testCase',
      toId: 'tc1',
      linkType: 'covers',
    });

    const removed = await repo.markRemoved(link.id);
    expect(removed.status).toBe('removed');
  });
});
