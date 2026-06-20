import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { BusinessRule, BusinessRuleType } from '../models/businessRule';
import type { Confidence } from '../types';
import type { ListOptions } from './listOptions';
import { filterRemoved } from './listOptions';

export function createBusinessRuleRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  const VALID_RULE_TYPES: BusinessRuleType[] = [
    'validation',
    'permission',
    'display',
    'calculation',
    'workflow',
    'error',
    'exception',
    'other',
  ];

  const VALID_CONFIDENCES: Confidence[] = ['confirmed', 'tentative', 'assumed', 'unknown'];

  type CreateInput = {
    projectId: string;
    featureId?: string;
    screenId?: string;
    uiNodeId?: string;
    name: string;
    description: string;
    ruleType: BusinessRuleType;
    confidence: Confidence;
  };

  type UpdateInput = Partial<
    Pick<
      BusinessRule,
      'name' | 'description' | 'ruleType' | 'confidence' | 'featureId' | 'screenId' | 'uiNodeId'
    >
  >;

  async function create(input: CreateInput): Promise<BusinessRule> {
    if (!input.projectId) throw new ValidationError('projectId is required');
    if (!input.name || input.name.trim().length === 0)
      throw new ValidationError('BusinessRule name is required');
    if (!input.description) throw new ValidationError('BusinessRule description is required');
    if (!VALID_RULE_TYPES.includes(input.ruleType))
      throw new ValidationError(`Invalid ruleType: ${input.ruleType}`);
    if (!VALID_CONFIDENCES.includes(input.confidence))
      throw new ValidationError(`Invalid confidence: ${input.confidence}`);

    const rule: BusinessRule = {
      id: generateId(),
      projectId: input.projectId,
      featureId: input.featureId || undefined,
      screenId: input.screenId || undefined,
      uiNodeId: input.uiNodeId || undefined,
      name: input.name.trim(),
      description: input.description.trim(),
      ruleType: input.ruleType,
      confidence: input.confidence,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.businessRules.add(rule);
    return rule;
  }

  async function get(id: string): Promise<BusinessRule | undefined> {
    return db.businessRules.get(id);
  }

  async function listByProject(projectId: string, options?: ListOptions): Promise<BusinessRule[]> {
    const items = await db.businessRules.where('projectId').equals(projectId).toArray();
    return filterRemoved(items, options);
  }

  async function listByFeature(featureId: string, options?: ListOptions): Promise<BusinessRule[]> {
    const items = await db.businessRules.where('featureId').equals(featureId).toArray();
    return filterRemoved(items, options);
  }

  async function listByScreen(screenId: string, options?: ListOptions): Promise<BusinessRule[]> {
    const items = await db.businessRules.where('screenId').equals(screenId).toArray();
    return filterRemoved(items, options);
  }

  async function update(id: string, patch: UpdateInput): Promise<BusinessRule> {
    const existing = await db.businessRules.get(id);
    if (!existing) throw new NotFoundError('BusinessRule', id);

    const updates: Partial<BusinessRule> = {};
    if (patch.name !== undefined) {
      if (patch.name.trim().length === 0)
        throw new ValidationError('BusinessRule name is required');
      updates.name = patch.name.trim();
    }
    if (patch.description !== undefined) updates.description = patch.description.trim();
    if (patch.ruleType !== undefined) {
      if (!VALID_RULE_TYPES.includes(patch.ruleType))
        throw new ValidationError(`Invalid ruleType: ${patch.ruleType}`);
      updates.ruleType = patch.ruleType;
    }
    if (patch.confidence !== undefined) {
      if (!VALID_CONFIDENCES.includes(patch.confidence))
        throw new ValidationError(`Invalid confidence: ${patch.confidence}`);
      updates.confidence = patch.confidence;
    }
    if (patch.featureId !== undefined) updates.featureId = patch.featureId || undefined;
    if (patch.screenId !== undefined) updates.screenId = patch.screenId || undefined;
    if (patch.uiNodeId !== undefined) updates.uiNodeId = patch.uiNodeId || undefined;

    updates.updatedAt = now();
    await db.businessRules.update(id, updates);
    return (await db.businessRules.get(id))!;
  }

  async function markRemoved(id: string): Promise<BusinessRule> {
    const existing = await db.businessRules.get(id);
    if (!existing) throw new NotFoundError('BusinessRule', id);

    await db.businessRules.update(id, { status: 'removed', updatedAt: now() });
    return (await db.businessRules.get(id))!;
  }

  return { create, get, listByProject, listByFeature, listByScreen, update, markRemoved };
}

export type BusinessRuleRepository = ReturnType<typeof createBusinessRuleRepository>;
