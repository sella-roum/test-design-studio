import type { EntityBase, Confidence } from '../types';

export type BusinessRuleType =
  | 'validation'
  | 'permission'
  | 'display'
  | 'calculation'
  | 'workflow'
  | 'error'
  | 'exception'
  | 'other';

export type BusinessRule = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  name: string;
  description: string;
  ruleType: BusinessRuleType;
  confidence: Confidence;
};
