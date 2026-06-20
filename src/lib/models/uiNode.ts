import type { EntityBase } from '../types';

export type LocatorStrategy = 'role' | 'label' | 'testid' | 'text' | 'css';

export type UiNode = EntityBase & {
  screenId: string;
  parentId?: string;
  name: string;
  role?: string;
  componentType?: string;
  description?: string;
  selectorHint?: string;
  textHint?: string;
  accessibleNameHint?: string;
  locatorStrategy?: LocatorStrategy;
  locatorHint?: string;
  required?: boolean;
  disabledCondition?: string;
  visibleCondition?: string;
  sortOrder: number;
};

export type UiNodeTreeNode = UiNode & {
  children: UiNodeTreeNode[];
};
