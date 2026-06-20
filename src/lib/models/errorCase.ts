import type { EntityBase, Priority, Confidence } from '../types';

/**
 * Reserved model: P0ではRepository・UIを実装しない。
 * P1/P2で異常系の独立管理を扱う際に実装する。
 *
 * P0ではBusinessRule.ruleTypeの 'error' | 'exception' で代替してよい。
 */

export type ErrorCase = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  trigger: string;
  message?: string;
  recovery?: string;
  severity?: Priority;
  confidence: Confidence;
};
