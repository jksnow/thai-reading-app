import express from "express";
import stripe from "../config/stripe.js";

const router = express.Router();

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Invalid amount provided" });
    }

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
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
