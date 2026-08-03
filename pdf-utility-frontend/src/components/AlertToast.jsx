import React from 'react';

/**
 * Dismissible Alert/Toast component for displaying success, error, or warning messages.
 */
export default function AlertToast({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      iconBg: 'bg-rose-100 text-rose-600',
      svg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      iconBg: 'bg-amber-100 text-amber-600',
      svg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-600',
      svg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  };

  const currentStyle = styles[type] || styles.error;

  return (
    <div className={`p-4 rounded-xl border ${currentStyle.bg} flex items-start gap-3 shadow-sm transition-all animate-fade-in`}>
      <div className={`p-1.5 rounded-lg flex-shrink-0 ${currentStyle.iconBg}`}>
        {currentStyle.svg}
      </div>
      <div className="flex-1 pt-0.5 text-sm font-medium leading-relaxed">
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Dismiss alert"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
