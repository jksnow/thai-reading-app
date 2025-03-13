import React from "react";
import ModalContainer from "./ModalContainer";
import ColorSchemeCarousel from "./ColorSchemeCarousel";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isChildModal?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isChildModal = true,
}) => {
  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      showOverlay={!isChildModal}
    >
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Settings</h2>

        <div className="flex flex-col gap-6">
          {/* Color Scheme Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Background Theme</h3>
            <ColorSchemeCarousel />
          </div>

          {/* Additional settings sections can be added here */}
        </div>
      </div>
    </ModalContainer>
  );
};

export default SettingsModal;
