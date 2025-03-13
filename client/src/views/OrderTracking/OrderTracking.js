import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [orderTracking, setOrderTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status icons and descriptions
  const statusIcons = {
    'pending': '🕒',
    'processing': '🔄',
    'shipped': '🚚',
    'delivered': '✅',
    'cancelled': '❌'
  };

  const statusDescriptions = {
    'pending': 'Order is being processed',
    'processing': 'Preparing your order',
    'shipped': 'Order is on its way',
    'delivered': 'Order has been delivered',
    'cancelled': 'Order was cancelled'
  };

  useEffect(() => {
    const fetchOrderTracking = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5002/orders/tracking/${orderId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setOrderTracking(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Tracking fetch error:', err);
        
        if (err.response) {
          switch (err.response.status) {
            case 401:
              setError('Unauthorized. Please log in again.');
              break;
            case 404:
              setError('Order tracking information not found.');
              break;
            default:
              setError('Failed to fetch order tracking information.');
          }
        } else if (err.request) {
          setError('No response from server. Check your network connection.');
        } else {
          setError('Error setting up the request. Please try again.');
        }
        
        setLoading(false);
      }
    };

    fetchOrderTracking();
  }, [orderId]);

  if (loading) return <div>Loading tracking information...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-tracking-container">
      <h2>Order Tracking</h2>
      <div className="current-status">
        <h3>Current Status: {orderTracking.status.toUpperCase()}</h3>
        <p>{statusDescriptions[orderTracking.status]}</p>
      </div>

      <div className="tracking-timeline">
        {orderTracking.timeline.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-icon">
              {statusIcons[item.status] || '📍'}
            </div>
            <div className="timeline-content">
              <h4>{item.status.toUpperCase()}</h4>
              <p>{statusDescriptions[item.status] || 'Status update'}</p>
              <small>
                {new Date(item.date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTracking;