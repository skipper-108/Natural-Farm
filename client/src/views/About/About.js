import React from 'react';
import {Link} from 'react-router-dom'
import { Target, Leaf, Sun, Award, } from 'lucide-react';
import './About.css';
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"

const HeroSection = () => (
  <div className="about-hero">
    <div className="about-hero-content">
      <h1>About Krushivrund Farm</h1>
      <p>Where Quality Meets Nature</p>
    </div>
  </div>
);

const OurStorySection = () => (
  <div className="our-story-section">
    <div className="story-content">
      <h2>Our Story</h2>
      <p>
        Krushivrund Farm began with a simple vision: to grow the best grapes and raisins using sustainable and eco-friendly farming practices. What started as a small vineyard has grown into a testament to our commitment to quality, freshness, and environmental stewardship.
      </p>
    </div>
  </div>
);

const ValueCard = ({ icon: Icon, title, description }) => (
  <div className="value-card">
    <div className="value-icon">
      <Icon size={48} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const ValuesSection = () => {
  const values = [
    {
      icon: Award,
      title: "Quality",
      description: "Hand-picked grapes at peak ripeness, ensuring the best taste and texture."
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Eco-friendly farming practices that minimize environmental impact."
    },
    {
      icon: Sun,
      title: "Freshness",
      description: "Farm-to-table approach, delivering produce at its absolute best."
    },
    {
      icon: Target,
      title: "Transparency",
      description: "Open about our farming practices, inviting customers to learn more."
    }
  ];

  return (
    <div className="values-section">
      <h2>Our Core Values</h2>
      <div className="values-grid">
        {values.map((value, index) => (
          <ValueCard
            key={index}
            icon={value.icon}
            title={value.title}
            description={value.description}
          />
        ))}
      </div>
    </div>
  );
};

const ProductsSection = () => {
  const products = [
    {
      title: "Fresh Grapes",
      description: "Sweet, juicy grapes perfect for snacking or cooking."
    },
    {
      title: "Natural Raisins",
      description: "Sun-dried, preservative-free raisins rich in flavor and nutrients."
    },
    {
      title: "Raisin Bars",
      description: "Wholesome energy bars packed with natural goodness."
    }
  ];

  return (
      <div className="products-section">
        <h2>What We Offer</h2>
        <div className="products-grid">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <h3>{product.title}</h3>
              <p>{product.description}</p>
            </div>
          ))}
        </div>
      </div>
  );
};

const CTASection = () => (
  <div className="cta-section">
    <h2>Join Our Journey</h2>
    <p>Discover sustainable agriculture and premium produce</p>
    <Link to='/products'>
    <button className="cta-button">Explore Our Products</button>
    </Link>
  </div>
);

const About = () => {
  return (
    <div>
      <Header/>
    <div className="about-page">
      <HeroSection />
      <OurStorySection />
      <ValuesSection />
      <ProductsSection />
      <CTASection />
    </div>
    <Footer/>
    </div>
  );
};

export default About;