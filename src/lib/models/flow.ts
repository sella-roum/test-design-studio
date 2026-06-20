import type { EntityBase } from '../types';

/**
 * Reserved model: P0ではRepository・UIを実装しない。
 * P1/P2で画面遷移・フロー分析を扱う際に実装する。
 */

export type Flow = EntityBase & {
  featureId: string;
  name: string;
  purpose?: string;
  startScreenId?: string;
  endScreenId?: string;
  preconditions?: string;
  successCriteria?: string;
  alternativePaths?: string;
  exceptionPaths?: string;
};
