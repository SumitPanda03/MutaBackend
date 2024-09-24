const Order = require('../models/Order');
const { processPayment } = require('../services/paymentService');
const { generateInvoice, generateCombinedInvoice } = require('../services/pdfService');
const { sendInvoiceEmail } = require('../services/emailService');

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;
    const userId = req.user.id;

    const paymentResult = await processPayment(totalAmount, paymentMethod);
    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    const order = new Order({
      user: userId,
      items,
      totalAmount,
      paymentId: paymentResult.paymentId,
    });
    await order.save();

    // Generate invoice
    // const invoicePdf = await generateInvoice(order);
    // console.log("pdf");
    
    // console.log(req.user);
    // Send invoice email
    // await sendInvoiceEmail(req.user.email, invoicePdf);
    // console.log("mail");
    
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

exports.checkoutOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const orders = await Order.find({ user: userId });
    
    if (orders.length === 0) {
      return res.status(400).json({ message: 'No unpaid orders found' });
    }

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const paymentMethod = req.body.paymentMethod;
    const paymentResult = await processPayment(totalAmount, paymentMethod);
    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    await Order.updateMany(
      { _id: { $in: orders.map(order => order._id) } },
      { status: "Paid", paymentId: paymentResult.paymentId }
    );
    
    const invoicePdf = await generateCombinedInvoice(orders);

    await sendInvoiceEmail(userEmail, invoicePdf);

    res.status(200).json({ message: 'Checkout successful', ordersProcessed: orders.length });
  } catch (error) {
    res.status(500).json({ message: 'Error during checkout', error: error.message });
  }
};  