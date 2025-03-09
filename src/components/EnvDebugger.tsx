import React, { useState } from "react";
import ShaderButton from "./ShaderButton";

const EnvDebugger: React.FC = () => {
  const [showingDetails, setShowingDetails] = useState(false);

  // Only showing the availability of the API key, not the actual key for security
  const deepseekApiKeyAvailable = Boolean(
    import.meta.env.VITE_DEEPSEEK_API_KEY
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ShaderButton
        onClick={() => setShowingDetails((prev) => !prev)}
        variant="tertiary"
        className="text-sm px-3 py-1"
      >
        {showingDetails ? "Hide Env Info" : "Debug Env"}
      </ShaderButton>

      {showingDetails && (
        <div className="mt-2 p-4 adventure-container text-sm">
          <h3 className="font-medium mb-2 text-ink">Environment Variables:</h3>
          <div className="space-y-1">
            <div>
              <span className="font-mono text-ink">VITE_DEEPSEEK_API_KEY:</span>
              <span
                className={
                  deepseekApiKeyAvailable
                    ? "text-success ml-2"
                    : "text-danger ml-2"
                }
              >
                {deepseekApiKeyAvailable ? "✓ Available" : "✗ Missing"}
              </span>
            </div>
            <div className="text-ink/[0.7] text-xs mt-2">
              <p>
                Note: For security reasons, the actual values are not displayed.
              </p>
              <p>
                Environment variables in Vite must be prefixed with VITE_ to be
                accessible in browser code.
              </p>
              <p>
                Make sure your .env file is in the project root and contains:
                <pre className="bg-parchment p-1 mt-1 rounded border border-parchment-dark">
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
