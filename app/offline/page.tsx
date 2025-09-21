"use client";

export default function OfflinePage() {
  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re Offline
          </h1>
          <p className="text-gray-600">
            It looks like you&apos;re not connected to the internet. Some
            features may not be available.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleTryAgain}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>

          <div className="text-sm text-gray-500">
            <p>You can still:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>View previously loaded pages</li>
              <li>Access cached content</li>
              <li>Use basic app features</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">GMHS School Management System</p>
        </div>
      </div>
    </div>
  );
}
