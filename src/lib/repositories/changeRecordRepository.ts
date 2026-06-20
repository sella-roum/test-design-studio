import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { ChangeRecord, ChangeType } from '../models/changeRecord';
import type { TraceNodeType } from '../models/traceLink';
import type { Confidence } from '../types';

export function createChangeRecordRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  const VALID_CHANGE_TYPES: ChangeType[] = [
    'added',
    'updated',
    'deprecated',
    'removed',
    'selector-changed',
    'accessible-name-changed',
    'role-changed',
    'state-changed',
    'description-changed',
    'behavior-changed',
    'validation-changed',
    'display-changed',
    'permission-changed',
  ];

  const VALID_NODE_TYPES: TraceNodeType[] = [
    'feature',
    'screen',
    'uiNode',
    'dataType',
    'dataEntity',
    'dataField',
    'businessRule',
    'openQuestion',
    'state',
    'stateTransition',
    'flow',
    'flowStep',
    'errorCase',
    'decisionTable',
    'testViewpoint',
    'testCase',
    'traceLink',
    'changeRecord',
    'evidence',
  ];

  const VALID_CONFIDENCES: Confidence[] = ['confirmed', 'tentative', 'assumed', 'unknown'];

  type CreateInput = {
    projectId: string;
    targetType: TraceNodeType;
    targetId: string;
    changeType: ChangeType;
    summary: string;
    before?: string;
    after?: string;
    reason?: string;
    confidence: Confidence;
  };

  type UpdateInput = Partial<
    Pick<ChangeRecord, 'summary' | 'before' | 'after' | 'reason' | 'confidence'>
  >;

  async function create(input: CreateInput): Promise<ChangeRecord> {
    if (!input.projectId) throw new ValidationError('projectId is required');
    if (!VALID_NODE_TYPES.includes(input.targetType)) {
      throw new ValidationError(`Invalid targetType: ${input.targetType}`);
    }
    if (!input.targetId) throw new ValidationError('targetId is required');
    if (!VALID_CHANGE_TYPES.includes(input.changeType)) {
      throw new ValidationError(`Invalid changeType: ${input.changeType}`);
    }
    if (!input.summary || input.summary.trim().length === 0) {
      throw new ValidationError('ChangeRecord summary is required');
    }
    if (!VALID_CONFIDENCES.includes(input.confidence)) {
      throw new ValidationError(`Invalid confidence: ${input.confidence}`);
    }

    const record: ChangeRecord = {
      id: generateId(),
      projectId: input.projectId,
      targetType: input.targetType,
      targetId: input.targetId,
      changeType: input.changeType,
      summary: input.summary.trim(),
      before: input.before?.trim() || undefined,
      after: input.after?.trim() || undefined,
      reason: input.reason?.trim() || undefined,
      confidence: input.confidence,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.changeRecords.add(record);
    return record;
  }

  async function get(id: string): Promise<ChangeRecord | undefined> {
    return db.changeRecords.get(id);
  }

  async function listByProject(projectId: string): Promise<ChangeRecord[]> {
    return db.changeRecords.where('[projectId+status]').equals([projectId, 'active']).toArray();
  }

  async function listByTarget(
    targetType: TraceNodeType,
    targetId: string,
  ): Promise<ChangeRecord[]> {
    return db.changeRecords.where('[targetType+targetId]').equals([targetType, targetId]).toArray();
  }

  async function update(id: string, patch: UpdateInput): Promise<ChangeRecord> {
    const existing = await db.changeRecords.get(id);
    if (!existing) throw new NotFoundError('ChangeRecord', id);

    const updates: Partial<ChangeRecord> = {};
    if (patch.summary !== undefined) {
      if (patch.summary.trim().length === 0)
        throw new ValidationError('ChangeRecord summary is required');
      updates.summary = patch.summary.trim();
    }
    if (patch.before !== undefined) updates.before = patch.before.trim() || '';
    if (patch.after !== undefined) updates.after = patch.after.trim() || '';
    if (patch.reason !== undefined) updates.reason = patch.reason.trim() || '';
    if (patch.confidence !== undefined) {
      if (!VALID_CONFIDENCES.includes(patch.confidence)) {
        throw new ValidationError(`Invalid confidence: ${patch.confidence}`);
      }
      updates.confidence = patch.confidence;
    }

    updates.updatedAt = now();
    await db.changeRecords.update(id, updates);
    return (await db.changeRecords.get(id))!;
  }

  async function markRemoved(id: string): Promise<ChangeRecord> {
    const existing = await db.changeRecords.get(id);
    if (!existing) throw new NotFoundError('ChangeRecord', id);

    await db.changeRecords.update(id, { status: 'removed', updatedAt: now() });
    return (await db.changeRecords.get(id))!;
  }

  return { create, get, listByProject, listByTarget, update, markRemoved };
}

export type ChangeRecordRepository = ReturnType<typeof createChangeRecordRepository>;
