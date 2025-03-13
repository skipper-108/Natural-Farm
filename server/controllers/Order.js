import Order from "../models/Order.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { responder } from "./../utils/utils.js";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Replace with your actual Hostinger SMTP host
  port: 465,                  // Use the correct port for your configuration
  secure: true,               // true if using SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


// Email notification function
const sendOrderNotification = async (order) => {
  try {
    // Format product items for email
    const productList = order.products.map(product => {
      return `
        <tr>
          <td>${product.name || product.productId}</td>
          <td>${product.quantity}</td>
          <td>₹${product.price.toFixed(2)}</td>
          <td>₹${(product.price * product.quantity).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Admin email address
      subject: `New Order Received #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #333; text-align: center;">New Order Notification</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Customer ID:</strong> ${order.userId}</p>
          <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMode}</p>

           <h3 style="margin-top: 20px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f7f7f7;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
            ${productList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">₹${order.totalBill.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="margin-top: 20px;">Please process this order as soon as possible.</p>
          </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent for order ${order._id}`);
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw error here, we don't want to affect the order process
  }
};
          

const postOrders = async (req, res) => {
  const { products, deliveryAddress, phone, paymentMode } = req.body;

  if (!products || !deliveryAddress || !phone || !paymentMode) {
    return responder(
      res,
      false,
      `products, totalBill, deliveryAddress, phone, paymentMode are required`,
      null,
      400
    );
  }

  let totalBill = 0;

  products.forEach((product) => {
    totalBill += product.price * product.quantity;
  });

  try {
    const newOrder = new Order({
      userId: req.user.id,
      products,
      totalBill,
      deliveryAddress,
      phone,
      paymentMode,
    });

    const savedOrder = await newOrder.save();

     // Send email notification to admin about the new order
     await sendOrderNotification(savedOrder);

    return responder(res, true, "Order placed successfully", savedOrder, 201);
  } catch (error) {
    return responder(res, false, error.message, null, 400);
  }
};

const putOrders = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  let order;

  try {
    order = await Order.findById(id);

    if (!order) {
      return responder(res, false, "Order not found", null, 404);
    }
  } catch (error) {
    return responder(res, false, error.message, null, 400);
  }

  // user can only update his own order
  if (user.role=="user" && order.userId!=user.id) {
    return responder(
      res,
      false,
      "You are not authorized to update this order",
      null,
      401
    );
  }

  // user can only cancel the order if it is not delivered
  if (user.role=="user") {
    if (order.status == "delivered") {
      return responder(
        res,
        false,
        "Order has already been delivered",
        null,
        400
      );
    }

    if (req.body.status == "cancelled") {
      order.status = "cancelled";
    }
  }

  if (req.body.phone) {
    order.phone = req.body.phone;
  }

  if (req.body.deliveryAddress) {
    order.deliveryAddress = req.body.deliveryAddress;
  }

  if (user.role == "admin") {
    order.status = req.body.status;
    order.timeline = req.body.timeline;
  }

  await order.save();

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { status: req.body.status, timeline: req.body.timeline },
    { new: true, runValidators: true }
  );
  

  return responder(res, true, "Order updated successfully", updatedOrder, 200);
};

const getOrderById = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  console.log("User from JWT:", user);
  console.log("Order ID requested:", id);

  let order;

  try {
    order = await Order.findById(id)
      .populate("userId", "name email")
      .populate(
        "products.productId",
        "-shortDescription -features -image -category -tags -__v -createdAt -updatedAt"
      )
      .populate("paymentId", "-__v -createdAt -updatedAt");

    if (!order) {
      console.log("Order not found in database");
      return responder(res, false, "Order not found", null, 404);
    }

    console.log("Order userId:", order.userId);
    console.log("User.id:", user.id);
    console.log("User Role:", user.role);
  } catch (error) {
    return responder(res, false, error.message, null, 400);
  }

  // Convert both IDs to strings before comparing
  if (!order.userId.equals(user.id) && user.role !== "admin") {
    console.log("Unauthorized access: User does not match Order userId");
    return responder(
      res,
      false,
      "You are not authorized to view this order",
      null,
      401
    );
  }

  return responder(res, true, "Order fetched successfully", order, 200);
};


const getOrdersByUserId = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (user.role != "admin" && user.id != id) {
    return responder(
      res,
      false,
      "You are not authorized to view this orders",
      null,
      401
    );
  }

  const orders = await Order.find({ userId: id })
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .populate(
      "products.productId",
      "-shortDescription -features -image -category -tags -__v -createdAt -updatedAt"
    )
    .populate("paymentId", "-__v -createdAt -updatedAt");

  return responder(res, true, "Orders fetched successfully", orders, 200);
};

export { getOrderById, getOrdersByUserId, postOrders, putOrders };