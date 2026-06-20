import type { Priority, Confidence } from '../types';
import type { EntityBase } from '../types';

export type Feature = EntityBase & {
  name: string;
  description?: string;
  purpose?: string;
  actor?: string;
  preconditions?: string;
  successCriteria?: string;
  failureConditions?: string;
  priority?: Priority;
  riskLevel?: Priority;
  confidence?: Confidence;
};
