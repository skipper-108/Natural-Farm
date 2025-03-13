import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Navigation
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ✅ Navigation Hook

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://krushivrundfarm.onrender.com/products");
        const result = await response.json();
        console.log("API Response:", result); // Debugging

        if (result.success && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || []; // ✅ Retrieve cart
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1; // ✅ Increase quantity if exists
    } else {
      cart.push({ ...product, quantity: 1 }); // ✅ Add new product
    }

    localStorage.setItem("cart", JSON.stringify(cart)); // ✅ Store in localStorage
    navigate("/cart"); // ✅ Redirect to cart page
  };

  if (loading) return <p className="loading">Loading products...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <Header />
      <div className="products-hero">
        <h1>Our Products</h1>
        <p>Premium Quality Grapes and Raisins from Krushivrund Farm</p>
      </div>
      <div className="products-container">
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <img
                  src={`https://krushivrundfarm.onrender.com${product.images}`}
                  alt={product.name}
                  className="product-image"
                />
                <h2 className="product-name">{product.name}</h2>
                <p className="product-description">{product.shortDescription}</p>
                <p className="product-price">Price: ₹{product.price}</p>
                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-products">No products available.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;
