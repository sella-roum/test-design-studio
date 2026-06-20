import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createTestCaseRepository } from '../repositories/testCaseRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-testcase-repo';

describe('testCaseRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createTestCaseRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createTestCaseRepository(db);
  });

  beforeEach(async () => {
    await db.testCases.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';
  const featureId = 'test-feature';

  it('creates a test case', async () => {
    const tc = await repo.create({
      projectId,
      featureId,
      title: '有効なメールアドレスで登録できる',
    });

    expect(tc.id).toBeTruthy();
    expect(tc.title).toBe('有効なメールアドレスで登録できる');
    expect(tc.steps).toEqual([]);
  });

  it('creates with steps', async () => {
    const tc = await repo.create({
      projectId,
      featureId,
      title: 'Test with steps',
      steps: [
        { action: 'navigate', instruction: 'Open login page' },
        {
          action: 'fill',
          instruction: 'Enter email',
          targetUiNodeId: 'u1',
          testData: 'user@test.com',
        },
        { action: 'click', instruction: 'Submit', expectedResult: 'Logged in' },
      ],
    });

    expect(tc.steps).toHaveLength(3);
    expect(tc.steps[0].order).toBe(1);
    expect(tc.steps[0].action).toBe('navigate');
    expect(tc.steps[1].testData).toBe('user@test.com');
    expect(tc.steps[2].expectedResult).toBe('Logged in');
  });

  it('creates with full options', async () => {
    const tc = await repo.create({
      projectId,
      featureId,
      viewpointId: 'vp1',
      title: 'Full test',
      preconditions: 'User is logged in',
      expectedResult: 'Success',
      testData: 'valid data',
      priority: 'high',
      automationSuitability: 'high',
      automationReason: 'Stable UI',
    });

    expect(tc.viewpointId).toBe('vp1');
    expect(tc.preconditions).toBe('User is logged in');
    expect(tc.priority).toBe('high');
    expect(tc.automationSuitability).toBe('high');
    expect(tc.automationReason).toBe('Stable UI');
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

  it('lists by viewpoint', async () => {
    await repo.create({ projectId, featureId, viewpointId: 'vp1', title: 'A' });
    await repo.create({ projectId, featureId, viewpointId: 'vp2', title: 'B' });

    const list = await repo.listByViewpoint('vp1');
    expect(list).toHaveLength(1);
  });

  it('excludes removed by default in listByViewpoint', async () => {
    const tc = await repo.create({ projectId, featureId, viewpointId: 'vp1', title: 'Test' });
    await repo.markRemoved(tc.id);

    const list = await repo.listByViewpoint('vp1');
    expect(list).toHaveLength(0);
  });

  it('includes removed when includeRemoved is true in listByViewpoint', async () => {
    const tc = await repo.create({ projectId, featureId, viewpointId: 'vp1', title: 'Test' });
    await repo.markRemoved(tc.id);

    const list = await repo.listByViewpoint('vp1', { includeRemoved: true });
    expect(list).toHaveLength(1);
  });

  it('updates test case', async () => {
    const tc = await repo.create({ projectId, featureId, title: 'Old' });
    const updated = await repo.update(tc.id, { title: 'New', priority: 'low' });

    expect(updated.title).toBe('New');
    expect(updated.priority).toBe('low');
  });

  it('replaces steps on update', async () => {
    const tc = await repo.create({
      projectId,
      featureId,
      title: 'Update steps',
      steps: [{ action: 'navigate', instruction: 'Step 1' }],
    });

    const updated = await repo.update(tc.id, {
      steps: [
        { action: 'click', instruction: 'New step 1' },
        { action: 'assert', instruction: 'New step 2' },
      ],
    });

    expect(updated.steps).toHaveLength(2);
    expect(updated.steps[0].order).toBe(1);
    expect(updated.steps[0].action).toBe('click');
  });

  it('marks removed', async () => {
    const tc = await repo.create({ projectId, featureId, title: 'Gone' });
    const removed = await repo.markRemoved(tc.id);

    expect(removed.status).toBe('removed');
  });
});
