import type { Confidence } from '../types';
import type { EntityBase } from '../types';

export type ScreenType =
  | 'list'
  | 'detail'
  | 'create'
  | 'edit'
  | 'confirm'
  | 'complete'
  | 'error'
  | 'settings'
  | 'login'
  | 'dashboard'
  | 'admin'
  | 'other';

export type Screen = EntityBase & {
  featureId: string;
  name: string;
  screenType?: ScreenType;
  urlPattern?: string;
  purpose?: string;
  preconditions?: string;
  description?: string;
  confidence?: Confidence;
};
