import express, { Request, Response } from "express";
import { paymentService } from "../services/paymentService.js";
import stripe from "../config/stripe.js";

const router = express.Router();

// Create a payment intent
router.post(
  "/create-payment-intent",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, currency, metadata } = req.body;

      if (!amount) {
        res.status(400).json({ error: "Amount is required" });
        return;
      }

      const paymentIntent = await paymentService.createPaymentIntent({
        amount,
        currency: currency || "usd",
        metadata,
      });

      res.json(paymentIntent);
    } catch (error: any) {
      console.error("Payment route error:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  }
);

// Webhook to handle Stripe events
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_SECRET_KEY || ""
      );

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          // Handle successful payment
          console.log("Payment succeeded:", event.data.object);
          break;
        case "payment_intent.payment_failed":
          // Handle failed payment
          console.log("Payment failed:", event.data.object);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

export default router;
