import React, { useState } from "react";
import ButtonOptions from "./ButtonOptions";
import ButtonContainer from "./ButtonContainer";
import { useAppState } from "../context/AppStateContext";
import ModalContainer from "./ModalContainer";
import OptionsModalContent from "./OptionsModalContent";
import CollectionModalContent from "./CollectionModalContent";
import StartModalContent from "./StartModalContent";

interface GlobalButtonContainerProps {
  isMobile?: boolean;
}

const GlobalButtonContainer: React.FC<GlobalButtonContainerProps> = ({
  isMobile = false,
}) => {
  const { currentSection } = useAppState();

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);

  // Define positioning based on current section
  const getContainerClasses = () => {
    // For mobile display, no special positioning is needed
    if (isMobile) {
      return "";
    }

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

  const openCollectionModal = () => {
    setIsCollectionModalOpen(true);
  };

  const closeCollectionModal = () => {
    setIsCollectionModalOpen(false);
  };

  const openStartModal = () => {
    setIsStartModalOpen(true);
  };

  const closeStartModal = () => {
    setIsStartModalOpen(false);
  };

  const renderButtons = () => (
    <ButtonContainer className={isMobile ? "w-full" : ""}>
      {/* Only show START button on home screen */}
      {currentSection === "home" && (
        <ButtonOptions
          onClick={openStartModal}
          variant="blue"
          className={isMobile ? "w-full" : ""}
        >
          START
        </ButtonOptions>
      )}

      <ButtonOptions
        variant="green"
        onClick={openOptionsModal}
        className={isMobile ? "w-full" : ""}
      >
        OPTIONS
      </ButtonOptions>

      <ButtonOptions
        variant="amber"
        onClick={openCollectionModal}
        className={isMobile ? "w-full" : ""}
      >
        COLLECTION
      </ButtonOptions>
    </ButtonContainer>
  );

  return (
    <>
      <div
        className={`${getContainerClasses()} ${
          isMobile ? "" : "md:block hidden"
        }`}
      >
        {renderButtons()}
      </div>

      {/* Options Modal */}
      <ModalContainer
        isOpen={isOptionsModalOpen}
        onClose={closeOptionsModal}
        size="small"
      >
        <OptionsModalContent onClose={closeOptionsModal} />
      </ModalContainer>

      {/* Collection Modal */}
      <ModalContainer
        isOpen={isCollectionModalOpen}
        onClose={closeCollectionModal}
        size="small"
      >
        <CollectionModalContent />
      </ModalContainer>

      {/* Start Modal */}
      <ModalContainer
        isOpen={isStartModalOpen}
        onClose={closeStartModal}
        size="small"
      >
        <StartModalContent onClose={closeStartModal} />
      </ModalContainer>
    </>
  );
};

export default GlobalButtonContainer;
