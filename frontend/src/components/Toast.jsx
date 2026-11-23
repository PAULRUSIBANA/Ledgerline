import { useEffect } from 'react';

// Auto-dismisses after 3 seconds. Keyed by toast id so each new message restarts the timer.
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onDismiss, 3000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`toast toast-${toast.kind}`}>
          <span className="toast-dot" aria-hidden="true" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
