import type { EntityBase, Confidence } from '../types';

/**
 * Reserved model: P0ではRepository・UIを実装しない。
 * P1/P2で値域・状態遷移テストを扱う際に実装する。
 */

export type StateScope =
  | 'app'
  | 'session'
  | 'screen'
  | 'uiNode'
  | 'form'
  | 'data'
  | 'flow'
  | 'async'
  | 'external';

export type State = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  dataEntityId?: string;
  name: string;
  scope: StateScope;
  condition?: string;
  observableResult?: string;
  allowedOperations?: string[];
  prohibitedOperations?: string[];
  confidence: Confidence;
};
