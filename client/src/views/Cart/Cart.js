import { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    calculateTotal(storedCart);
  }, []);

  const calculateTotal = (cartItems) => {
    const sum = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(sum);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  }; // Missing closing brace was here
  
  const goToCheckout = () => {
    navigate("/checkout");
  }; 

  return (
    <div className="cart-page">
      <Header />
      
      <div className="cart-hero">
        <div className="cart-hero-content">
          <h1>Your Shopping Cart</h1>
          <p>Review your items and proceed to checkout</p>
        </div>
      </div>

      <div className="cart-main">
        {cart.length > 0 ? (
          <>
            <div className="cart-items-container">
              <div className="cart-header">
                <span className="header-product">Product</span>
                <span className="header-price">Price</span>
                <span className="header-quantity">Quantity</span>
                <span className="header-total">Total</span>
                <span className="header-actions">Actions</span>
              </div>
              
              {cart.map((product) => (
                <div key={product._id} className="cart-item">
                  <div className="product-info">
                    <img
                      src={`http://localhost:5002${product.images}`}
                      alt={product.name}
                      className="cart-image"
                    />
                    <div className="product-details">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.shortDescription}</p>
                    </div>
                  </div>
                  
                  <div className="product-price">₹{product.price}</div>
                  
                  <div className="quantity-control">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(product._id, product.quantity - 1)}
                      disabled={product.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="quantity-value">{product.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(product._id, product.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="item-total">
                    ₹{(product.price * product.quantity).toFixed(2)}
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <h2>Order Summary</h2>
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
                <span>₹{(total).toFixed(2)}</span>
              </div>
              <button className="checkout-btn"  onClick={goToCheckout} >Proceed to Checkout</button>
              <button className="continue-shopping">Continue Shopping</button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <div className="empty-cart-content">
              <svg className="empty-cart-icon" width="100" height="100" viewBox="0 0 24 24">
                <path d="M16 6v2h2v10H6V8h2V6H4v14h16V6h-4z" />
                <path d="M12 0L8 4h3v8h2V4h3L12 0z" />
              </svg>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any items to your cart yet.</p>
              <button className="start-shopping-btn">Start Shopping</button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;