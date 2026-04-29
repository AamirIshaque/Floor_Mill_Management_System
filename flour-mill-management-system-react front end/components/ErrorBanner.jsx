import React from 'react';

const ErrorBanner = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="mb-3 rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm flex items-start justify-between">
      <div className="pr-3">
        <strong className="mr-2">Error:</strong>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-3 px-2 py-0.5 text-xs rounded border border-red-300 hover:bg-red-100">Dismiss</button>
      )}
    </div>
  );
};

export default ErrorBanner;
