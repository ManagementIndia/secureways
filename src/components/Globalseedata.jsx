import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Firestore import
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const GlobalSeeData = () => {
  const [allUserData, setAllUserData] = useState([]);
  const [allMedia, setAllMedia] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false); // Track authorization
  const [hasCheckedPassword, setHasCheckedPassword] = useState(false); // Track if password check is done

  const userTableHeaders = ['Username', 'Password', 'User ID', 'Actions'];
  const mediaTableHeaders = ['Media Type', 'Sender ID', 'Preview', 'Actions'];

  // Fetch all data from both submissions and images collections
  const fetchAllData = async () => {
    try {
      const submissionsSnapshot = await getDocs(collection(db, 'submissions'));
      const submissions = submissionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const imagesSnapshot = await getDocs(collection(db, 'images'));
      const mediaItems = imagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllUserData(submissions);
      setAllMedia(mediaItems); // Store all media items
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Delete document from Firestore
  const handleDelete = async (id, collectionName) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      if (collectionName === 'submissions') {
        setAllUserData(allUserData.filter((item) => item.id !== id));
      } else if (collectionName === 'images') {
        setAllMedia(allMedia.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  // Ask for the password when the component is first loaded (only once)
  useEffect(() => {
    const password = prompt('Please enter the password to view data:');
    if (password === '2580') {
      setIsAuthorized(true);
      fetchAllData(); // Fetch the data if the password is correct
    } else {
      alert('Incorrect password. Access denied.');
    }
    setHasCheckedPassword(true); // Mark that the password has been checked
  }, []);

  if (!hasCheckedPassword) {
    return null; // Return nothing until the password check is done
  }

  return (
    <div className="border p-4 rounded-lg shadow-sm">
      {!isAuthorized ? (
        <p className="text-center text-lg text-red-500">Unauthorized access.</p>
      ) : loadingData ? (
        <p>Loading data...</p>
      ) : (
        <>
          {/* Submissions Table */}
          {allUserData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">User Data</h3>
              <table className="min-w-full mt-4 bg-white border border-gray-300">
                <thead>
                  <tr>
                    {userTableHeaders.map((header, index) => (
                      <th key={index} className="px-4 py-2 border">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allUserData.map((data) => (
                    <tr key={data.id}>
                      <td className="px-4 py-2 border">{data.username ||data.email || 'N/A'}</td>
                      <td className="px-4 py-2 border">{data.password || 'N/A'}</td>
                      <td className="px-4 py-2 border">{data.userId || 'N/A'}</td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleDelete(data.id, 'submissions')}
                          className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition duration-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Media Table */}
          {allMedia.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Media Files</h3>
              <table className="min-w-full mt-4 bg-white border border-gray-300">
                <thead>
                  <tr>
                    {mediaTableHeaders.map((header, index) => (
                      <th key={index} className="px-4 py-2 border">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allMedia.map((media) => (
                    <tr key={media.id}>
                      <td className="px-4 py-2 border">
                        {media.mediaType || 'Unknown'}
                      </td>
                      <td className="px-4 py-2 border">{media.senderID || 'N/A'}</td>
                      <td className="px-4 py-2 border">
                        {media.mediaType.includes('image') ? (
                          <img
                            src={media.mediaURL}
                            alt="Media Preview"
                            className="w-24 h-24 object-cover mb-2" // Small image size
                          />
                        ) : (
                          <video
                            src={media.mediaURL}
                            controls
                            className="w-24 h-24 object-cover mb-2" // Small video size
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          onClick={() => handleDelete(media.id, 'images')}
                        >
                          Delete Media
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GlobalSeeData;
