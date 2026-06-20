import type { EntityBase } from '../types';

export type DataEntity = EntityBase & {
  name: string;
  description?: string;
};
