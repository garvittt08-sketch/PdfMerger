import React, { useState } from 'react';

/**
 * Formats file size in bytes into human-readable string (KB, MB).
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * FileList component supporting drag-and-drop reordering, removal, and order adjustment buttons.
 */
export default function FileList({ files, onRemove, onReorder, disabled = false }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  if (!files || files.length === 0) return null;

  const handleDragStart = (e, index) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or default drag image
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (disabled || draggedIndex === null) return;

    if (draggedIndex !== index) {
      const updated = [...files];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, removed);
      onReorder(updated);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveItem = (index, direction) => {
    if (disabled) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    const updated = [...files];
    const [removed] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, removed);
    onReorder(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Selected Files ({files.length})
        </span>
        <span className="text-xs text-slate-400">
          Drag items or use arrows to reorder merge sequence
        </span>
      </div>

      <ul className="space-y-2">
        {files.map((file, index) => {
          const isBeingDragged = draggedIndex === index;
          const isTargeted = dragOverIndex === index;

          return (
            <li
              key={`${file.name}-${file.size}-${index}`}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group flex items-center justify-between p-3.5 bg-white rounded-xl border transition-all duration-150 ${
                isBeingDragged
                  ? 'opacity-40 border-indigo-400 border-dashed bg-indigo-50/50 scale-[0.98]'
                  : isTargeted
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Drag handle icon */}
                <button
                  type="button"
                  tabIndex={-1}
                  className={`cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 ${
                    disabled ? 'hidden' : ''
                  }`}
                  aria-label="Drag to reorder"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                  </svg>
                </button>

                {/* Index badge */}
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>

                {/* File PDF icon */}
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* File info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{formatFileSize(file.size)}</p>
                </div>
              </div>

              {/* Action controls */}
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                {/* Reorder Up/Down Buttons */}
                {!disabled && files.length > 1 && (
                  <div className="flex items-center space-x-0.5 mr-1 border-r border-slate-200 pr-1">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === files.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => !disabled && onRemove(index)}
                  disabled={disabled}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
