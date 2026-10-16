'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertIcon, CheckIcon, CloseIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/format';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4500;

const TONES = {
  success: {
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
    icon: CheckIcon,
  },
  error: {
    border: 'border-red-200',
    iconBg: 'bg-red-100 text-red-600',
    icon: CloseIcon,
  },
  warning: {
    border: 'border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: AlertIcon,
  },
};

/**
 * Color-coded success/error/warning toasts, stacked top-right. Wrap any
 * page (or the whole app) in <ToastProvider> and call useToast() inside it.
 * Components that call useToast() outside a provider get safe no-ops back,
 * so shared components can fire toasts without forcing every page to opt in.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message, duration = DEFAULT_DURATION) => {
      const id = ++nextId.current;
      setToasts((list) => [...list, { id, type, message }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const api = {
    success: (message, duration) => show('success', message, duration),
    error: (message, duration) => show('error', message, duration),
    warning: (message, duration) => show('warning', message, duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-stretch gap-2.5 sm:inset-x-auto sm:right-4 sm:items-end">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }) {
  const tone = TONES[toast.type] || TONES.success;
  const Icon = tone.icon;

  return (
    <div
      role="status"
      className={cn(
        'animate-fade-in pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-luxe sm:max-w-sm',
        tone.border,
      )}
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', tone.iconBg)}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="flex-1 pt-1 text-sm font-medium text-primary">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="mt-0.5 shrink-0 text-primary/30 transition-colors hover:text-primary"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

const NOOP_TOAST = {
  success: () => {},
  error: () => {},
  warning: () => {},
  dismiss: () => {},
};

/** Safe outside a <ToastProvider> too — returns no-ops so shared components don't have to care. */
export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || NOOP_TOAST;
}
