export type TraceNodeType =
  | 'feature'
  | 'screen'
  | 'uiNode'
  | 'dataType'
  | 'dataEntity'
  | 'dataField'
  | 'businessRule'
  | 'openQuestion'
  | 'state'
  | 'stateTransition'
  | 'flow'
  | 'flowStep'
  | 'errorCase'
  | 'decisionTable'
  | 'testViewpoint'
  | 'testCase'
  | 'traceLink'
  | 'changeRecord'
  | 'evidence';

export type TraceLinkType =
  | 'covers'
  | 'derived_from'
  | 'impacts'
  | 'validates'
  | 'depends_on'
  | 'replaces'
  | 'supports';

import type { EntityBase } from '../types';

export type TraceLink = EntityBase & {
  fromType: TraceNodeType;
  fromId: string;
  toType: TraceNodeType;
  toId: string;
  linkType: TraceLinkType;
  reason?: string;
};
