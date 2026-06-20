import type { EntityBase } from '../types';

/**
 * Reserved model: P0ではRepository・UIを実装しない。
 * P1/P2で画面遷移・フロー分析を扱う際に実装する。
 */

export type StateTransitionTargetType = 'screen' | 'uiNode' | 'data' | 'flow' | 'other';

export type StateTransition = EntityBase & {
  featureId: string;
  targetType: StateTransitionTargetType;
  targetId?: string;
  fromStateId: string;
  toStateId: string;
  event: string;
  condition?: string;
  expectedResult?: string;
  valid: boolean;
};
