import React, { useState } from "react";
import ButtonOptions from "./ButtonOptions";
import ButtonContainer from "./ButtonContainer";
import { useAppState } from "../context/AppStateContext";
import ModalContainer from "./ModalContainer";
import OptionsModalContent from "./OptionsModalContent";

const GlobalButtonContainer: React.FC = () => {
  const { currentSection, setCurrentSection } = useAppState();

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // Define positioning based on current section
  const getContainerClasses = () => {
    // On main screen, center position like in MainTitleScreen
    if (currentSection === "home") {
      return ""; // Empty for default positioning, it will inherit from parent
    }

    // On other screens, position at bottom left
    return "fixed bottom-8 left-8 z-30";
  };

  const openOptionsModal = () => {
    setIsOptionsModalOpen(true);
  };

  const closeOptionsModal = () => {
    setIsOptionsModalOpen(false);
  };

  return (
    <>
      <div className={getContainerClasses()}>
        <ButtonContainer>
          {/* Only show START button on home screen */}
          {currentSection === "home" && (
            <ButtonOptions
              onClick={() => setCurrentSection("modifier-selection")}
              variant="blue"
            >
              START
            </ButtonOptions>
          )}

          <ButtonOptions
            variant="green"
            onClick={openOptionsModal}
          >
            OPTIONS
          </ButtonOptions>

          <ButtonOptions variant="amber">COLLECTION</ButtonOptions>
        </ButtonContainer>
      </div>

      {/* Options Modal */}
      <ModalContainer
        isOpen={isOptionsModalOpen}
        onClose={closeOptionsModal}
        size="small"
      >
        <OptionsModalContent onClose={closeOptionsModal} />
      </ModalContainer>
    </>
  );
};

export default GlobalButtonContainer;
