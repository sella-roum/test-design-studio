import type { EntityBase, Confidence } from '../types';

/**
 * Reserved model: P0ではRepository・UIを実装しない。
 * P1/P2で仕様判断の根拠を管理する際に実装する。
 *
 * ExportBundleでは optional field として扱う。
 */

export type EvidenceSourceType =
  | 'spec'
  | 'figma'
  | 'notion'
  | 'slack'
  | 'meeting'
  | 'implementation'
  | 'manual-observation'
  | 'other';

export type Evidence = EntityBase & {
  sourceType: EvidenceSourceType;
  title: string;
  url?: string;
  quote?: string;
  note?: string;
  confidence: Confidence;
};
