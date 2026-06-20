export type EntityStatus = 'active' | 'deprecated' | 'removed';

export type Confidence = 'confirmed' | 'tentative' | 'assumed' | 'unknown';

export type Priority = 'high' | 'medium' | 'low';

export type AutomationSuitability = 'high' | 'medium' | 'low' | 'manual-only';

export type EntityBase = {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  status: EntityStatus;
};
