'use client'

import { useToastStore, type Toast } from '@/lib/toast/index'

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const colors: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
    success: {
      bg: '#f0fdf4',
      border: '#22c55e',
      icon: '✓',
    },
    error: {
      bg: '#fef2f2',
      border: '#ef4444',
      icon: '✕',
    },
    warning: {
      bg: '#fef3c7',
      border: '#f59e0b',
      icon: '⚠',
    },
    info: {
      bg: '#f0f9ff',
      border: '#3b82f6',
      icon: 'ⓘ',
    },
  }

  const style = colors[toast.type]

  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
        marginBottom: '8px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span
        style={{
          color: style.border,
          fontWeight: 'bold',
          fontSize: '18px',
          flexShrink: 0,
        }}
      >
        {style.icon}
      </span>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#0a0a0a', // Always dark for contrast against light toast background
            margin: 0,
          }}
        >
          {toast.title}
        </p>
        {toast.message && (
        <p
          style={{
            fontSize: '13px',
            color: '#737373', // Always dark for contrast against light toast background
            margin: '4px 0 0 0',
          }}
        >
          {toast.message}
        </p>
        )}      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0',
          flexShrink: 0,
          lineHeight: '1',
        }}
      >
        ✕
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </>
  )
}
