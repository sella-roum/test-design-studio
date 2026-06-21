import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import { createDataTypeRepository } from '../lib/repositories/dataTypeRepository';
import type { DataType, BaseType } from '../lib/models/dataType';

const repo = createDataTypeRepository(db);

export function useDataTypes(projectId: string) {
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    try {
      const items = await repo.listByProject(projectId);
      if (seq !== loadSeqRef.current) return;
      setDataTypes(items);
    } catch {
      // ignore
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    load();
  }, [load]);

  const create = useCallback(
    async (input: { name: string; baseType: BaseType; description?: string }) => {
      const dt = await repo.create({ projectId, ...input });
      await load();
      return dt;
    },
    [projectId, load],
  );

  const update = useCallback(
    async (id: string, patch: { name?: string; baseType?: BaseType; description?: string }) => {
      const dt = await repo.update(id, patch);
      await load();
      return dt;
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

  return { dataTypes, loading, create, update, markRemoved };
}
