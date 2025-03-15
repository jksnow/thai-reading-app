import { loadStripe } from "@stripe/stripe-js";

// Load the Stripe instance once for the entire app
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;
