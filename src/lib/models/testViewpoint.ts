import type { EntityBase, Priority, AutomationSuitability } from '../types';

export type TestTechnique =
  | 'equivalence'
  | 'boundary'
  | 'state-transition'
  | 'decision-table'
  | 'use-case'
  | 'exploratory';

export type TestViewpoint = EntityBase & {
  featureId: string;
  title: string;
  description?: string;
  technique?: TestTechnique;
  priority?: Priority;
  automationSuitability?: AutomationSuitability;
  automationReason?: string;
};
