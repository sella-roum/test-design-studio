import type { EntityStatus } from '../types';

export type Project = {
  id: string;
  name: string;
  description?: string;
  targetAppName?: string;
  targetAppUrl?: string;
  schemaVersion: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
};
