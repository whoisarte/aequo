import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number // ms; 0 = persistent
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

let toastId = 0

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastId}`
    const duration = toast.duration ?? 4000 // Default 4 seconds

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    // Auto-remove after duration (if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }

    return id
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}))

// Helper hook for cleaner usage
export function useToast() {
  const addToast = useToastStore((state) => state.addToast)

  return {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message, duration: 4000 }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message, duration: 5000 }),
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message, duration: 5000 }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message, duration: 4000 }),
  }
}
