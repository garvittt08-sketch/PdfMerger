import React, { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import FileList from '../components/FileList';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertToast from '../components/AlertToast';
import { mergePdfs } from '../services/pdfApi';

/**
 * Merge PDFs page supporting multi-file selection, reordering, and downloading merged output.
 */
export default function MergePage() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFilesSelected = (newFiles) => {
    setError(null);
    setSuccessMessage(null);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length - 1 < 2) {
      setError(null);
    }
  };

  const handleReorderFiles = (reorderedFiles) => {
    setFiles(reorderedFiles);
  };

  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleMerge = async (e) => {
    e.preventDefault();
    if (files.length < 2) {
      setError('Please select at least two PDF files to merge.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);
    setSuccessMessage(null);

    try {
      const mergedBlob = await mergePdfs(files, (percent) => {
        setProgress(percent);
      });

      triggerDownload(mergedBlob, 'merged.pdf');
      setSuccessMessage('Successfully merged PDFs! Download started automatically.');
    } catch (err) {
      console.error('Merge error:', err);
      setError(err.message || 'Failed to merge PDF files.');
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Merge PDF Files
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Combine multiple PDF documents into a single file in your desired order.
        </p>
      </div>

      {/* Dismissible Alerts */}
      {error && (
        <AlertToast type="error" message={error} onClose={() => setError(null)} />
      )}
      {successMessage && (
        <AlertToast type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      {/* Main card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
        {/* Dropzone */}
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          onError={(msg) => setError(msg)}
          multiple={true}
          disabled={isLoading}
        />

        {/* Selected file list */}
        {files.length > 0 && (
          <div className="space-y-4">
            <FileList
              files={files}
              onRemove={handleRemoveFile}
              onReorder={handleReorderFiles}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={clearAllFiles}
                disabled={isLoading}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-50"
              >
                Clear all files
              </button>

              <span className="text-xs font-medium text-slate-500">
                {files.length} file{files.length === 1 ? '' : 's'} selected
              </span>
            </div>
          </div>
        )}

        {/* Loading Spinner / Progress */}
        {isLoading && (
          <LoadingSpinner progress={progress} label="Merging PDF documents..." />
        )}

        {/* Action Button */}
        {!isLoading && (
          <button
            type="button"
            onClick={handleMerge}
            disabled={files.length < 2}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
              files.length < 2
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-200 hover:shadow-md active:scale-[0.99]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
            {files.length < 2
              ? `Select at least 2 PDFs (${files.length}/2)`
              : `Merge ${files.length} PDFs`}
          </button>
        )}
      </div>
    </div>
  );
}
