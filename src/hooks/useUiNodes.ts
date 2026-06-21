import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createUiNodeRepository } from '../lib/repositories/uiNodeRepository';
import type { UiNode, UiNodeTreeNode } from '../lib/models/uiNode';

const repo = createUiNodeRepository(db);

export function useUiNodes(screenId: string | undefined) {
  const [nodes, setNodes] = useState<UiNode[]>([]);
  const [tree, setTree] = useState<UiNodeTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    if (!screenId) {
      setNodes([]);
      setTree([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await repo.listByScreen(screenId);
      if (seq !== loadSeqRef.current) return;
      setNodes(items);
      const treeData = await repo.getTree(screenId);
      if (seq !== loadSeqRef.current) return;
      setTree(treeData);
    } catch {
      // ignore stale
    } finally {
      if (seq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  }, [screenId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const create = useCallback(
    async (input: {
      projectId: string;
      name: string;
      parentId?: string;
      role?: string;
      componentType?: string;
      description?: string;
      selectorHint?: string;
      textHint?: string;
    }) => {
      if (!screenId) throw new Error('screenId is required');
      const node = await repo.create({ ...input, screenId });
      await load();
      return node;
    },
    [screenId, load],
  );

  const update = useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    async (id: string, patch: Parameters<typeof repo.update>[1]) => {
      const node = await repo.update(id, patch);
      await load();
      return node;
    },
    [load],
  );

  const markRemoved = useCallback(
    async (id: string) => {
      await repo.markRemoved(id);
      await load();
    },
    [load],
  );

  return { nodes, tree, loading, create, update, markRemoved };
}
