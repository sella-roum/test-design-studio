import type { EntityBase } from '../types';

/**
 * Reserved model: P0ではRepository・UIを実装しない。
 * P2以降の技法ワークベンチで扱う際に実装する。
 */

export type DecisionTableRule = {
  id: string;
  conditions: Record<string, string>;
  actions: Record<string, string>;
  expectedResult?: string;
};

export type DecisionTable = EntityBase & {
  businessRuleId: string;
  conditions: string[];
  actions: string[];
  rules: DecisionTableRule[];
};
