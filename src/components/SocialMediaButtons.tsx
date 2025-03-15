import React from "react";
import ButtonOptions from "./ButtonOptions";
import ButtonContainer from "./ButtonContainer";

const SocialMediaButtons: React.FC = () => {
  // Links to social media - replace with actual URLs
  const discordUrl = "https://discord.gg/dgHtquGA";
  const instagramUrl = "https://instagram.com/your-instagram";

  const handleDiscordClick = () => {
    window.open(discordUrl, "_blank");
  };

  const handleInstagramClick = () => {
    window.open(instagramUrl, "_blank");
  };

  return (
    <div className="fixed bottom-8 right-8 z-30">
      <ButtonContainer>
        <ButtonOptions
          onClick={handleDiscordClick}
          variant="blue"
          padding="py-2 px-4"
        >
          DISCORD
        </ButtonOptions>

        <ButtonOptions
          onClick={handleInstagramClick}
          variant="purple"
          padding="py-2 px-4"
        >
          INSTAGRAM
        </ButtonOptions>
      </ButtonContainer>
    </div>
  );
};

export default SocialMediaButtons;
