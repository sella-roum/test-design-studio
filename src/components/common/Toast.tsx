import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { ToastContext, type ToastType } from './ToastContext';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Set<number>>(new Set());

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    timersRef.current.delete(id);
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId++;
      setItems((prev) => [...prev, { id, type, message }]);
      const timerId = window.setTimeout(() => {
        removeItem(id);
      }, 4000);
      timersRef.current.add(id);
      return timerId;
    },
    [removeItem],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {items.map((item) => (
          <div key={item.id} className={`toast toast-${item.type}`}>
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
