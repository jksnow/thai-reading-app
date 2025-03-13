import React, { ReactNode } from "react";
import ButtonOptions from "./ButtonOptions";

interface ModalContainerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: "small" | "large";
  showOverlay?: boolean;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  children,
  isOpen,
  onClose,
  size = "small",
  showOverlay = true,
}) => {
  if (!isOpen) return null;

  // Width based on size prop
  const getWidth = () => {
    switch (size) {
      case "small":
        return "w-[400px]";
      case "large":
        return "w-[800px]";
      default:
        return "w-[400px]";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay - only show if showOverlay is true */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div
        className={`bg-gray-800 p-2 rounded-xl border-2 border-gray-300 ${getWidth()} z-50`}
        style={{
          boxShadow: "2px 3px 0 rgba(0, 0, 0, 0.9)",
        }}
      >
        {/* Modal content */}
        <div className="mb-4">{children}</div>

        {/* Back button */}
        <div className="mt-4 w-full">
          <ButtonOptions
            onClick={onClose}
            variant="amber"
          >
            BACK
          </ButtonOptions>
        </div>
      </div>
    </div>
  );
};

export default ModalContainer;
