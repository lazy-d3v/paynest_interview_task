import React from 'react';

interface ErrorPageProps {
  error: Error | null;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-md w-full bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700/50 p-8 text-center">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-white">Application Error</h1>
        <p className="text-slate-400 mb-6">
          Something went wrong while loading the page.
        </p>

        {error && (
          <div className="bg-[#0f172a] rounded-lg p-4 mb-6 text-left overflow-auto max-h-40 border border-slate-800">
            <code className="text-sm text-red-400 font-mono break-words">
              {error.name}: {error.message}
            </code>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20"
          >
            Reload Application
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
          >
            Go to Home
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-500">
          Technical details can be found in the browser console (F12)
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
