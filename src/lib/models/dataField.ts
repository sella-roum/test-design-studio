import type { EntityBase } from '../types';

export type DataField = EntityBase & {
  entityId: string;
  name: string;
  dataTypeId?: string;
  required?: boolean;
  unique?: boolean;
  description?: string;
};
