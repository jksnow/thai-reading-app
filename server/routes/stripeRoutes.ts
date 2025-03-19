import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    // Create a PaymentIntent with the specified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
    });
  }
});

export default router;
