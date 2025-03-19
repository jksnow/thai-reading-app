import React from "react";
import ButtonOptions from "./ButtonOptions";
import { useAppState } from "../context/AppStateContext";

interface StartModalContentProps {
  onClose: () => void;
}

const StartModalContent: React.FC<StartModalContentProps> = ({ onClose }) => {
  const { setCurrentSection } = useAppState();

  const handleNewStory = () => {
    setCurrentSection("modifier-selection");
    onClose();
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Start Reading</h2>

      <div className="flex flex-col gap-4">
        <ButtonOptions
          onClick={handleNewStory}
          variant="blue"
          padding="py-2"
        >
          New Story
        </ButtonOptions>

        <ButtonOptions
          variant="blue"
          padding="py-2"
        >
          Continue Story
        </ButtonOptions>
      </div>
    </div>
  );
};

export default StartModalContent;
