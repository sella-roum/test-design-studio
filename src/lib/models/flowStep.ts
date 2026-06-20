import type { EntityBase } from '../types';

/**
 * Reserved model: P0ではRepository・UIを実装しない。
 * P1/P2で画面遷移・フロー分析を扱う際に実装する。
 */

export type FlowStep = EntityBase & {
  flowId: string;
  order: number;
  screenId?: string;
  uiNodeId?: string;
  operation: string;
  expectedResult?: string;
  branchCondition?: string;
};
