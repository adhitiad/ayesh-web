import { create } from 'zustand';

export type ToastKind = 'ok' | 'fail' | 'info';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastKind, text: string) => void;
  dismiss: (id: number) => void;
}

let lastId = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (kind, text) => {
    lastId += 1;
    set((s) => ({ toasts: [...s.toasts, { id: lastId, kind, text }] }));
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
