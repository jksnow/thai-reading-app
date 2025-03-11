import React from "react";
import { useAppState } from "../context/AppStateContext";
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
  const { state, updateShaderProperty, toggleAnimation } = useAppState();

  if (!isOpen) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Animation
            </label>
            <button
              onClick={toggleAnimation}
              className={`px-3 py-1 rounded text-sm ${
                state.startAnimation
                  ? "bg-accent-tertiary text-white"
                  : "bg-gray-200 text-ink"
              }`}
            >
              {state.startAnimation ? "Pause" : "Play"} Animation
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Rotation Speed: {state.spinRotationSpeed.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={state.spinRotationSpeed}
              onChange={(e) =>
                updateShaderProperty(
                  "spinRotationSpeed",
                  parseFloat(e.target.value)
                )
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Disturbance Speed: {state.moveSpeed.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.01"
              value={state.moveSpeed}
              onChange={(e) =>
                updateShaderProperty("moveSpeed", parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Spin Amount: {state.spinAmount.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={state.spinAmount}
              onChange={(e) =>
                updateShaderProperty("spinAmount", parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Pixel Filter: {state.pixelFilter.toFixed(0)}
            </label>
            <input
              type="range"
              min="500"
              max="3000"
              step="10"
              value={state.pixelFilter}
              onChange={(e) =>
                updateShaderProperty("pixelFilter", parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </>
  );
};
