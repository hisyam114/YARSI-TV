// Global toast utility — dispatches a custom browser event so it works outside React context
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastEvent {
  id: number;
  message: string;
  type: ToastType;
}

export const showToast = (message: string, type: ToastType = 'success') => {
  const event = new CustomEvent<ToastEvent>('yarsi-toast', {
    detail: { id: Date.now(), message, type },
  });
  window.dispatchEvent(event);
};
