import React, { useState, useEffect } from 'react';
import './Slider.css';

import one from "../../Assets/Images/img1.jpg"
import two from "../../Assets/Images/img2.jpg"
import three from "../../Assets/Images/three.avif"
import four from "../../Assets/Images/five.avif"

const Slider = () => {
  const images = [one, two, three,four];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000); // Change image every 3 seconds
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  return (
    <div className="slider">
      <div
        className="slider-background"
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
      >
        <div className="tagline">
          <h2>Nurturing Health Naturally-From Farm to Your Table</h2>
        </div>
      </div>
    </div>
  );
};

export default Slider;
