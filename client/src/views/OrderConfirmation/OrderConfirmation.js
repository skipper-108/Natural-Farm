import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, paid, failed
  const [paymentMethod, setPaymentMethod] = useState("credit card");
  const [transactionId, setTransactionId] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      console.log("Order ID:", orderId);
      try {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please log in to view order details.");
          setLoading(false);
          return;
        }

        // First try to get the data from localStorage
        const localOrderDetails = localStorage.getItem("orderDetails");

        if (localOrderDetails) {
          const parsedData = JSON.parse(localOrderDetails);

          // Check if the localStorage data matches the current order ID
          if (parsedData._id === orderId) {
            console.log("Using order details from localStorage");
            setOrder(parsedData);

            // Check if payment is already completed for this order
            if (parsedData.paymentStatus === "paid") {
              setPaymentStatus("paid");
              setPaymentMethod(parsedData.paymentMode || "credit card");
              setTransactionId(parsedData.transactionId || "");
            } else {
              setPaymentStatus("pending");
              setPaymentMethod(parsedData.paymentMode || "credit card");
            }

            setLoading(false);
            return;
          }
        }

        // If localStorage doesn't have the data or doesn't match, fetch from API
        console.log("Fetching order details from API");
        const response = await fetch(`https://krushivrundfarm.onrender.com/orders/${orderId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data);

        // Check if payment is already completed for this order
        if (data.paymentStatus === "paid") {
          setPaymentStatus("paid");
          setPaymentMethod(data.paymentMode || "credit card");
          setTransactionId(data.transactionId || "");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Could not load your order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    } else {
      setError("Order ID is missing. Please try again.");
      setLoading(false);
    }

    // Set up the PhonePe callback handler
    window.onPhonePeResponse = function (response) {
      if (response && response.status === "SUCCESS") {
        handlePaymentSuccess({
          paymentId: response.transactionId,
          providerReferenceId: response.providerReferenceId
        });
      } else {
        setPaymentStatus("failed");
        setError("Payment failed. Please try again.");
        setProcessingPayment(false);
      }
    };
  }, [orderId]);

  // Process payments differently based on payment method
  const processPayment = async () => {
    setProcessingPayment(true);
    setPaymentStatus("processing");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in to complete payment.");
      }

      const orderAmount = order?.products.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

      // Handle Cash on Delivery separately
      // In the processPayment function
      if (paymentMethod === "Cash On Delivery") {
        try {
          // Log for debugging
          console.log("Processing COD order:", orderId);

          const response = await updateOrderStatus({
            orderId: orderId,
            paymentMode: "Cash On Delivery",
            amount: orderAmount,
            status: "pending", // COD payment is pending until delivery
            transactionId: `COD${Date.now()}`
          });

          console.log("COD order update response:", response);

          setPaymentStatus("pending");
          setTransactionId(`COD${Date.now()}`);
          updateLocalStorageOrder({
            paymentStatus: "pending",
            paymentMode: "Cash On Delivery",
            transactionId: `COD${Date.now()}`
          });
        } catch (error) {
          console.error("Error processing COD order:", error);
          setError("Failed to place your order. Please try again.");
          setPaymentStatus("failed");
        }

        return;
      }
      // For online payments using PhonePe or UPI methods

      // Prepare payment data for backend
      const paymentData = {
        orderId: orderId,
        paymentMode: paymentMethod,
        amount: orderAmount,
        status: "processing",
        redirectUrl: window.location.href, // Current page URL for redirect after payment
        customerName: order?.customerName || "Customer",
        customerEmail: order?.email || "",
        customerPhone: order?.phone || ""
      };

      // Call your backend to initialize PhonePe payment
      const response = await fetch("https://krushivrundfarm.onrender.com/payments/initiate-phonepe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error("Payment initialization failed");
      }

      const paymentResponse = await response.json();

      // Redirect to PhonePe payment page
      if (paymentResponse.paymentUrl) {
        // Option 1: Redirect to PhonePe payment page
        window.location.href = paymentResponse.paymentUrl;

        // Option 2: Open PhonePe in a new window
        // window.open(paymentResponse.paymentUrl, 'phonepePayment', 'width=400,height=600');
      } else {
        throw new Error("No payment URL received from server");
      }

    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      setError("Payment processing failed. Please try again.");
      setProcessingPayment(false);
    }
  };

  // Handle successful payment (would be called by PhonePe callback)
  const handlePaymentSuccess = async (response) => {
    try {
      const token = localStorage.getItem("token");

      // Verify the payment with your backend
      const verifyResponse = await fetch("https://krushivrundfarm.onrender.com/payments/verify-phonepe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderId,
          transactionId: response.paymentId,
          providerReferenceId: response.providerReferenceId
        })
      });

      if (!verifyResponse.ok) {
        throw new Error("Payment verification failed");
      }

      const verificationData = await verifyResponse.json();

      if (verificationData.status === "success") {
        // Update the order status in your backend
        const paymentUpdateData = {
          orderId: orderId,
          paymentMode: paymentMethod,
          amount: order?.products.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
          status: "paid",
          transactionId: response.paymentId
        };

        await updateOrderStatus(paymentUpdateData);

        // Update local state
        setPaymentStatus("paid");
        setTransactionId(response.paymentId);

        // Update localStorage
        updateLocalStorageOrder({
          paymentStatus: "paid",
          paymentMode: paymentMethod,
          transactionId: response.paymentId
        });
      } else {
        throw new Error("Payment verification failed");
      }

    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentStatus("failed");
      setError("Payment verification failed. Please contact customer support.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Helper function to update order status in backend
  const updateOrderStatus = async (paymentData) => {
    try {
      const token = localStorage.getItem("token");

      // Add more logging
      console.log("Updating order status with data:", paymentData);

      const updateResponse = await fetch(`https://krushivrundfarm.onrender.com/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentStatus: paymentData.status,
          paymentMode: paymentData.paymentMode,
          transactionId: paymentData.transactionId
        })
      });

      if (!updateResponse.ok) {
        console.error("Order status update failed with status:", updateResponse.status);
        const errorText = await updateResponse.text();
        console.error("Error response:", errorText);
        throw new Error("Order status update failed");
      }

      const responseData = await updateResponse.json();
      console.log("Order status updated successfully:", responseData);
      return responseData;

    } catch (error) {
      console.error("Error updating order after payment:", error);
      throw error; // Re-throw to handle in the caller function
    }
  };
  // Helper function to update order in localStorage
  const updateLocalStorageOrder = (updates) => {
    const localOrderDetails = localStorage.getItem("orderDetails");
    if (localOrderDetails) {
      const parsedData = JSON.parse(localOrderDetails);
      const updatedOrderData = {
        ...parsedData,
        ...updates
      };
      localStorage.setItem("orderDetails", JSON.stringify(updatedOrderData));
    }
  };

  const navigateToMyOrders = () => {
    // Uses the new API endpoint pattern for user orders
    navigate("/account/orders");
  };

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation-page">
        <Header />
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          {error.includes("Authentication") ? (
            <button onClick={() => navigate("/login")} className="login-btn">Login</button>
          ) : (
            <Link to="/" className="back-home-btn">Back to Home</Link>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <Header />

      <div className="confirmation-container">
        {paymentStatus === "paid" ? (
          <div className="success-icon">
            <svg viewBox="0 0 24 24" width="60" height="60">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        ) : paymentStatus === "pending" && paymentMethod === "Cash On Delivery" ? (
          <div className="pending-icon">
            <svg viewBox="0 0 24 24" width="60" height="60">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
        ) : (
          <div className="payment-pending-icon">
            <svg viewBox="0 0 24 24" width="60" height="60">
              <path fill="currentColor" d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2V7z" />
            </svg>
          </div>
        )}

        <h1>
          {paymentStatus === "paid"
            ? "Payment Successful!"
            : paymentStatus === "pending" && paymentMethod === "Cash On Delivery"
              ? "Order Confirmed!"
              : "Complete Your Payment"}
        </h1>

        <p className="order-id">Order ID: #{orderId}</p>

        {paymentStatus === "paid" ? (
          <p className="thank-you-message">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        ) : paymentStatus === "pending" && paymentMethod === "Cash On Delivery" ? (
          <p className="cod-message">
            Thank you for your order. You will pay at the time of delivery.
          </p>
        ) : (
          <p className="payment-message">
            Please complete your payment to finish your order.
          </p>
        )}

        <div className="order-details">
          <h2>Order Details</h2>

          <div className="order-info-section">
            <div className="order-info-row">
              <span className="info-label">Order Date:</span>
              <span className="info-value">{new Date(order?.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="order-info-row">
              <span className="info-label">Payment Method:</span>
              <span className="info-value">
                {paymentStatus === "paid" || (paymentStatus === "pending" && paymentMethod === "Cash On Delivery") ?
                  paymentMethod :
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={processingPayment}
                  >
                    <option value="Cash On Delivery">Cash On Delivery</option>
                    <option value="credit card">Credit Card</option>
                    <option value="debit card">Debit Card</option>
                    <option value="upi">UPI / PhonePe</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                }
              </span>
            </div>
            <div className="order-info-row">
              <span className="info-label">Payment Status:</span>
              <span className="info-value">
                {paymentStatus === "paid" ? "Paid" :
                  paymentStatus === "pending" && paymentMethod === "Cash On Delivery" ?
                    "Pay on Delivery" : "Pending"}
              </span>
            </div>
            {(paymentStatus === "paid" || (paymentStatus === "pending" && paymentMethod === "Cash On Delivery")) && (
              <div className="order-info-row">
                <span className="info-label">Transaction ID:</span>
                <span className="info-value">{transactionId}</span>
              </div>
            )}
            <div className="order-info-row">
              <span className="info-label">Delivery Address:</span>
              <span className="info-value">{order?.deliveryAddress}</span>
            </div>
            <div className="order-info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{order?.phone}</span>
            </div>
          </div>

          <h3>Items</h3>
          {(order?.products ?? []).length > 0 ? (
            order.products.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <div className="item-details">
                    <h4>{item.name || `Product ID: ${item.productId}`}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))
          ) : (
            <p>No items in the order.</p>
          )}

          <div className="order-summary">
            <div className="summary-row">
              <span>Total:</span>
              <span>
                ₹{order?.products?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>

        {paymentStatus === "paid" || (paymentStatus === "pending" && paymentMethod === "Cash On Delivery") ? (
          <div className="action-buttons">
            <Link to="/products" className="continue-shopping-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="payment-section">
            {paymentStatus === "failed" && (
              <div className="payment-error">
                <p>Payment failed. Please try again or choose a different payment method.</p>
              </div>
            )}

            <button
              className={`pay-now-btn ${processingPayment ? 'processing' : ''}`}
              onClick={processPayment}
              disabled={processingPayment}
            >
              {processingPayment ? 'Processing Payment...' :
                paymentMethod === "Cash On Delivery" ? 'Confirm Order' :
                  paymentMethod === "upi" ? 'Pay with PhonePe' : 'Pay Now'}
            </button>

            {paymentMethod === "upi" && (
              <div className="payment-options">
                <img src="/images/phonepe-logo.png" alt="PhonePe" className="payment-option-logo" />
              </div>
            )}

            <p className="secure-payment-note">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
              </svg>
              {paymentMethod === "Cash On Delivery" ? 'Safe & Secure Ordering' : 'Secure Payment Processing'}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;