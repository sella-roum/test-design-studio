import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createProjectRepository } from '../repositories/projectRepository';
import { NotFoundError, ValidationError } from '../errors';

const TEST_DB_NAME = 'test-design-studio-project-test';

describe('projectRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createProjectRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createProjectRepository(db);
  });

  beforeEach(async () => {
    await db.projects.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  describe('create', () => {
    it('creates a project with required fields', async () => {
      const project = await repo.create({ name: 'Test Project' });

      expect(project.id).toBeTruthy();
      expect(project.name).toBe('Test Project');
      expect(project.status).toBe('active');
      expect(project.schemaVersion).toBe(7);
      expect(project.createdAt).toBeTruthy();
      expect(project.updatedAt).toBeTruthy();
    });

    it('creates a project with optional fields', async () => {
      const project = await repo.create({
        name: 'My App',
        description: 'Test description',
        targetAppName: 'MyApp',
        targetAppUrl: 'https://example.com',
      });

      expect(project.description).toBe('Test description');
      expect(project.targetAppName).toBe('MyApp');
      expect(project.targetAppUrl).toBe('https://example.com');
    });

    it('throws ValidationError when name is empty', async () => {
      await expect(repo.create({ name: '' })).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError when name is whitespace only', async () => {
      await expect(repo.create({ name: '   ' })).rejects.toThrow(ValidationError);
    });

    it('trims whitespace from name', async () => {
      const project = await repo.create({ name: '  My Project  ' });
      expect(project.name).toBe('My Project');
    });
  });

  describe('get', () => {
    it('returns project by id', async () => {
      const created = await repo.create({ name: 'Test' });
      const found = await repo.get(created.id);

      expect(found).toBeTruthy();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe('Test');
    });

    it('returns undefined for non-existent id', async () => {
      const result = await repo.get('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('returns project even if status is removed', async () => {
      const created = await repo.create({ name: 'To Remove' });
      await repo.markRemoved(created.id);
      const found = await repo.get(created.id);

      expect(found).toBeTruthy();
      expect(found!.status).toBe('removed');
    });
  });

  describe('list', () => {
    it('returns empty array when no projects exist', async () => {
      const projects = await repo.list();
      expect(projects).toHaveLength(0);
    });

    it('returns all active projects', async () => {
      await repo.create({ name: 'Project A' });
      await repo.create({ name: 'Project B' });
      await repo.create({ name: 'Project C' });

      const projects = await repo.list();
      expect(projects).toHaveLength(3);
    });

    it('excludes removed projects', async () => {
      await repo.create({ name: 'Keep' });
      const toRemove = await repo.create({ name: 'Remove Me' });
      await repo.markRemoved(toRemove.id);

      const projects = await repo.list();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Keep');
    });

    it('includes removed when includeRemoved is true in list', async () => {
      const toRemove = await repo.create({ name: 'Remove Me' });
      await repo.markRemoved(toRemove.id);

      const projects = await repo.list({ includeRemoved: true });
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Remove Me');
    });

    it('returns projects sorted by updatedAt descending', async () => {
      await repo.create({ name: 'First' });
      await new Promise((r) => setTimeout(r, 10));
      await repo.create({ name: 'Second' });

      const projects = await repo.list();
      expect(projects[0].name).toBe('Second');
      expect(projects[1].name).toBe('First');
    });
  });

  describe('update', () => {
    it('updates project fields', async () => {
      const project = await repo.create({ name: 'Original' });
      await new Promise((r) => setTimeout(r, 10));
      const updated = await repo.update(project.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
      expect(updated.updatedAt).not.toBe(project.updatedAt);
    });

    it('throws NotFoundError for non-existent project', async () => {
      await expect(repo.update('non-existent', { name: 'Nope' })).rejects.toThrow(NotFoundError);
    });

    it('throws ValidationError when updating name to empty', async () => {
      const project = await repo.create({ name: 'Valid' });
      await expect(repo.update(project.id, { name: '' })).rejects.toThrow(ValidationError);
    });
  });

  describe('markRemoved', () => {
    it('marks project as removed', async () => {
      const project = await repo.create({ name: 'To Remove' });
      await new Promise((r) => setTimeout(r, 10));
      const removed = await repo.markRemoved(project.id);

      expect(removed.status).toBe('removed');
      expect(removed.updatedAt).not.toBe(project.updatedAt);
    });

    it('throws NotFoundError for non-existent project', async () => {
      await expect(repo.markRemoved('non-existent')).rejects.toThrow(NotFoundError);
    });

    it('excludes removed project from list', async () => {
      const project = await repo.create({ name: 'Gone' });
      await repo.markRemoved(project.id);

      const projects = await repo.list();
      expect(projects).toHaveLength(0);
    });
  });
});
