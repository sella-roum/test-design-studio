import type { AppDatabase } from '../db';
import { generateId } from '../id';
import { NotFoundError, ValidationError } from '../errors';
import type { UiNode, UiNodeTreeNode, LocatorStrategy } from '../models/uiNode';

export function createUiNodeRepository(db: AppDatabase) {
  function now(): string {
    return new Date().toISOString();
  }

  type CreateInput = {
    projectId: string;
    screenId: string;
    parentId?: string;
    name: string;
    role?: string;
    componentType?: string;
    description?: string;
    selectorHint?: string;
    textHint?: string;
    accessibleNameHint?: string;
    locatorStrategy?: LocatorStrategy;
    locatorHint?: string;
    required?: boolean;
    disabledCondition?: string;
    visibleCondition?: string;
    sortOrder?: number;
  };

  type UpdateInput = Partial<
    Pick<
      UiNode,
      | 'name'
      | 'role'
      | 'componentType'
      | 'description'
      | 'selectorHint'
      | 'textHint'
      | 'accessibleNameHint'
      | 'locatorStrategy'
      | 'locatorHint'
      | 'required'
      | 'disabledCondition'
      | 'visibleCondition'
      | 'parentId'
      | 'sortOrder'
    >
  >;

  async function create(input: CreateInput): Promise<UiNode> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }
    if (!input.screenId) {
      throw new ValidationError('screenId is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('UiNode name is required');
    }

    let sortOrder = input.sortOrder;
    if (sortOrder === undefined) {
      const max = await db.uiNodes.where('screenId').equals(input.screenId).toArray();
      sortOrder = max.length > 0 ? Math.max(...max.map((n) => n.sortOrder)) + 1 : 0;
    }

    const node: UiNode = {
      id: generateId(),
      projectId: input.projectId,
      screenId: input.screenId,
      parentId: input.parentId || undefined,
      name: input.name.trim(),
      role: input.role?.trim() || undefined,
      componentType: input.componentType?.trim() || undefined,
      description: input.description?.trim() || undefined,
      selectorHint: input.selectorHint?.trim() || undefined,
      textHint: input.textHint?.trim() || undefined,
      accessibleNameHint: input.accessibleNameHint?.trim() || undefined,
      locatorStrategy: input.locatorStrategy,
      locatorHint: input.locatorHint?.trim() || undefined,
      required: input.required,
      disabledCondition: input.disabledCondition?.trim() || undefined,
      visibleCondition: input.visibleCondition?.trim() || undefined,
      sortOrder,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    await db.uiNodes.add(node);
    return node;
  }

  async function get(id: string): Promise<UiNode | undefined> {
    return db.uiNodes.get(id);
  }

  async function listByScreen(screenId: string): Promise<UiNode[]> {
    return db.uiNodes.where('[screenId+status]').equals([screenId, 'active']).sortBy('sortOrder');
  }

  async function getTree(screenId: string): Promise<UiNodeTreeNode[]> {
    const nodes = await listByScreen(screenId);
    return buildTree(nodes);
  }

  async function update(id: string, patch: UpdateInput): Promise<UiNode> {
    const existing = await db.uiNodes.get(id);
    if (!existing) {
      throw new NotFoundError('UiNode', id);
    }

    const updates: Partial<UiNode> = {};
    if (patch.name !== undefined) {
      if (patch.name.trim().length === 0) {
        throw new ValidationError('UiNode name is required');
      }
      updates.name = patch.name.trim();
    }
    if (patch.role !== undefined) updates.role = patch.role.trim() || undefined;
    if (patch.componentType !== undefined)
      updates.componentType = patch.componentType.trim() || undefined;
    if (patch.description !== undefined)
      updates.description = patch.description.trim() || undefined;
    if (patch.selectorHint !== undefined)
      updates.selectorHint = patch.selectorHint.trim() || undefined;
    if (patch.textHint !== undefined) updates.textHint = patch.textHint.trim() || undefined;
    if (patch.accessibleNameHint !== undefined)
      updates.accessibleNameHint = patch.accessibleNameHint.trim() || undefined;
    if (patch.locatorStrategy !== undefined) updates.locatorStrategy = patch.locatorStrategy;
    if (patch.locatorHint !== undefined)
      updates.locatorHint = patch.locatorHint.trim() || undefined;
    if (patch.required !== undefined) updates.required = patch.required;
    if (patch.disabledCondition !== undefined)
      updates.disabledCondition = patch.disabledCondition.trim() || undefined;
    if (patch.visibleCondition !== undefined)
      updates.visibleCondition = patch.visibleCondition.trim() || undefined;
    if (patch.parentId !== undefined) updates.parentId = patch.parentId || undefined;
    if (patch.sortOrder !== undefined) updates.sortOrder = patch.sortOrder;

    updates.updatedAt = now();
    await db.uiNodes.update(id, updates);
    return (await db.uiNodes.get(id))!;
  }

  async function markRemoved(id: string): Promise<UiNode> {
    const existing = await db.uiNodes.get(id);
    if (!existing) {
      throw new NotFoundError('UiNode', id);
    }

    await db.uiNodes.update(id, { status: 'removed', updatedAt: now() });
    return (await db.uiNodes.get(id))!;
  }

  return { create, get, listByScreen, getTree, update, markRemoved };
}

function buildTree(nodes: UiNode[]): UiNodeTreeNode[] {
  const map = new Map<string, UiNodeTreeNode>();
  const roots: UiNodeTreeNode[] = [];

  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }

  for (const node of nodes) {
    const treeNode = map.get(node.id)!;
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  }

  return roots;
}

export type UiNodeRepository = ReturnType<typeof createUiNodeRepository>;
