import type { EntityBase, Confidence } from '../types';

export type OpenQuestionStatus = 'open' | 'answered' | 'deferred' | 'not_applicable';

export type OpenQuestion = EntityBase & {
  featureId?: string;
  screenId?: string;
  uiNodeId?: string;
  question: string;
  context?: string;
  answer?: string;
  questionStatus: OpenQuestionStatus;
  confidence: Confidence;
};
