import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

// If VITE_API_BASE_URL is not set at build time, smart fallback based on current host:
if (!rawBaseUrl) {
  rawBaseUrl = isLocalhost
    ? 'http://localhost:5113/api'
    : 'https://pdfmerger-ew64.onrender.com/api';
}

// Normalize base URL to always include '/api' if not present
rawBaseUrl = rawBaseUrl.trim().replace(/\/$/, '');
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const API_BASE_URL = rawBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for large files
});

/**
 * Extracts a human-readable error message from Axios errors,
 * handling Blob responses returned when backend status is 4xx or 5xx.
 */
export const handleApiError = async (error) => {
  if (error.response) {
    let message = `Server returned status ${error.response.status}`;

    if (error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (typeof parsed === 'string') {
              message = parsed;
            } else if (parsed.error) {
              message = parsed.error;
            } else if (parsed.message) {
              message = parsed.message;
            } else if (parsed.title) {
              message = parsed.title;
              if (parsed.errors) {
                const details = Object.values(parsed.errors).flat().join(', ');
                if (details) message += `: ${details}`;
              }
            } else {
              message = text;
            }
          } catch {
            // Plain text string from BadRequest("...")
            message = text;
          }
        }
      } catch (e) {
        console.error('Error reading error blob:', e);
      }
    } else if (typeof error.response.data === 'string') {
      message = error.response.data;
    } else if (error.response.data?.error) {
      message = error.response.data.error;
    } else if (error.response.data?.message) {
      message = error.response.data.message;
    }

    return message;
  } else if (error.request) {
    return 'Unable to connect to backend server. Please check your backend service at ' + API_BASE_URL;
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Merge multiple PDF files into one.
 * @param {File[]} files - List of PDF files
 * @param {Function} [onUploadProgress] - Progress callback (0-100)
 * @returns {Promise<Blob>}
 */
export const mergePdfs = async (files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await api.post('/Pdf/merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = await handleApiError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Split a single PDF file into chunks.
 * @param {File} file - PDF file to split
 * @param {number} pagesPerChunk - Pages per chunk (1-500)
 * @param {Function} [onUploadProgress] - Progress callback (0-100)
 * @returns {Promise<Blob>}
 */
export const splitPdf = async (file, pagesPerChunk, onUploadProgress) => {
  const formData = new FormData();
  formData.append('File', file);
  formData.append('PagesPerChunk', pagesPerChunk.toString());

  try {
    const response = await api.post('/Pdf/split', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = await handleApiError(error);
    throw new Error(errorMessage);
  }
};
