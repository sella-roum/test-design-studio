import { renderHook, waitFor, act } from '@testing-library/react';
import { useUiNodes } from '../useUiNodes';
import { db } from '../../lib/db';
import { createScreenRepository } from '../../lib/repositories/screenRepository';

describe('useUiNodes', () => {
  const screenRepo = createScreenRepository(db);
  const projectId = 'test-project';
  let screenId: string;

  beforeEach(async () => {
    await db.screens.clear();
    await db.uiNodes.clear();
    const screen = await screenRepo.create({
      projectId,
      featureId: 'test-feature',
      name: 'Test Screen',
    });
    screenId = screen.id;
  });

  it('loads nodes when screenId is provided', async () => {
    const { result } = renderHook(() => useUiNodes(screenId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.tree).toEqual([]);
  });

  it('clears nodes when screenId becomes empty', async () => {
    const { result, rerender } = renderHook((id?: string) => useUiNodes(id), {
      initialProps: screenId,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      rerender(undefined);
    });

    expect(result.current.tree).toEqual([]);
    expect(result.current.nodes).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('creates a ui node and reloads tree', async () => {
    const { result } = renderHook(() => useUiNodes(screenId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.create({
        projectId,
        name: 'Root Node',
      });
    });

    expect(result.current.tree).toHaveLength(1);
    expect(result.current.tree[0].name).toBe('Root Node');
  });

  it('does not call listByScreen when screenId is undefined', async () => {
    const spy = vi.spyOn(db.uiNodes, 'where');
    const { result } = renderHook(() => useUiNodes(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tree).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
