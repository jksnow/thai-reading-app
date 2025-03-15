import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Latest Stripe API version
});

export default stripe;
