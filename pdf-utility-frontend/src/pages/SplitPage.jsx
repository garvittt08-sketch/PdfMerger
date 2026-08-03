import React, { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertToast from '../components/AlertToast';
import { splitPdf } from '../services/pdfApi';

/**
 * Formats file size in bytes into human-readable string.
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Split PDF page supporting single-file selection, specifying PagesPerChunk (1-500), and downloading split ZIP output.
 */
export default function SplitPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pagesPerChunk, setPagesPerChunk] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFilesSelected = (files) => {
    setError(null);
    setSuccessMessage(null);
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
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

  const handleSplit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF file to split.');
      return;
    }

    const pages = Number(pagesPerChunk);
    if (isNaN(pages) || pages < 1 || pages > 500) {
      setError('Pages per chunk must be a number between 1 and 500.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);
    setSuccessMessage(null);

    try {
      const zipBlob = await splitPdf(selectedFile, pages, (percent) => {
        setProgress(percent);
      });

      triggerDownload(zipBlob, 'split_output.zip');
      setSuccessMessage('Successfully split PDF! Download started automatically.');
    } catch (err) {
      console.error('Split error:', err);
      setError(err.message || 'Failed to split PDF file.');
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Split PDF File
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Divide a PDF document into smaller multi-page chunks or individual pages.
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
        {/* Dropzone or Selected File details */}
        {!selectedFile ? (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            onError={(msg) => setError(msg)}
            multiple={false}
            disabled={isLoading}
          />
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 font-medium">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => !isLoading && setSelectedFile(null)}
              disabled={isLoading}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            >
              Change file
            </button>
          </div>
        )}

        {/* Configuration: Pages per chunk */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label htmlFor="pagesPerChunk" className="block text-sm font-semibold text-slate-700">
            Pages Per Chunk
          </label>
          <div className="flex items-center gap-3">
            <input
              id="pagesPerChunk"
              type="number"
              min="1"
              max="500"
              value={pagesPerChunk}
              onChange={(e) => setPagesPerChunk(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
              disabled={isLoading}
              className="w-32 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:opacity-60"
            />
            <span className="text-xs text-slate-500 font-medium">
              Each output PDF will contain up to {pagesPerChunk} page{pagesPerChunk === 1 ? '' : 's'} (Min: 1, Max: 500)
            </span>
          </div>
        </div>

        {/* Loading Spinner / Progress */}
        {isLoading && (
          <LoadingSpinner progress={progress} label="Splitting PDF document into chunks..." />
        )}

        {/* Action Button */}
        {!isLoading && (
          <button
            type="button"
            onClick={handleSplit}
            disabled={!selectedFile}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
              !selectedFile
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-200 hover:shadow-md active:scale-[0.99]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
              />
            </svg>
            {!selectedFile ? 'Select a PDF file to split' : `Split PDF (${pagesPerChunk} page/chunk)`}
          </button>
        )}
      </div>
    </div>
  );
}
