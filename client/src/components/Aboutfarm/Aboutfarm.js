import React from 'react'
import { Link } from 'react-router-dom'
import { Target, Leaf, Gift, ArrowRight } from 'lucide-react'
import './Aboutfarm.css'

const AboutSection = ({ icon: Icon, title, description }) => {
  return (
    <div className="about-card">
      <div className="about-card-icon">
        <Icon size={48} className="icon" />
      </div>
      <h2 className="about-card-title">{title}</h2>
      <p className="about-card-description">{description}</p>
    </div>
  );
};

function Aboutfarm() {
  const aboutSections = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To nurture the land responsibly, grow quality crops, and provide our customers with farm-fresh products that promote health and well-being."
    },
    {
      icon: Leaf,
      title: "Our Values",
      description: "We follow eco-friendly practices to protect the environment for future generations. From planting to harvest, we ensure that every product meets the highest standards."
    },
    {
      icon: Gift,
      title: "What We Offer",
      description: "Fresh grapes and raisins grown with care. Hands-on knowledge about sustainable agriculture."
    }
  ];

  return (
    <div className="about-farm-container">
      <h1 className="section-title">About Krushivrund Farm</h1>
      
      <div className="about-cards-grid">
        {aboutSections.map((section, index) => (
          <AboutSection 
            key={index}
            icon={section.icon}
            title={section.title}
            description={section.description}
          />
        ))}
      </div>
      
      <div className="read-more-container">
        <Link to="/about" className="read-more-link">
          Read More About Us
          <ArrowRight className="link-arrow" />
        </Link>
      </div>
    </div>
  )
}

export default Aboutfarm