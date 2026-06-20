import type { EntityBase, Confidence } from '../types';
import type { TraceNodeType } from './traceLink';

export type ChangeType =
  | 'added'
  | 'updated'
  | 'deprecated'
  | 'removed'
  | 'selector-changed'
  | 'accessible-name-changed'
  | 'role-changed'
  | 'state-changed'
  | 'description-changed'
  | 'behavior-changed'
  | 'validation-changed'
  | 'display-changed'
  | 'permission-changed';

export type ChangeRecord = EntityBase & {
  targetType: TraceNodeType;
  targetId: string;
  changeType: ChangeType;
  summary: string;
  before?: string;
  after?: string;
  reason?: string;
  confidence: Confidence;
};
