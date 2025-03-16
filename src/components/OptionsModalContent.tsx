import React, { useState } from "react";
import ButtonOptions from "./ButtonOptions";
import { useAppState } from "../context/AppStateContext";
import { useAuth } from "../context/AuthContext";
import SettingsModal from "./SettingsModal";

interface OptionsModalContentProps {
  onClose: () => void;
}

const OptionsModalContent: React.FC<OptionsModalContentProps> = ({
  onClose,
}) => {
  const { setCurrentSection } = useAppState();
  const { signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleMainMenu = () => {
    setCurrentSection("home");
    onClose();
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Only show options content when settings modal is not open */}
      {!isSettingsOpen && (
        <div className="p-4 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Options</h2>

          <div className="flex flex-col gap-4">
            <ButtonOptions
              onClick={handleMainMenu}
              variant="red"
              padding="py-2"
            >
              Main Menu
            </ButtonOptions>

            <ButtonOptions
              variant="red"
              padding="py-2"
              onClick={openSettings}
            >
              Settings
            </ButtonOptions>

            <ButtonOptions
              variant="red"
              padding="py-2"
            >
              Stats
            </ButtonOptions>

            <ButtonOptions
              variant="red"
              padding="py-2"
            >
              App Information
            </ButtonOptions>

            <ButtonOptions
              variant="red"
              padding="py-2"
              onClick={handleLogout}
            >
              Logout
            </ButtonOptions>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        isChildModal={true}
      />
    </>
  );
};

export default OptionsModalContent;
