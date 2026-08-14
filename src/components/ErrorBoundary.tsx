import React, { useState, useEffect, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error || event.message);
      // Suppress benign connection errors
      if (event.message?.includes('vite') || event.message?.includes('WebSocket')) {
        return;
      }
      setHasError(true);
      setErrorMessage(event.message || "An unexpected runtime error occurred.");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent default browser error reporting and log gracefully
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      console.warn("Unhandled promise rejection handled:", event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      // ignore
    }
    setHasError(false);
    setErrorMessage(null);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            An unexpected error occurred while rendering the interface.
          </p>
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-mono text-left overflow-x-auto">
              {errorMessage}
            </div>
          )}
          <button
            onClick={handleReset}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
