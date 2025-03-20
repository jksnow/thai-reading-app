import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import ModalContainer from "./ModalContainer";
import ButtonOptions from "./ButtonOptions";
import axios from "axios";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAmountChange: (amount: number) => void;
  initialAmount: number;
}

const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  onAmountChange,
  initialAmount,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<number>(initialAmount);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    onAmountChange(newAmount);
  };

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

      // Submit the form first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "An error occurred");
        return;
      }

      // Then confirm payment
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
      size="large"
    >
      <div className="p-6 text-white max-h-[90vh] overflow-y-auto">
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
                  onClick={() => handleAmountChange(amt)}
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

          {/* Payment Element */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Details
            </label>
            <div className="bg-gray-700 p-4 rounded-lg">
              <PaymentElement
                options={{
                  layout: { type: "tabs" },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isProcessing || !stripe}
              className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors ${
                isProcessing || !stripe
                  ? "bg-green-700 opacity-50 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              }`}
              style={{
                boxShadow: "2px 3px 0 rgba(0, 0, 0, 0.9)",
                textShadow: "0px 2px 0px rgba(0,0,0,1)",
              }}
            >
              {isProcessing ? "Processing..." : `Donate $${amount}`}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

export default DonateModal;
