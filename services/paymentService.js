const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

exports.processPayment = async (amount, paymentMethod) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: 'usd',
      payment_method: paymentMethod,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      // return_url:"http://localhost:5000/api/orders"
    });

    return { success: true, paymentId: paymentIntent.id };
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, error: error.message };
  }
};