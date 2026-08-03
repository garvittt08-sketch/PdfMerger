import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import MergePage from './pages/MergePage';
import SplitPage from './pages/SplitPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
        {/* Navigation Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                PDF<span className="text-indigo-600">Utility</span>
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <NavLink
                to="/merge"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`
                }
              >
                Merge PDFs
              </NavLink>
              <NavLink
                to="/split"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`
                }
              >
                Split PDF
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Routes>
            <Route path="/" element={<Navigate to="/merge" replace />} />
            <Route path="/merge" element={<MergePage />} />
            <Route path="/split" element={<SplitPage />} />
            <Route path="*" element={<Navigate to="/merge" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6">
          <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-400 font-medium">
            PDF Utility Client • Powered by ASP.NET Core Backend
          </div>
        </footer>
      </div>
    </Router>
  );
}
