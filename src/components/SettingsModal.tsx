import React from "react";
import ModalContainer from "./ModalContainer";
import ColorSchemeCarousel from "./ColorSchemeCarousel";
import AnimationSettingsCarousel from "./AnimationSettingsCarousel";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { useShaderSettings } from "../context/ShaderSettingsContext";

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
  const { currentUser, userData } = useAuth();
  const { settings, updateSettings } = useShaderSettings();

  // Save settings when modal closes
  const handleClose = async () => {
    if (currentUser) {
      try {
        await userService.updateUser(currentUser.uid, {
          settings: {
            ...userData?.settings, // Preserve other settings
            ...settings, // Save current shader settings
          },
        });
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    }
    onClose();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
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

          {/* Animation Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Animation Settings</h3>
            <div className="space-y-4">
              <AnimationSettingsCarousel
                settingName="spinRotationSpeed"
                currentValue={settings.spinRotationSpeed}
                onValueChange={(value) =>
                  updateSettings({ spinRotationSpeed: value })
                }
              />
              <AnimationSettingsCarousel
                settingName="moveSpeed"
                currentValue={settings.moveSpeed}
                onValueChange={(value) => updateSettings({ moveSpeed: value })}
              />
              <AnimationSettingsCarousel
                settingName="spinAmount"
                currentValue={settings.spinAmount}
                onValueChange={(value) => updateSettings({ spinAmount: value })}
              />
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

export default SettingsModal;
