import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';  // Import both Firestore and Firebase Auth
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const SeeData = () => {
  const [userData, setUserData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [userId, setUserId] = useState('');

  // Hardcoded table headers for username and password
  const tableHeaders = ['Username', 'Password'];

  // Fetch user-specific data from Firestore
  const fetchData = async (userId) => {
    try {
      console.log('Fetching data for userId:', userId);  // Log for debugging
      const q = query(collection(db, 'submissions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      console.log('Fetched data:', data);  // Log fetched data
      setUserData(data);  // Update state with fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);  // Ensure loading is stopped even if fetch fails
    }
  };

  // Delete document from Firestore
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'submissions', id));
      setUserData(userData.filter((item) => item.id !== id));  // Update local state
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  // Fetch the authenticated user's ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User authenticated with ID:', user.uid);  // Log user ID
        setUserId(user.uid);  // Set userId from Firebase Auth
        fetchData(user.uid);  // Fetch data for this user
      } else {
        console.error('No user is logged in');
      }
    });

    return () => unsubscribe();  // Cleanup listener on component unmount
  }, []);

  return (
    <div className="border p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Your Data</h2>

      {/* Loading or Data Table */}
      {loadingData ? (
        <p className="mt-4">Loading data...</p>
      ) : userData.length > 0 ? (
        <table className="min-w-full mt-4 bg-white border border-gray-300">
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index} className="px-4 py-2 border">
                  {header}
                </th>
              ))}
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((data) => (
              <tr key={data.id}>
                {/* Only showing the username and password */}
                <td className="px-4 py-2 border">{data.username || 'N/A'}</td>
                <td className="px-4 py-2 border">{data.password || 'N/A'}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDelete(data.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4">No data found for this user.</p>
      )}
    </div>
  );
};

export default SeeData;
