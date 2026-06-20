import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { TraceLink, TraceNodeType, TraceLinkType } from '../models/traceLink';

export function createTraceLinkRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

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

  const VALID_LINK_TYPES: TraceLinkType[] = [
    'covers',
    'derived_from',
    'impacts',
    'validates',
    'depends_on',
    'replaces',
    'supports',
  ];

  type CreateInput = {
    projectId: string;
    fromType: TraceNodeType;
    fromId: string;
    toType: TraceNodeType;
    toId: string;
    linkType: TraceLinkType;
    reason?: string;
  };

  type UpdateInput = Partial<Pick<TraceLink, 'linkType' | 'reason'>>;

  async function create(input: CreateInput): Promise<TraceLink> {
    if (!input.projectId) throw new ValidationError('projectId is required');
    if (!VALID_NODE_TYPES.includes(input.fromType)) {
      throw new ValidationError(`Invalid fromType: ${input.fromType}`);
    }
    if (!input.fromId) throw new ValidationError('fromId is required');
    if (!VALID_NODE_TYPES.includes(input.toType)) {
      throw new ValidationError(`Invalid toType: ${input.toType}`);
    }
    if (!input.toId) throw new ValidationError('toId is required');
    if (!VALID_LINK_TYPES.includes(input.linkType)) {
      throw new ValidationError(`Invalid linkType: ${input.linkType}`);
    }

    const link: TraceLink = {
      id: generateId(),
      projectId: input.projectId,
      fromType: input.fromType,
      fromId: input.fromId,
      toType: input.toType,
      toId: input.toId,
      linkType: input.linkType,
      reason: input.reason?.trim() || undefined,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.traceLinks.add(link);
    return link;
  }

  async function get(id: string): Promise<TraceLink | undefined> {
    return db.traceLinks.get(id);
  }

  async function listByProject(projectId: string): Promise<TraceLink[]> {
    return db.traceLinks.where('[projectId+status]').equals([projectId, 'active']).toArray();
  }

  async function listByFrom(fromType: TraceNodeType, fromId: string): Promise<TraceLink[]> {
    return db.traceLinks.where('[fromType+fromId]').equals([fromType, fromId]).toArray();
  }

  async function listByTo(toType: TraceNodeType, toId: string): Promise<TraceLink[]> {
    return db.traceLinks.where('[toType+toId]').equals([toType, toId]).toArray();
  }

  async function update(id: string, patch: UpdateInput): Promise<TraceLink> {
    const existing = await db.traceLinks.get(id);
    if (!existing) throw new NotFoundError('TraceLink', id);

    const updates: Partial<TraceLink> = {};
    if (patch.linkType !== undefined) {
      if (!VALID_LINK_TYPES.includes(patch.linkType)) {
        throw new ValidationError(`Invalid linkType: ${patch.linkType}`);
      }
      updates.linkType = patch.linkType;
    }
    if (patch.reason !== undefined) updates.reason = patch.reason.trim() || '';

    updates.updatedAt = now();
    await db.traceLinks.update(id, updates);
    return (await db.traceLinks.get(id))!;
  }

  async function markRemoved(id: string): Promise<TraceLink> {
    const existing = await db.traceLinks.get(id);
    if (!existing) throw new NotFoundError('TraceLink', id);

    await db.traceLinks.update(id, { status: 'removed', updatedAt: now() });
    return (await db.traceLinks.get(id))!;
  }

  return { create, get, listByProject, listByFrom, listByTo, update, markRemoved };
}

export type TraceLinkRepository = ReturnType<typeof createTraceLinkRepository>;
