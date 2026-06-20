import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { AppDatabase } from '../db';
import { createUiNodeRepository } from '../repositories/uiNodeRepository';
import { NotFoundError, ValidationError } from '../errors';

const TEST_DB_NAME = 'test-design-studio-uiNode-test';

describe('uiNodeRepository', () => {
  let db: AppDatabase;
  let repo: ReturnType<typeof createUiNodeRepository>;

  beforeAll(async () => {
    db = new AppDatabase(TEST_DB_NAME);
    await db.open();
    repo = createUiNodeRepository(db);
  });

  beforeEach(async () => {
    await db.uiNodes.clear();
  });

  afterAll(async () => {
    if (db?.isOpen()) {
      await db.delete();
    }
  });

  const projectId = 'test-project';
  const screenId = 'test-screen';

  describe('create', () => {
    it('creates a uiNode with required fields', async () => {
      const node = await repo.create({
        projectId,
        screenId,
        name: 'Login Button',
      });

      expect(node.id).toBeTruthy();
      expect(node.screenId).toBe(screenId);
      expect(node.name).toBe('Login Button');
      expect(node.status).toBe('active');
      expect(typeof node.sortOrder).toBe('number');
    });

    it('creates a uiNode with all optional fields', async () => {
      const node = await repo.create({
        projectId,
        screenId,
        name: 'Username Input',
        role: 'textbox',
        componentType: 'Input',
        description: 'Username field',
        selectorHint: '#username',
        textHint: 'Enter username',
        accessibleNameHint: 'Username',
        locatorStrategy: 'label',
        locatorHint: 'Username',
        required: true,
        disabledCondition: 'not logged in',
        visibleCondition: 'always',
        sortOrder: 5,
      });

      expect(node.role).toBe('textbox');
      expect(node.componentType).toBe('Input');
      expect(node.selectorHint).toBe('#username');
      expect(node.textHint).toBe('Enter username');
      expect(node.accessibleNameHint).toBe('Username');
      expect(node.locatorStrategy).toBe('label');
      expect(node.locatorHint).toBe('Username');
      expect(node.required).toBe(true);
      expect(node.disabledCondition).toBe('not logged in');
      expect(node.visibleCondition).toBe('always');
      expect(node.sortOrder).toBe(5);
    });

    it('auto-increments sortOrder', async () => {
      const a = await repo.create({ projectId, screenId, name: 'A' });
      const b = await repo.create({ projectId, screenId, name: 'B' });

      expect(b.sortOrder).toBe(a.sortOrder + 1);
    });

    it('throws ValidationError when name is empty', async () => {
      await expect(repo.create({ projectId, screenId, name: '' })).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError when screenId is missing', async () => {
      await expect(repo.create({ projectId, screenId: '', name: 'Test' })).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('get', () => {
    it('returns uiNode by id', async () => {
      const created = await repo.create({ projectId, screenId, name: 'Node' });
      const found = await repo.get(created.id);

      expect(found).toBeTruthy();
      expect(found!.name).toBe('Node');
    });

    it('returns undefined for non-existent id', async () => {
      const result = await repo.get('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('listByScreen', () => {
    it('returns nodes for a screen', async () => {
      await repo.create({ projectId, screenId, name: 'A' });
      await repo.create({ projectId, screenId, name: 'B' });

      const nodes = await repo.listByScreen(screenId);
      expect(nodes).toHaveLength(2);
    });

    it('returns nodes sorted by sortOrder', async () => {
      await repo.create({ projectId, screenId, name: 'Second', sortOrder: 1 });
      await repo.create({ projectId, screenId, name: 'First', sortOrder: 0 });

      const nodes = await repo.listByScreen(screenId);
      expect(nodes[0].name).toBe('First');
      expect(nodes[1].name).toBe('Second');
    });

    it('excludes removed nodes', async () => {
      const n = await repo.create({ projectId, screenId, name: 'Remove Me' });
      await repo.markRemoved(n.id);

      const nodes = await repo.listByScreen(screenId);
      expect(nodes).toHaveLength(0);
    });

    it('includes removed when includeRemoved is true in listByScreen', async () => {
      const n = await repo.create({ projectId, screenId, name: 'Remove Me' });
      await repo.markRemoved(n.id);

      const nodes = await repo.listByScreen(screenId, { includeRemoved: true });
      expect(nodes).toHaveLength(1);
    });

    it('does not mix screens', async () => {
      await repo.create({ projectId, screenId: 'other', name: 'Other' });
      const nodes = await repo.listByScreen(screenId);
      expect(nodes).toHaveLength(0);
    });
  });

  describe('getTree', () => {
    it('returns flat list as roots when no parent-child', async () => {
      const a = await repo.create({ projectId, screenId, name: 'A', sortOrder: 0 });
      const b = await repo.create({ projectId, screenId, name: 'B', sortOrder: 1 });

      const tree = await repo.getTree(screenId);
      expect(tree).toHaveLength(2);
      expect(tree[0].id).toBe(a.id);
      expect(tree[1].id).toBe(b.id);
    });

    it('builds nested tree structure', async () => {
      const parent = await repo.create({
        projectId,
        screenId,
        name: 'Form',
        sortOrder: 0,
      });
      const child = await repo.create({
        projectId,
        screenId,
        name: 'Input',
        parentId: parent.id,
        sortOrder: 0,
      });
      const grandchild = await repo.create({
        projectId,
        screenId,
        name: 'Label',
        parentId: child.id,
        sortOrder: 0,
      });

      const tree = await repo.getTree(screenId);
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe(parent.id);
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe(child.id);
      expect(tree[0].children[0].children).toHaveLength(1);
      expect(tree[0].children[0].children[0].id).toBe(grandchild.id);
    });

    it('handles orphan parentId gracefully', async () => {
      const node = await repo.create({
        projectId,
        screenId,
        name: 'Orphan',
        parentId: 'non-existent',
        sortOrder: 0,
      });

      const tree = await repo.getTree(screenId);
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe(node.id);
    });
  });

  describe('update', () => {
    it('updates uiNode fields', async () => {
      const node = await repo.create({ projectId, screenId, name: 'Original' });
      await new Promise((r) => setTimeout(r, 10));
      const updated = await repo.update(node.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
      expect(updated.updatedAt).not.toBe(node.updatedAt);
    });

    it('throws NotFoundError for non-existent', async () => {
      await expect(repo.update('bad-id', { name: 'Nope' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('markRemoved', () => {
    it('marks uiNode as removed', async () => {
      const node = await repo.create({ projectId, screenId, name: 'Remove Me' });
      const removed = await repo.markRemoved(node.id);

      expect(removed.status).toBe('removed');
    });
  });
});
