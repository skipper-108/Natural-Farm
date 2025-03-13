import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import './Home.css';
import Header from "../../components/Header/Header"
import AboutFarm from "../../components/Aboutfarm/Aboutfarm"
import FarmFeatures from '../../components/FarmFeatures/FarmFeatures';
import Offers from "../../components/Offers/Offers"
import Footer from "../../components/Footer/Footer"

// Import images
import one from "../../Assets/Images/img1.jpg";
import two from "../../Assets/Images/img2.jpg";
import three from "../../Assets/Images/img10.jpg";
import four from "../../Assets/Images/five.avif";
import five from "../../Assets/Images/img9.jpg";

const AdvancedSlider = () => {
  const images = [five, three, one, four];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(nextSlide, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
  
      <div className="advanced-slider">
        <div
          className="slider-image"
          style={{ backgroundImage: `url(${images[currentIndex]})` }}
        >
          <div className="slider-overlay">
            <div className="slider-content">
              <h1>Nurturing Health Naturally</h1>
              <p>From Farm to Your Table</p>
            </div>
            <div className="slider-controls">
              <div className="slider-dots">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
              <button
                className="play-pause-btn"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div>
      <Header/>
    <div className="home-page-container">
      <div className="home-hero">
        <div className="home-info">
          <h1 className="home-title">Welcome to Krushivrund Farm</h1>
          <p className="home-description">
            At Krushivrund Farm, we are committed to bringing you the freshest, highest-quality produce straight from our fields to your table. Located in the heart of nature, our farm thrives on sustainable farming practices, ensuring that every product we offer is not only nutritious but also grown with care for the environment.
          </p>
          <div className="home-highlights">
            <div className="highlight-item">
              <div className="highlight-icon">🌱</div>
              <span>Organic Farming</span>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon">🚜</div>
              <span>Sustainable Practices</span>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon">🍇</div>
              <span>Quality Produce</span>
            </div>
          </div>
        </div>
        <div className="home-slider">
          <AdvancedSlider />
        </div>
      </div>
    </div>
    <AboutFarm/>
    <Offers/>
    <FarmFeatures/>
    <Footer/>
    </div>
  );
};

export default Home;