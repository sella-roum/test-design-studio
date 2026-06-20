import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createScreenRepository } from '../repositories/screenRepository';
import { NotFoundError, ValidationError } from '../errors';

const TEST_DB_NAME = 'test-design-studio-screen-test';

describe('screenRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createScreenRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createScreenRepository(db);
  });

  beforeEach(async () => {
    await db.screens.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project-1';
  const featureId = 'test-feature-1';

  describe('create', () => {
    it('creates a screen with required fields', async () => {
      const screen = await repo.create({
        projectId,
        featureId,
        name: 'Login Screen',
      });

      expect(screen.id).toBeTruthy();
      expect(screen.projectId).toBe(projectId);
      expect(screen.featureId).toBe(featureId);
      expect(screen.name).toBe('Login Screen');
      expect(screen.status).toBe('active');
    });

    it('creates a screen with all optional fields', async () => {
      const screen = await repo.create({
        projectId,
        featureId,
        name: 'User Detail',
        screenType: 'detail',
        urlPattern: '/users/:id',
        purpose: 'Display user details',
        preconditions: 'User exists',
        description: 'User detail screen',
        confidence: 'confirmed',
      });

      expect(screen.screenType).toBe('detail');
      expect(screen.urlPattern).toBe('/users/:id');
      expect(screen.purpose).toBe('Display user details');
      expect(screen.preconditions).toBe('User exists');
      expect(screen.description).toBe('User detail screen');
      expect(screen.confidence).toBe('confirmed');
    });

    it('throws ValidationError when name is empty', async () => {
      await expect(repo.create({ projectId, featureId, name: '' })).rejects.toThrow(
        ValidationError,
      );
    });

    it('throws ValidationError when projectId is missing', async () => {
      await expect(repo.create({ projectId: '', featureId, name: 'Test' })).rejects.toThrow(
        ValidationError,
      );
    });

    it('throws ValidationError when featureId is missing', async () => {
      await expect(repo.create({ projectId, featureId: '', name: 'Test' })).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('get', () => {
    it('returns screen by id', async () => {
      const created = await repo.create({
        projectId,
        featureId,
        name: 'Dashboard',
      });
      const found = await repo.get(created.id);

      expect(found).toBeTruthy();
      expect(found!.name).toBe('Dashboard');
    });

    it('returns undefined for non-existent id', async () => {
      const result = await repo.get('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('listByProject', () => {
    it('returns screens for a project', async () => {
      await repo.create({ projectId, featureId, name: 'Screen A' });
      await repo.create({ projectId, featureId, name: 'Screen B' });

      const screens = await repo.listByProject(projectId);
      expect(screens).toHaveLength(2);
    });

    it('excludes removed screens', async () => {
      const s = await repo.create({ projectId, featureId, name: 'To Remove' });
      await repo.markRemoved(s.id);

      const screens = await repo.listByProject(projectId);
      expect(screens).toHaveLength(0);
    });

    it('includes deprecated in listByProject', async () => {
      const screen = await repo.create({ projectId, featureId: 'f', name: 'Old' });
      await db.screens.update(screen.id, { status: 'deprecated' });
      const list = await repo.listByProject(projectId);
      expect(list).toHaveLength(1);
    });

    it('gets a removed screen by id', async () => {
      const screen = await repo.create({ projectId, featureId: 'f', name: 'Gone' });
      await repo.markRemoved(screen.id);
      const found = await repo.get(screen.id);
      expect(found).toBeTruthy();
      expect(found!.status).toBe('removed');
    });

    it('includes removed when includeRemoved is true in listByProject', async () => {
      const s = await repo.create({ projectId, featureId, name: 'To Remove' });
      await repo.markRemoved(s.id);

      const screens = await repo.listByProject(projectId, { includeRemoved: true });
      expect(screens).toHaveLength(1);
    });
  });

  describe('listByFeature', () => {
    it('returns screens for a feature', async () => {
      await repo.create({ projectId, featureId, name: 'Screen X' });
      const otherFeatureId = 'other-feature';
      await repo.create({
        projectId,
        featureId: otherFeatureId,
        name: 'Other Screen',
      });

      const screens = await repo.listByFeature(featureId);
      expect(screens).toHaveLength(1);
      expect(screens[0].name).toBe('Screen X');
    });

    it('excludes removed screens', async () => {
      const s = await repo.create({ projectId, featureId, name: 'Removable' });
      await repo.markRemoved(s.id);

      const screens = await repo.listByFeature(featureId);
      expect(screens).toHaveLength(0);
    });

    it('includes removed when includeRemoved is true in listByFeature', async () => {
      const s = await repo.create({ projectId, featureId, name: 'Removable' });
      await repo.markRemoved(s.id);

      const screens = await repo.listByFeature(featureId, { includeRemoved: true });
      expect(screens).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('updates screen fields', async () => {
      const screen = await repo.create({
        projectId,
        featureId,
        name: 'Original',
      });
      await new Promise((r) => setTimeout(r, 10));
      const updated = await repo.update(screen.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
      expect(updated.updatedAt).not.toBe(screen.updatedAt);
    });

    it('throws NotFoundError for non-existent screen', async () => {
      await expect(repo.update('bad-id', { name: 'Nope' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('markRemoved', () => {
    it('marks screen as removed', async () => {
      const screen = await repo.create({
        projectId,
        featureId,
        name: 'Remove Me',
      });
      const removed = await repo.markRemoved(screen.id);

      expect(removed.status).toBe('removed');
    });
  });
});
