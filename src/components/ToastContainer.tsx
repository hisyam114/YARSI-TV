import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastEvent, ToastType } from '../utils/toast';

interface ToastItem extends ToastEvent {
  removing?: boolean;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  info:    <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

const COLORS: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: 'rgba(0, 200, 83, 0.12)',  border: 'rgba(0, 200, 83, 0.4)',  color: '#00c853' },
  error:   { bg: 'rgba(229, 57, 53, 0.12)', border: 'rgba(229, 57, 53, 0.4)', color: '#e53935' },
  info:    { bg: 'rgba(33, 150, 243, 0.12)',border: 'rgba(33, 150, 243, 0.4)',color: '#2196f3' },
  warning: { bg: 'rgba(255, 160, 0, 0.12)', border: 'rgba(255, 160, 0, 0.4)', color: '#ffa000' },
};

const Toast: React.FC<{ item: ToastItem; onRemove: (id: number) => void }> = ({ item, onRemove }) => {
  const { bg, border, color } = COLORS[item.type];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: bg,
        border: `1px solid ${border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: '8px',
        padding: '12px 14px',
        minWidth: '260px',
        maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        animation: item.removing
          ? 'toast-slide-out 0.3s ease forwards'
          : 'toast-slide-in 0.3s ease forwards',
        color: 'var(--color-on-surface)',
        fontFamily: 'var(--font-primary)',
        fontSize: '14px',
      }}
    >
      <span style={{ color, flexShrink: 0 }}>{ICONS[item.type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-outline)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastEvent>).detail;
      setToasts(prev => [...prev, { ...detail }]);

      // Auto-remove after 4s
      setTimeout(() => {
        setToasts(prev =>
          prev.map(t => t.id === detail.id ? { ...t, removing: true } : t)
        );
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== detail.id));
        }, 300);
      }, 4000);
    };

    window.addEventListener('yarsi-toast', handler);
    return () => window.removeEventListener('yarsi-toast', handler);
  }, []);

  const remove = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  };

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toast-slide-out {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(110%); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 9999,
          alignItems: 'flex-end',
        }}
      >
        {toasts.map(t => (
          <Toast key={t.id} item={t} onRemove={remove} />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
