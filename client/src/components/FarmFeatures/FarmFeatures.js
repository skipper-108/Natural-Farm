import React from 'react';
import { Heart, Leaf, Sun, Truck } from 'lucide-react';
import './features.css';

const FarmFeatures = () => {
  const features = [
    {
      icon: <Heart color="tomato" size={48} />,
      title: "Unmatched Quality",
      description: "Hand-picked grapes at peak ripeness, ensuring exceptional sweetness and flavor in every bite."
    },
    {
      icon: <Sun color="#eab308" size={48} />,
      title: "Naturally Sun-Dried Raisins",
      description: "Traditional sun-drying methods preserve the natural taste and nutrients of our raisins."
    },
    {
      icon: <Leaf color="#059669" size={48} />,
      title: "Sustainable Farming",
      description: "Eco-friendly methods ensure our grapes and raisins are free from harmful chemicals."
    },
    {
      icon: <Truck color="#3b82f6" size={48} />,
      title: "Farm-to-Table Freshness",
      description: "Direct from our vineyards to your table, guaranteeing the freshest produce."
    }
  ];

  return (
    <div className="farm-features-container">
      <div className="text-center mb-12">
        <h2 className="farm-features-title">Why Choose Krushivrund Farm</h2>
        <p className="farm-features-subtitle">
          Discover the exceptional quality and care behind our premium grapes and raisins
        </p>
      </div>
      <div className="farm-features-grid">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="farm-feature-card"
          >
            <div className="flex justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="farm-feature-title">{feature.title}</h3>
            <p className="farm-feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmFeatures;