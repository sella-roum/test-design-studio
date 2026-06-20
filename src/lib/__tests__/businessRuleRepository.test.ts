import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createBusinessRuleRepository } from '../repositories/businessRuleRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-businessrule-repo';

describe('businessRuleRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createBusinessRuleRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createBusinessRuleRepository(db);
  });

  beforeEach(async () => {
    await db.businessRules.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';

  it('creates a business rule', async () => {
    const rule = await repo.create({
      projectId,
      name: 'Email must be unique',
      description: 'User email must be unique across the system',
      ruleType: 'validation',
      confidence: 'confirmed',
    });

    expect(rule.id).toBeTruthy();
    expect(rule.name).toBe('Email must be unique');
    expect(rule.ruleType).toBe('validation');
    expect(rule.confidence).toBe('confirmed');
    expect(rule.status).toBe('active');
  });

  it('creates with optional references', async () => {
    const rule = await repo.create({
      projectId,
      featureId: 'f1',
      screenId: 's1',
      uiNodeId: 'u1',
      name: 'Admin only',
      description: 'Only admin can access',
      ruleType: 'permission',
      confidence: 'confirmed',
    });

    expect(rule.featureId).toBe('f1');
    expect(rule.screenId).toBe('s1');
    expect(rule.uiNodeId).toBe('u1');
  });

  it('throws on empty name', async () => {
    await expect(
      repo.create({
        projectId,
        name: '',
        description: 'desc',
        ruleType: 'validation',
        confidence: 'confirmed',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws on missing description', async () => {
    await expect(
      repo.create({
        projectId,
        name: 'Rule',
        description: '',
        ruleType: 'validation',
        confidence: 'confirmed',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws on invalid ruleType', async () => {
    await expect(
      repo.create({
        projectId,
        name: 'Bad',
        description: 'desc',
        ruleType: 'invalid' as never,
        confidence: 'confirmed',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('lists by project', async () => {
    await repo.create({
      projectId,
      name: 'A',
      description: 'desc',
      ruleType: 'validation',
      confidence: 'confirmed',
    });
    await repo.create({
      projectId,
      name: 'B',
      description: 'desc',
      ruleType: 'validation',
      confidence: 'tentative',
    });

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(2);
  });

  it('lists by feature', async () => {
    await repo.create({
      projectId,
      featureId: 'f1',
      name: 'A',
      description: 'desc',
      ruleType: 'validation',
      confidence: 'confirmed',
    });
    await repo.create({
      projectId,
      featureId: 'f2',
      name: 'B',
      description: 'desc',
      ruleType: 'validation',
      confidence: 'confirmed',
    });

    const list = await repo.listByFeature('f1');
    expect(list).toHaveLength(1);
  });

  it('excludes removed by default in listByFeature', async () => {
    const rule = await repo.create({
      projectId,
      featureId: 'f1',
      name: 'Hide',
      description: 'desc',
      ruleType: 'validation',
      confidence: 'confirmed',
    });
    await repo.markRemoved(rule.id);

    const list = await repo.listByFeature('f1');
    expect(list).toHaveLength(0);
  });

  it('includes removed when includeRemoved is true in listByFeature', async () => {
    const rule = await repo.create({
      projectId,
      featureId: 'f1',
      name: 'Show',
      description: 'desc',
      ruleType: 'validation',
      confidence: 'confirmed',
    });
    await repo.markRemoved(rule.id);

    const list = await repo.listByFeature('f1', { includeRemoved: true });
    expect(list).toHaveLength(1);
  });

  it('marks removed', async () => {
    const rule = await repo.create({
      projectId,
      name: 'Gone',
      description: 'desc',
      ruleType: 'validation',
      confidence: 'confirmed',
    });
    const removed = await repo.markRemoved(rule.id);

    expect(removed.status).toBe('removed');
  });
});
