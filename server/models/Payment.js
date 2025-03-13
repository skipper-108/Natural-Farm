import {model, Schema} from "mongoose"; 

const paymentSchema = new Schema({
    orderId: { 
        type: Schema.Types.ObjectId,  
        ref: "Order",  
        required: true,
    },
    paymentMode: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "pending",
        enum: ["paid", "failed", "pending"],
    },
    razorpayOrderId: {
        type: String
      },
      razorpayPaymentId: {
        type: String
      },
      razorpaySignature: {
        type: String
      },
      notes: {
        type: String
      },
      refundAmount: {
        type: Number
      },
      refundReason: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
}, {
    timestamps: true,
});

const Payment = model("Payment", paymentSchema);

export default Payment;