import Order from "./../models/Order.js";
import Payment from "./../models/Payment.js";

const postPayments = async (req, res) => {
  const { orderId, amount, paymentMode, status, transactionId } = req.body;

  let order;

  try {
    order = await Order.findById(orderId);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "This order does not exist",
    });
  }

  if (["delivered", "cancelled"].includes(order.status.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `This order has already been ${order.status}`,
    });
  }

  const payment = new Payment({
    orderId,  
    paymentMode,
    amount,
    transactionId,
    status,
  });

  try {
    const savedPayment = await payment.save();

    order.paymentId = savedPayment._id;
    order.paymentMode = paymentMode;

    order.timeline.push({ status: "Payment Completed", date: Date.now() });

    await order.save();

    return res.json({
      success: true,
      message: "Payment successful",
      data: savedPayment,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export { postPayments };