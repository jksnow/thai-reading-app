import React, { useState } from "react";
import ButtonOptions from "./ButtonOptions";
import ButtonContainer from "./ButtonContainer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import DonateModal from "./DonateModal";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SocialMediaButtons: React.FC = () => {
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  // Links to social media - replace with actual URLs
  const discordUrl = "https://discord.gg/dgHtquGA";

  const handleDiscordClick = () => {
    window.open(discordUrl, "_blank");
  };

  return (
    <>
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
            onClick={() => setIsDonateModalOpen(true)}
            variant="purple"
            padding="py-2 px-4"
          >
            DONATE
          </ButtonOptions>
        </ButtonContainer>
      </div>

      {isDonateModalOpen && (
        <Elements stripe={stripePromise}>
          <DonateModal
            isOpen={isDonateModalOpen}
            onClose={() => setIsDonateModalOpen(false)}
          />
        </Elements>
      )}
    </>
  );
};

export default SocialMediaButtons;
