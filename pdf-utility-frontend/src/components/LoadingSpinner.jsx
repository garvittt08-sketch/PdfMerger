import React from 'react';

/**
 * LoadingSpinner component with optional progress bar indicator.
 */
export default function LoadingSpinner({ progress = null, label = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
      <div className="relative flex items-center justify-center mb-3">
        <svg
          className="w-10 h-10 text-indigo-600 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3.5"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      <span className="text-sm font-semibold text-slate-700">{label}</span>

      {progress !== null && (
        <div className="w-full max-w-xs mt-3">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1">
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
