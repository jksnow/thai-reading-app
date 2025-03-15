import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../lib/stripe";
import CheckoutForm from "./CheckoutForm";

interface PaymentWrapperProps {
  amount: number;
}

const PaymentWrapper = ({ amount }: PaymentWrapperProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Complete Your Payment
      </h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm amount={amount} />
      </Elements>
    </div>
  );
};

export default PaymentWrapper;
