import React, { useState, useRef } from 'react';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit

/**
 * FileDropzone component supporting drag-and-drop and click-to-browse for PDF files.
 */
export default function FileDropzone({
  onFilesSelected,
  onError,
  multiple = true,
  disabled = false,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const processFiles = (rawFiles) => {
    if (disabled || !rawFiles || rawFiles.length === 0) return;

    const fileList = Array.from(rawFiles);
    const validFiles = [];
    const errors = [];

    for (const file of fileList) {
      const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');
      const isPdfType = file.type === 'application/pdf' || file.type === '';

      if (!isPdfExtension) {
        errors.push(`"${file.name}" is not a PDF file. Only .pdf files are accepted.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        errors.push(`"${file.name}" exceeds the 25 MB limit (size: ${sizeMb} MB).`);
        continue;
      }

      if (file.size === 0) {
        errors.push(`"${file.name}" is empty (0 bytes).`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0 && onError) {
      onError(errors.join(' '));
    }

    if (validFiles.length > 0) {
      if (multiple) {
        onFilesSelected(validFiles);
      } else {
        onFilesSelected([validFiles[0]]);
      }
    }

    // Reset input value so re-selecting the same file works
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 select-none ${
        disabled
          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
          : isDragOver
          ? 'border-indigo-500 bg-indigo-50/60 shadow-lg scale-[1.01]'
          : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/80 shadow-sm'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-3">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 ${
            isDragOver
              ? 'bg-indigo-600 text-white scale-110'
              : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
          }`}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div>
          <p className="text-base font-semibold text-slate-800">
            {isDragOver ? (
              <span className="text-indigo-600">Drop PDF file{multiple ? 's' : ''} here</span>
            ) : (
              <>
                Drag & drop PDF file{multiple ? 's' : ''} here, or{' '}
                <span className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2">
                  browse
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Only .pdf files allowed (Max 25 MB per file)
          </p>
        </div>
      </div>
    </div>
  );
}
