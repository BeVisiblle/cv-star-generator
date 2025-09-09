'use client';
import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';

type ComposerMountId = string;

type ComposerContextType = {
  register: (id: ComposerMountId) => boolean; // true = darf rendern, false = Duplikat
  unregister: (id: ComposerMountId) => void;
  count: () => number;
};

const ComposerContext = createContext<ComposerContextType | null>(null);

export const FeedComposerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mountedRef = useRef<Set<ComposerMountId>>(new Set());

  const register = (id: ComposerMountId) => {
    if (mountedRef.current.size >= 1 && !mountedRef.current.has(id)) {
      console.warn('[Composer] Duplicate mount prevented (id:', id, ')');
      return false;
    }
    mountedRef.current.add(id);
    return true;
  };

  const unregister = (id: ComposerMountId) => {
    mountedRef.current.delete(id);
  };

  const count = () => mountedRef.current.size;

  return (
    <ComposerContext.Provider value={{ register, unregister, count }}>
      {children}
    </ComposerContext.Provider>
  );
};

export const useComposerGuard = (explicitId?: string) => {
  const ctx = useContext(ComposerContext);
  const autoId = useId();
  const id = explicitId ?? autoId;
  const [canRender, setCanRender] = useState<boolean>(true);

  useEffect(() => {
    if (!ctx) {
      console.warn('[Composer] useComposerGuard used without Provider; allowing mount.');
      return;
    }
    const ok = ctx.register(id);
    setCanRender(ok);
    return () => ctx.unregister(id);
  }, [ctx, id]);

  return { canRender, mountId: id } as const;
};