import React, { useState } from "react";
import ButtonOptions from "./ButtonOptions";
import ButtonContainer from "./ButtonContainer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import DonateModal from "./DonateModal";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SocialMediaButtonsProps {
  isMobile?: boolean;
}

const SocialMediaButtons: React.FC<SocialMediaButtonsProps> = ({
  isMobile = false,
}) => {
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(5);

  // Links to social media - replace with actual URLs
  const discordUrl = "https://discord.gg/dgHtquGA";

  const handleDiscordClick = () => {
    window.open(discordUrl, "_blank");
  };

  const handleDonationAmountChange = (amount: number) => {
    setDonationAmount(amount);
  };

  const renderButtons = () => (
    <ButtonContainer className={isMobile ? "w-full" : ""}>
      <ButtonOptions
        onClick={handleDiscordClick}
        variant="blue"
        padding="py-2 px-4"
        className={isMobile ? "mb-2" : ""}
      >
        DISCORD
      </ButtonOptions>

      <ButtonOptions
        onClick={() => setIsDonateModalOpen(true)}
        variant="purple"
        padding="py-2 px-4"
        className={isMobile ? "mb-2" : ""}
      >
        DONATE
      </ButtonOptions>
    </ButtonContainer>
  );

  return (
    <>
      {!isMobile ? (
        <div className="fixed bottom-8 right-8 z-30 md:block hidden">
          {renderButtons()}
        </div>
      ) : (
        <div className="flex flex-col w-full">{renderButtons()}</div>
      )}

      {isDonateModalOpen && (
        <Elements
          stripe={stripePromise}
          options={{
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#f59e0b",
                colorBackground: "#374151",
                colorText: "#ffffff",
              },
            },
            mode: "payment",
            amount: donationAmount * 100, // Convert dollars to cents
            currency: "usd",
          }}
        >
          <DonateModal
            isOpen={isDonateModalOpen}
            onClose={() => setIsDonateModalOpen(false)}
            onAmountChange={handleDonationAmountChange}
            initialAmount={donationAmount}
          />
        </Elements>
      )}
    </>
  );
};

export default SocialMediaButtons;
