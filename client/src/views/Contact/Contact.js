import React, { useState } from 'react';
import './Contact.css';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div>
      <Header />
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Krushivrund Farm</h1>
          <p>We're here to connect, answer your questions, and share our passion for fresh, organic produce.</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-section">
              <h2>Get in Touch</h2>
              <div className="contact-details">
                <div className="detail-item">
                  <span className="icon">📍</span>
                  <p>Krushivrund Farm, Karanjgaone, Nashik</p>
                </div>
                <div className="detail-item">
                  <span className="icon">📞 :</span>
                  <p>
                    <a href="tel:+918530722395">+91 8530722395</a>
                  </p>
                </div>
                <div className="detail-item">
                  <span className="icon">📧 :</span>
                  <p>
                    <a href="mailto:contact@krushivrundfarm.com">contact@krushivrundfarm.com</a>
                  </p>
                </div>

              </div>
            </div>

            <div className="business-hours">
              <h2>Business Hours</h2>
              <p>Monday to Sunday: 9:00 AM – 6:00 PM</p>
            </div>

            <div className="social-media">
              <h2>Follow Us</h2>
              <div className="social-links">
                <a href="https://www.instagram.com/krushivrundfarm?igsh=MTU2NDEyczR2ZmN0aw==" className="social-icon"><Instagram size={24} /> Instagram</a>
                <a href="https://www.facebook.com/krushivrundfarm" className="social-icon"><Facebook size={24} /> Facebook</a>
                <a href="https://x.com/krushivrunfarm" className="social-icon"><Twitter size={24} /> Twitter</a>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;