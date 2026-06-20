import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createFeatureRepository } from '../repositories/featureRepository';
import { NotFoundError, ValidationError } from '../errors';

const TEST_DB_NAME = 'test-design-studio-feature-test';

describe('featureRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createFeatureRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createFeatureRepository(db);
  });

  beforeEach(async () => {
    await db.features.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project-1';

  describe('create', () => {
    it('creates a feature with required fields', async () => {
      const feature = await repo.create({ projectId, name: 'Login' });

      expect(feature.id).toBeTruthy();
      expect(feature.projectId).toBe(projectId);
      expect(feature.name).toBe('Login');
      expect(feature.status).toBe('active');
    });

    it('creates a feature with all optional fields', async () => {
      const feature = await repo.create({
        projectId,
        name: 'User Management',
        description: 'Manage users',
        purpose: 'Allow admin to manage users',
        actor: 'Admin',
        preconditions: 'Admin is logged in',
        successCriteria: 'User is created',
        failureConditions: 'Error shown',
        priority: 'high',
        riskLevel: 'medium',
        confidence: 'confirmed',
      });

      expect(feature.description).toBe('Manage users');
      expect(feature.purpose).toBe('Allow admin to manage users');
      expect(feature.actor).toBe('Admin');
      expect(feature.preconditions).toBe('Admin is logged in');
      expect(feature.successCriteria).toBe('User is created');
      expect(feature.failureConditions).toBe('Error shown');
      expect(feature.priority).toBe('high');
      expect(feature.riskLevel).toBe('medium');
      expect(feature.confidence).toBe('confirmed');
    });

    it('throws ValidationError when name is empty', async () => {
      await expect(repo.create({ projectId, name: '' })).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError when projectId is missing', async () => {
      await expect(repo.create({ projectId: '', name: 'Test' })).rejects.toThrow(ValidationError);
    });
  });

  describe('get', () => {
    it('returns feature by id', async () => {
      const created = await repo.create({ projectId, name: 'Search' });
      const found = await repo.get(created.id);

      expect(found).toBeTruthy();
      expect(found!.name).toBe('Search');
    });

    it('returns undefined for non-existent id', async () => {
      const result = await repo.get('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('listByProject', () => {
    it('returns features for a project', async () => {
      await repo.create({ projectId, name: 'Feature A' });
      await repo.create({ projectId, name: 'Feature B' });

      const features = await repo.listByProject(projectId);
      expect(features).toHaveLength(2);
    });

    it('excludes removed features', async () => {
      const f = await repo.create({ projectId, name: 'To Remove' });
      await repo.markRemoved(f.id);

      const features = await repo.listByProject(projectId);
      expect(features).toHaveLength(0);
    });

    it('includes deprecated in default list', async () => {
      const feature = await repo.create({ projectId, name: 'Old Feature' });
      await db.features.update(feature.id, { status: 'deprecated' });
      const list = await repo.listByProject(projectId);
      expect(list).toHaveLength(1);
    });

    it('gets a removed entity by id', async () => {
      const feature = await repo.create({ projectId, name: 'Gone' });
      await repo.markRemoved(feature.id);
      const found = await repo.get(feature.id);
      expect(found).toBeTruthy();
      expect(found!.status).toBe('removed');
    });

    it('includes removed when includeRemoved is true in listByProject', async () => {
      const f = await repo.create({ projectId, name: 'Remove Me' });
      await repo.markRemoved(f.id);

      const features = await repo.listByProject(projectId, { includeRemoved: true });
      expect(features).toHaveLength(1);
    });

    it('does not mix projects', async () => {
      await repo.create({ projectId: 'other-project', name: 'Other Feature' });
      const features = await repo.listByProject(projectId);
      expect(features).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('updates feature fields', async () => {
      const feature = await repo.create({ projectId, name: 'Original' });
      await new Promise((r) => setTimeout(r, 10));
      const updated = await repo.update(feature.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
      expect(updated.updatedAt).not.toBe(feature.updatedAt);
    });

    it('throws NotFoundError for non-existent feature', async () => {
      await expect(repo.update('bad-id', { name: 'Nope' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('markRemoved', () => {
    it('marks feature as removed', async () => {
      const feature = await repo.create({ projectId, name: 'Remove Me' });
      const removed = await repo.markRemoved(feature.id);

      expect(removed.status).toBe('removed');
    });
  });
});
