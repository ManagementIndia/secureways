import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'; // Ensure getDoc is imported
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

const ViewMedia = () => {
  const [mediaList, setMediaList] = useState([]);
  const currentUser = auth.currentUser;
  const navigate = useNavigate(); // To navigate back after deletion

  useEffect(() => {
    if (!currentUser) return;

    // Fetch all media where the current user is the receiver from the "images" collection
    const fetchMedia = async () => {
      const imagesRef = collection(db, 'images'); // Assuming you have an 'images' collection
      const q = query(
        imagesRef,
        where('receiverID', '==', currentUser.uid), // Only media for the current user
      );

      try {
        const querySnapshot = await getDocs(q);
        const mediaItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMediaList(mediaItems); // Store media items in state
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    fetchMedia();
  }, [currentUser]);

  // Function to handle media deletion (remove receiverID from the document)
  const handleDeleteMedia = async (mediaID) => {
    try {
      const mediaRef = doc(db, 'images', mediaID);
      const mediaDoc = await getDoc(mediaRef); // Ensure getDoc is used to retrieve the document

      if (mediaDoc.exists()) {
        const mediaData = mediaDoc.data();

        // Check if the current user is the receiver
        if (mediaData.receiverID === currentUser.uid) {
          // Remove the receiver ID from the document
          await updateDoc(mediaRef, {
            receiverID: null, // Clear the receiverID
          });

          // Remove the item from the mediaList state
          setMediaList(mediaList.filter(item => item.id !== mediaID));
          alert('Media access removed for this user.');
        }
      }
    } catch (error) {
      console.error('Error removing media access:', error);
      alert('Error removing media access.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Display current user's UID at the top */}
      <h3 className="text-xl font-semibold mb-2 text-center">
        Current User ID: {currentUser ? currentUser.uid : 'Loading...'}
      </h3>

      <h3 className="text-xl font-semibold mb-4 text-center">Received Media</h3>

      {mediaList.length === 0 ? (
        <p>No media available</p>
      ) : (
        mediaList.map((media) => (
          <div key={media.id} className="mb-4">
            <p className="text-sm">From: {media.senderID}</p>
            {media.mediaType.includes('image') ? (
              <img
                src={media.mediaURL}
                alt="Received Media"
                className="max-w-full h-auto mb-2"
              />
            ) : (
              <video
                src={media.mediaURL}
                controls
                className="max-w-full h-auto mb-2"
              />
            )}

            {/* Delete button to remove the user's access */}
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => handleDeleteMedia(media.id)}
            >
              Remove Access
            </button>
          </div>
        ))
      )}

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={() => navigate(-1)} // Navigate back
      >
        Back
      </button>
    </div>
  );
};

export default ViewMedia;
