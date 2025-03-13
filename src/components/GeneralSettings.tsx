import React from "react";
import ShaderButton from "./ShaderButton";

interface GeneralSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeBackgroundMood: () => void;
  isTransitioning: boolean;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  isOpen,
  onClose,
  onChangeBackgroundMood,
  isTransitioning,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-gray-800/20 z-40"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-ink">General Settings</h3>
          <button
            onClick={onClose}
            className="text-ink hover:text-accent-tertiary"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <ShaderButton
              variant="tertiary"
              onClick={onChangeBackgroundMood}
              disabled={isTransitioning}
              fullWidth
              className="py-3"
            >
              <span className="font-medium">Change Background Mood</span>
            </ShaderButton>
          </div>
        </div>
      </div>
    </>
  );
};
