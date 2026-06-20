import type { EntityBase, Priority, AutomationSuitability } from '../types';

export type TestStepAction =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'select'
  | 'check'
  | 'assert'
  | 'wait'
  | 'other';

export type TestStep = {
  id: string;
  order: number;
  action: TestStepAction;
  targetUiNodeId?: string;
  instruction: string;
  expectedResult?: string;
  testData?: string;
};

export type TestCase = EntityBase & {
  viewpointId?: string;
  featureId: string;
  title: string;
  preconditions?: string;
  steps: TestStep[];
  expectedResult?: string;
  testData?: string;
  priority?: Priority;
  automationSuitability?: AutomationSuitability;
  automationReason?: string;
};
