const Order = require('../models/Order');
const { processPayment } = require('../services/paymentService');
const { generateInvoice } = require('../services/pdfService');
const { sendInvoiceEmail } = require('../services/emailService');

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;
    const userId = req.user.id;

    // Process payment
    const paymentResult = await processPayment(totalAmount, paymentMethod);
    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    // Create order
    const order = new Order({
      user: userId,
      items,
      totalAmount,
      paymentId: paymentResult.paymentId,
    });
    await order.save();

    // Generate invoice
    const invoicePdf = await generateInvoice(order);
    console.log("pdf");
    
    // console.log(req.user);
    // Send invoice email
    await sendInvoiceEmail(req.user.email, invoicePdf);
    console.log("mail");
    
    res.status(201).json({ message: 'Order created successfully', orderId: order._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};