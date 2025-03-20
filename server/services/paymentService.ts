import stripe from "../config/stripe.js";

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export const paymentService = {
  // Create a payment intent
  createPaymentIntent: async ({
    amount,
    currency = "usd",
    metadata = {},
  }: CreatePaymentIntentParams) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert dollars to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  },

  // Retrieve a payment intent
  retrievePaymentIntent: async (paymentIntentId: string) => {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error("Error retrieving payment intent:", error);
      throw error;
    }
  },
};
