import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./CheckOut.css";

const Checkout = () => {
  const { orderId } = useParams();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash On Delivery");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setError("Please login to continue with checkout");
    } else {
      setIsAuthenticated(true);

      // Load cart data
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(storedCart);
      calculateTotal(storedCart);
    }
  }, []);

  const calculateTotal = (cartItems) => {
    const sum = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(sum);
  };

  const handleLogin = () => {
    // Redirect to login page and store the current URL to redirect back after login
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/account");
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Check again if user is logged in
    if (!localStorage.getItem("token")) {
      setError("Please login to place an order");
      return;
    }

    // Form validation
    if (!deliveryAddress.trim()) {
      setError("Please enter a delivery address");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter a phone number");
      return;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    // Format cart items for the API
    const orderItems = cart.map(item => ({
      productId: item._id,
      quantity: item.quantity,
      price: item.price
    }));

    // Create the order payload
    const orderData = {
      products: orderItems,
      deliveryAddress: deliveryAddress,
      phone: phone,
      paymentMode: paymentMode
    };

    try {
      const response = await fetch("https://krushivrundfarm.onrender.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Your session has expired. Please login again.");
        }
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();
      console.log("Order API Response:", data);

      // Extract the correct order ID
      const orderId = data.data?._id;

      if (orderId) {
        // Save order details in localStorage before navigation
        localStorage.setItem("orderDetails", JSON.stringify({
          _id: orderId,
          products: cart,
          deliveryAddress: deliveryAddress,
          phone: phone,
          paymentMode: paymentMode,
          paymentStatus: "pending",
          createdAt: new Date().toISOString()
        }));

        // Clear cart after successful order
        localStorage.removeItem("cart");
        
        navigate(`/order-confirmation/${orderId}`);
      } else {
        throw new Error("Order ID is missing. Cannot navigate.");
      }

    } catch (error) {
      console.error("Error creating order:", error);
      setError(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <Header />

      <div className="checkout-hero">
        <div className="checkout-hero-content">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>
      </div>

      <div className="checkout-main">
        {!isAuthenticated ? (
          <div className="login-prompt">
            <h2>Authentication Required</h2>
            <p>You need to be logged in to complete your purchase.</p>
            <button onClick={handleLogin} className="login-btn">
              Login to Continue
            </button>
          </div>
        ) : (
          <>
            <div className="checkout-form-container">
              <form onSubmit={handleSubmitOrder} className="checkout-form">
                <h2>Shipping Information</h2>

                <div className="form-group">
                  <label htmlFor="deliveryAddress">Delivery Address</label>
                  <textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="paymentMode">Payment Method</label>
                  <select
                    id="paymentMode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="Cash On Delivery">Cash On Delivery</option>
                    <option value="Online Payment" disabled>Online Payment (Coming Soon)</option>
                    </select>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                  type="submit"
                  className="place-order-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Place Order"}
                </button>
              </form>
            </div>

            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="order-items">
                {cart.length === 0 ? (
                  <p className="empty-cart-message">Your cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item._id} className="order-item">
                      <div className="item-info">
                        <img
                          src={`https://krushivrundfarm.onrender.com${item.images}`}
                          alt={item.name}
                          className="item-image"
                        />
                        <div>
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="divider"></div>

              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;