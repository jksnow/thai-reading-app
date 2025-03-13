import React from "react";
import ButtonOptions from "./ButtonOptions";
import ModalContainer from "./ModalContainer";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeBackgroundMood: () => void;
  isTransitioning: boolean;
  isChildModal?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onChangeBackgroundMood,
  isTransitioning,
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

        <div className="flex flex-col gap-4">
          <ButtonOptions
            onClick={onChangeBackgroundMood}
            variant="purple"
            padding="py-2"
            disabled={isTransitioning}
          >
            Change Background Mood
          </ButtonOptions>

          {/* Additional settings buttons can be added here */}
        </div>
      </div>
    </ModalContainer>
  );
};

export default SettingsModal;
