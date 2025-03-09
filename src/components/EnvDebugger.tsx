import React, { useState } from "react";

const EnvDebugger: React.FC = () => {
  const [showingDetails, setShowingDetails] = useState(false);

  // Only showing the availability of the API key, not the actual key for security
  const deepseekApiKeyAvailable = Boolean(
    import.meta.env.VITE_DEEPSEEK_API_KEY
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowingDetails((prev) => !prev)}
        className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
      >
        {showingDetails ? "Hide Env Info" : "Debug Env"}
      </button>

      {showingDetails && (
        <div className="mt-2 p-4 bg-white border border-gray-300 rounded-md shadow-lg text-sm">
          <h3 className="font-medium mb-2">Environment Variables:</h3>
          <div className="space-y-1">
            <div>
              <span className="font-mono">VITE_DEEPSEEK_API_KEY:</span>
              <span
                className={
                  deepseekApiKeyAvailable
                    ? "text-green-600 ml-2"
                    : "text-red-600 ml-2"
                }
              >
                {deepseekApiKeyAvailable ? "✓ Available" : "✗ Missing"}
              </span>
            </div>
            <div className="text-gray-500 text-xs mt-2">
              <p>
                Note: For security reasons, the actual values are not displayed.
              </p>
              <p>
                Environment variables in Vite must be prefixed with VITE_ to be
                accessible in browser code.
              </p>
              <p>
                Make sure your .env file is in the project root and contains:
                <pre className="bg-gray-100 p-1 mt-1 rounded">
                  VITE_DEEPSEEK_API_KEY=your_api_key_here
                </pre>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvDebugger;
