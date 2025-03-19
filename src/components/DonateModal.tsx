import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import ModalContainer from "./ModalContainer";
import ButtonOptions from "./ButtonOptions";
import axios from "axios";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<number>(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const { data } = await axios.post("/api/payments/create-payment-intent", {
        amount,
        currency: "usd",
        metadata: {
          type: "donation",
        },
      });

      // Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (stripeError) {
        setError(stripeError.message || "An error occurred");
      } else {
        onClose();
      }
    } catch (err) {
      setError("Failed to process payment");
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const predefinedAmounts = [5, 10, 20, 50, 100];

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      size="small"
    >
      <div className="p-6 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Support ThaiTale
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Amount (USD)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-2 px-4 rounded-lg transition-colors ${
                    amount === amt
                      ? "bg-amber-500 text-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Card Element */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Card Details
            </label>
            <div className="bg-gray-700 p-4 rounded-lg">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#ffffff",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#fa755a",
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <ButtonOptions
              onClick={() => {
                const fakeEvent = {
                  preventDefault: () => {},
                } as React.FormEvent;
                handleSubmit(fakeEvent);
              }}
              disabled={isProcessing || !stripe}
              variant="amber"
              padding="py-3"
            >
              {isProcessing ? "Processing..." : `Donate $${amount}`}
            </ButtonOptions>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

export default DonateModal;
