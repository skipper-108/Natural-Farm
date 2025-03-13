import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import axios from "axios";
import Order from "./models/Order.js";

dotenv.config();

// Import Controllers
import {
  getOrderById,
  getOrdersByUserId,
  postOrders,
  putOrders,
} from "./controllers/Order.js";
import { postPayments } from "./controllers/Payment.js";
import { getProducts, postProducts } from "./controllers/Product.js";
import { postLogin, postSignup } from "./controllers/User.js";
import {
  checkRoleMiddleware,
  jwtVerifyMiddleware,
} from "./middlewares/auth.js";
import { responder } from "./utils/utils.js";
import { uploadImage, uploadMiddleware } from "./controllers/Upload.js";

// Express App
const app = express();
app.use(express.json());
app.use(cors());

// You'll need to get these values from your PhonePe merchant dashboard
const PHONEPE_HOST = process.env.PHONEPE_HOST || 'https://api.phonepe.com/apis/hermes';
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'YOUR_MERCHANT_ID';
const SALT_KEY = process.env.PHONEPE_SALT_KEY || 'YOUR_SALT_KEY';
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5002/api/payments/phonepe-callback';

// Regular payments endpoint (for COD, etc.)
app.post('/payments', jwtVerifyMiddleware, checkRoleMiddleware, async (req, res) => {
  try {
    const { orderId, paymentMode, amount, status, transactionId } = req.body;
    
    // Update the order with payment information
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        paymentStatus: status,
        paymentMode: paymentMode,
        transactionId: transactionId || `TXN${Date.now()}`
      },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    return res.status(200).json({
      success: true,
      orderId: updatedOrder._id,
      transactionId: updatedOrder.transactionId,
      paymentStatus: updatedOrder.paymentStatus
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return res.status(500).json({ message: "Payment processing failed", error: error.message });
  }
});

// PhonePe payment initiation
app.post('/payments/initiate-phonepe',jwtVerifyMiddleware, checkRoleMiddleware, async (req, res) => {
  try {
    const { orderId, amount, customerName, customerPhone, customerEmail, redirectUrl } = req.body;
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Create a unique transaction ID
    const merchantTransactionId = `TXN_${Date.now()}_${orderId.slice(-6)}`;
    
    // Create payload for PhonePe
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: `MUID_${order.userId || req.user.id || Date.now()}`,
      amount: parseInt(parseFloat(amount) * 100), // Convert to paise
      redirectUrl: redirectUrl || `${process.env.FRONTEND_URL}/order-confirmation/${orderId}`,
      redirectMode: "REDIRECT",
      callbackUrl: CALLBACK_URL,
      mobileNumber: customerPhone,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };
    
    const payloadString = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadString).toString('base64');
    
    // Generate checksum
    const string = `${payloadBase64}/pg/v1/pay${SALT_KEY}`;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = `${sha256}###${SALT_INDEX}`;
    
    // Call PhonePe API
    const response = await axios.post(
      `${PHONEPE_HOST}/pg/v1/pay`,
      {
        request: payloadBase64
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      }
    );
    
    // Save transaction details to order
    await Order.findByIdAndUpdate(orderId, {
      transactionId: merchantTransactionId,
      paymentMode: "PhonePe",
      paymentStatus: "processing"
    });
    
    if (response.data.success) {
      return res.status(200).json({
        success: true,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId
      });
    } else {
      throw new Error(response.data.message || "Payment initialization failed");
    }
    
  } catch (error) {
    console.error("PhonePe payment initiation error:", error);
    return res.status(500).json({ 
      message: "Payment initialization failed", 
      error: error.response?.data?.message || error.message 
    });
  }
});

// PhonePe payment verification
app.post('/payments/verify-phonepe',jwtVerifyMiddleware, checkRoleMiddleware, async (req, res) => {
  try {
    const { orderId, transactionId, providerReferenceId } = req.body;
    
    // Verify the payment status with PhonePe
    const string = `/pg/v1/status/${MERCHANT_ID}/${transactionId}${SALT_KEY}`;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = `${sha256}###${SALT_INDEX}`;
    
    const response = await axios.get(
      `${PHONEPE_HOST}/pg/v1/status/${MERCHANT_ID}/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': MERCHANT_ID
        }
      }
    );
    
    if (response.data.success && 
        response.data.data.state === "COMPLETED" && 
        response.data.data.responseCode === "SUCCESS") {
      
      // Update the order with payment information
      await Order.findByIdAndUpdate(
        orderId,
        { 
          paymentStatus: "paid",
          paymentMode: "PhonePe",
          transactionId: transactionId,
          providerReferenceId: providerReferenceId || response.data.data.providerReferenceId
        }
      );
      
      return res.status(200).json({
        status: "success",
        message: "Payment verified successfully"
      });
    } else {
      // Payment failed or is pending
      await Order.findByIdAndUpdate(
        orderId,
        { 
          paymentStatus: "failed",
          paymentMode: "PhonePe",
          transactionId: transactionId
        }
      );
      
      return res.status(400).json({
        status: "failed",
        message: "Payment verification failed"
      });
    }
    
  } catch (error) {
    console.error("PhonePe payment verification error:", error);
    return res.status(500).json({ 
      status: "error",
      message: "Payment verification error", 
      error: error.response?.data?.message || error.message 
    });
  }
});

// PhonePe callback endpoint (will be called by PhonePe after payment)
app.post('/payments/phonepe-callback', async (req, res) => {
  try {
    const { transactionId, merchantId, merchantTransactionId, amount, paymentState, paymentInstrument } = req.body;
    
    // Verify the payment status
    if (paymentState === "COMPLETED") {
      // Find the order by transaction ID
      const order = await Order.findOne({ transactionId: merchantTransactionId });
      
      if (order) {
        // Update order payment status
        await Order.findByIdAndUpdate(
          order._id,
          { 
            paymentStatus: "paid",
            paymentMode: "PhonePe",
            transactionId: merchantTransactionId,
            providerReferenceId: paymentInstrument.providerReferenceId
          }
        );
      }
    }
    
    // Always return success to PhonePe
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error("PhonePe callback error:", error);
    // Always return success to PhonePe
    return res.status(200).json({ success: true });
  }
});

// Get all payments (admin only) - you might want to keep this from your first implementation
app.get('/payments', jwtVerifyMiddleware, checkRoleMiddleware, async (req, res) => {
  try {
    // Check if user is admin (implement your admin check)
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Fetch orders with payment information
    const orders = await Order.find().sort({ createdAt: -1 });
    const paymentData = orders.map(order => ({
      orderId: order._id,
      amount: order.totalAmount,
      paymentMode: order.paymentMode,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));
    
    res.status(200).json(paymentData);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Get payments by order ID
app.get('/payments/order/:orderId', jwtVerifyMiddleware, checkRoleMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'No payment found for this order' });
    }
    
    const paymentData = {
      orderId: order._id,
      amount: order.totalAmount,
      paymentMode: order.paymentMode,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    res.status(200).json(paymentData);
  } catch (error) {
    console.error('Error fetching order payment:', error);
    res.status(500).json({ message: 'Error fetching order payment', error: error.message });
  }
});
// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve Static Files for Image Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

app.get("/orders/tracking/:id", jwtVerifyMiddleware, async (req, res) => {
  try {
    const { id: orderId } = req.params;
    
    // Validate the orderId before querying
    if (!orderId || orderId === 'undefined' || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    // Now that we know orderId is valid, perform the query
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Prepare tracking data using existing model structure
    const trackingData = {
      status: order.status,
      timeline: order.timeline.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
    
    res.json(trackingData);
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    res.status(500).json({ error: 'Failed to fetch order tracking information' });
  }
});

// Health Check Route
app.get("/health", (req, res) => {
  return responder(res, true, "Server is running");
});

// Auth Routes
app.post("/signup", postSignup);
app.post("/login", postLogin);

// Product Routes
app.post("/products", jwtVerifyMiddleware, checkRoleMiddleware, postProducts);
app.get("/products", getProducts);

// Orders Routes
app.post("/orders", jwtVerifyMiddleware, postOrders);
app.put("/orders/:id", jwtVerifyMiddleware, putOrders);
app.get("/orders/:id", jwtVerifyMiddleware, getOrderById);
app.get("/orders/user/:id", jwtVerifyMiddleware, getOrdersByUserId);

// Payment Routes
app.post("/payments", postPayments);

// Image Upload Route
app.post("/upload", uploadMiddleware, uploadImage);

// Handle Invalid Routes
app.use("*", (req, res) => {
  return responder(res, false, "API endpoint doesn't exist", null, 404);
});

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
