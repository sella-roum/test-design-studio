import type { AppDatabase } from '../db';
import { SCHEMA_VERSION } from '../constants';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { Project } from '../models/project';

export function createProjectRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  async function create(input: {
    name: string;
    description?: string;
    targetAppName?: string;
    targetAppUrl?: string;
  }): Promise<Project> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }

    const project: Project = {
      id: generateId(),
      name: input.name.trim(),
      description: input.description?.trim(),
      targetAppName: input.targetAppName?.trim(),
      targetAppUrl: input.targetAppUrl?.trim(),
      schemaVersion: SCHEMA_VERSION,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.projects.add(project);
    return project;
  }

  async function get(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  }

  async function list(): Promise<Project[]> {
    return db.projects.where('status').notEqual('removed').reverse().sortBy('updatedAt');
  }

  async function update(
    id: string,
    patch: Partial<Pick<Project, 'name' | 'description' | 'targetAppName' | 'targetAppUrl'>>,
  ): Promise<Project> {
    const existing = await db.projects.get(id);
    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    const updates: Partial<Project> = {};
    if (patch.name !== undefined) {
      if (patch.name.trim().length === 0) {
        throw new ValidationError('Project name is required');
      }
      updates.name = patch.name.trim();
    }
    if (patch.description !== undefined) {
      updates.description = patch.description.trim() || '';
    }
    if (patch.targetAppName !== undefined) {
      updates.targetAppName = patch.targetAppName.trim() || '';
    }
    if (patch.targetAppUrl !== undefined) {
      updates.targetAppUrl = patch.targetAppUrl.trim() || '';
    }

    updates.updatedAt = now();
    await db.projects.update(id, updates);
    return (await db.projects.get(id))!;
  }

  async function markRemoved(id: string): Promise<Project> {
    const existing = await db.projects.get(id);
    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    await db.projects.update(id, {
      status: 'removed',
      updatedAt: now(),
    });
    return (await db.projects.get(id))!;
  }

  return { create, get, list, update, markRemoved };
}

export type ProjectRepository = ReturnType<typeof createProjectRepository>;
