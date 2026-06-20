import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { OpenQuestion, OpenQuestionStatus } from '../models/openQuestion';
import type { Confidence } from '../types';

export function createOpenQuestionRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  const VALID_QUESTION_STATUSES: OpenQuestionStatus[] = [
    'open',
    'answered',
    'deferred',
    'not_applicable',
  ];
  const VALID_CONFIDENCES: Confidence[] = ['confirmed', 'tentative', 'assumed', 'unknown'];

  type CreateInput = {
    projectId: string;
    featureId?: string;
    screenId?: string;
    uiNodeId?: string;
    question: string;
    context?: string;
    answer?: string;
    questionStatus: OpenQuestionStatus;
    confidence: Confidence;
  };

  type UpdateInput = Partial<
    Pick<
      OpenQuestion,
      | 'question'
      | 'context'
      | 'answer'
      | 'questionStatus'
      | 'confidence'
      | 'featureId'
      | 'screenId'
      | 'uiNodeId'
    >
  >;

  async function create(input: CreateInput): Promise<OpenQuestion> {
    if (!input.projectId) throw new ValidationError('projectId is required');
    if (!input.question || input.question.trim().length === 0) {
      throw new ValidationError('OpenQuestion question is required');
    }
    if (!VALID_QUESTION_STATUSES.includes(input.questionStatus)) {
      throw new ValidationError(`Invalid questionStatus: ${input.questionStatus}`);
    }
    if (!VALID_CONFIDENCES.includes(input.confidence)) {
      throw new ValidationError(`Invalid confidence: ${input.confidence}`);
    }

    const oq: OpenQuestion = {
      id: generateId(),
      projectId: input.projectId,
      featureId: input.featureId || undefined,
      screenId: input.screenId || undefined,
      uiNodeId: input.uiNodeId || undefined,
      question: input.question.trim(),
      context: input.context?.trim() || undefined,
      answer: input.answer?.trim() || undefined,
      questionStatus: input.questionStatus,
      confidence: input.confidence,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.openQuestions.add(oq);
    return oq;
  }

  async function get(id: string): Promise<OpenQuestion | undefined> {
    return db.openQuestions.get(id);
  }

  async function listByProject(projectId: string): Promise<OpenQuestion[]> {
    return db.openQuestions.where('[projectId+status]').equals([projectId, 'active']).toArray();
  }

  async function listByFeature(featureId: string): Promise<OpenQuestion[]> {
    return db.openQuestions.where('featureId').equals(featureId).toArray();
  }

  async function listByScreen(screenId: string): Promise<OpenQuestion[]> {
    return db.openQuestions.where('screenId').equals(screenId).toArray();
  }

  async function update(id: string, patch: UpdateInput): Promise<OpenQuestion> {
    const existing = await db.openQuestions.get(id);
    if (!existing) throw new NotFoundError('OpenQuestion', id);

    const updates: Partial<OpenQuestion> = {};
    if (patch.question !== undefined) {
      if (patch.question.trim().length === 0)
        throw new ValidationError('OpenQuestion question is required');
      updates.question = patch.question.trim();
    }
    if (patch.context !== undefined) updates.context = patch.context.trim() || '';
    if (patch.answer !== undefined) updates.answer = patch.answer.trim() || '';
    if (patch.questionStatus !== undefined) {
      if (!VALID_QUESTION_STATUSES.includes(patch.questionStatus)) {
        throw new ValidationError(`Invalid questionStatus: ${patch.questionStatus}`);
      }
      updates.questionStatus = patch.questionStatus;
    }
    if (patch.confidence !== undefined) {
      if (!VALID_CONFIDENCES.includes(patch.confidence)) {
        throw new ValidationError(`Invalid confidence: ${patch.confidence}`);
      }
      updates.confidence = patch.confidence;
    }
    if (patch.featureId !== undefined) updates.featureId = patch.featureId || undefined;
    if (patch.screenId !== undefined) updates.screenId = patch.screenId || undefined;
    if (patch.uiNodeId !== undefined) updates.uiNodeId = patch.uiNodeId || undefined;

    updates.updatedAt = now();
    await db.openQuestions.update(id, updates);
    return (await db.openQuestions.get(id))!;
  }

  async function markRemoved(id: string): Promise<OpenQuestion> {
    const existing = await db.openQuestions.get(id);
    if (!existing) throw new NotFoundError('OpenQuestion', id);

    await db.openQuestions.update(id, { status: 'removed', updatedAt: now() });
    return (await db.openQuestions.get(id))!;
  }

  return { create, get, listByProject, listByFeature, listByScreen, update, markRemoved };
}

export type OpenQuestionRepository = ReturnType<typeof createOpenQuestionRepository>;
