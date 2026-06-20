import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createOpenQuestionRepository } from '../repositories/openQuestionRepository';
import { ValidationError } from '../errors';

const TEST_DB_NAME = 'test-openquestion-repo';

describe('openQuestionRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createOpenQuestionRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createOpenQuestionRepository(db);
  });

  beforeEach(async () => {
    await db.openQuestions.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';

  it('creates an open question', async () => {
    const oq = await repo.create({
      projectId,
      question: 'Does this field accept Unicode?',
      questionStatus: 'open',
      confidence: 'tentative',
    });

    expect(oq.id).toBeTruthy();
    expect(oq.question).toBe('Does this field accept Unicode?');
    expect(oq.questionStatus).toBe('open');
    expect(oq.confidence).toBe('tentative');
  });

  it('creates with optional references and answer', async () => {
    const oq = await repo.create({
      projectId,
      featureId: 'f1',
      screenId: 's1',
      uiNodeId: 'u1',
      question: 'Is this field required?',
      context: 'Registration form',
      answer: 'Yes, it is required',
      questionStatus: 'answered',
      confidence: 'confirmed',
    });

    expect(oq.featureId).toBe('f1');
    expect(oq.screenId).toBe('s1');
    expect(oq.uiNodeId).toBe('u1');
    expect(oq.context).toBe('Registration form');
    expect(oq.answer).toBe('Yes, it is required');
  });

  it('throws on empty question', async () => {
    await expect(
      repo.create({ projectId, question: '', questionStatus: 'open', confidence: 'confirmed' }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws on invalid questionStatus', async () => {
    await expect(
      repo.create({
        projectId,
        question: 'Q',
        questionStatus: 'invalid' as never,
        confidence: 'confirmed',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('lists by project', async () => {
    await repo.create({
      projectId,
      question: 'Q1',
      questionStatus: 'open',
      confidence: 'tentative',
    });
    await repo.create({
      projectId,
      question: 'Q2',
      questionStatus: 'answered',
      confidence: 'confirmed',
    });

    const list = await repo.listByProject(projectId);
    expect(list).toHaveLength(2);
  });

  it('lists by feature', async () => {
    await repo.create({
      projectId,
      featureId: 'f1',
      question: 'Q1',
      questionStatus: 'open',
      confidence: 'tentative',
    });
    await repo.create({
      projectId,
      featureId: 'f2',
      question: 'Q2',
      questionStatus: 'open',
      confidence: 'tentative',
    });

    const list = await repo.listByFeature('f1');
    expect(list).toHaveLength(1);
  });

  it('excludes removed by default in listByFeature', async () => {
    const oq = await repo.create({
      projectId,
      featureId: 'f1',
      question: 'Test?',
      questionStatus: 'open',
      confidence: 'tentative',
    });
    await repo.markRemoved(oq.id);

    const list = await repo.listByFeature('f1');
    expect(list).toHaveLength(0);
  });

  it('includes removed when includeRemoved is true in listByFeature', async () => {
    const oq = await repo.create({
      projectId,
      featureId: 'f1',
      question: 'Test?',
      questionStatus: 'open',
      confidence: 'tentative',
    });
    await repo.markRemoved(oq.id);

    const list = await repo.listByFeature('f1', { includeRemoved: true });
    expect(list).toHaveLength(1);
  });

  it('updates status and answer', async () => {
    const oq = await repo.create({
      projectId,
      question: 'Test?',
      questionStatus: 'open',
      confidence: 'tentative',
    });

    const updated = await repo.update(oq.id, {
      questionStatus: 'answered',
      answer: 'Yes',
      confidence: 'confirmed',
    });

    expect(updated.questionStatus).toBe('answered');
    expect(updated.answer).toBe('Yes');
    expect(updated.confidence).toBe('confirmed');
  });

  it('marks removed', async () => {
    const oq = await repo.create({
      projectId,
      question: 'Gone?',
      questionStatus: 'open',
      confidence: 'tentative',
    });

    const removed = await repo.markRemoved(oq.id);
    expect(removed.status).toBe('removed');
  });
});
