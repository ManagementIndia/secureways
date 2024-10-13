import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore imports
import { getAuth } from 'firebase/auth';
import { useParams } from 'react-router-dom'; // Import useParams to get conversationID from URL
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase Storage for media

const db = getFirestore();
const storage = getStorage(); // Initialize Firebase storage
const auth = getAuth();

const MessageComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [media, setMedia] = useState(null); // State to handle media files
  const [uploadProgress, setUploadProgress] = useState(0); // State to track media upload progress
  const [sendProgress, setSendProgress] = useState(0); // State to track overall sending progress
  const [otherUser, setOtherUser] = useState(null); // State for storing other user's info
  const [loading, setLoading] = useState(true); // Loading state to handle async data fetching
  const [openMediaId, setOpenMediaId] = useState(null); // State to track opened media
  const [blackOverlay, setBlackOverlay] = useState(false); // State to simulate screen going black
  const { conversationID } = useParams(); // Get conversationID from URL params
  const currentUser = auth.currentUser;

  // Get the other user's UID by excluding the current user's UID from the participants
  const getOtherUserUID = (conversationID) => {
    const uids = conversationID.split('_');
    return uids.find(uid => uid !== currentUser.uid);
  };

  // Fetch the other user's data from Firestore
  const fetchOtherUserDetails = async (otherUserUID) => {
    try {
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserUID));
      if (otherUserDoc.exists()) {
        setOtherUser(otherUserDoc.data()); // Store other user's info
        setLoading(false); // Set loading to false after fetching user data
      } else {
        console.error('User not found in Firestore');
        setLoading(false); // Stop loading even if user not found
      }
    } catch (error) {
      console.error("Error fetching other user details:", error);
      setLoading(false); // Stop loading in case of error
    }
  };

  useEffect(() => {
    if (!conversationID || !currentUser) return;

    // Get other user's UID and fetch their details
    const otherUserUID = getOtherUserUID(conversationID);
    fetchOtherUserDetails(otherUserUID);

    // Query to fetch messages from Firestore in real-time and order by timestamp
    const messagesRef = collection(db, `conversations/${conversationID}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe(); // Unsubscribe from real-time listener when component unmounts
  }, [conversationID, currentUser]);

  // Function to handle media file upload to Firebase Storage with progress tracking
  const uploadMedia = (file) => {
    return new Promise((resolve, reject) => {
      const fileRef = storageRef(storage, `conversations/${conversationID}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Update progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Error uploading file:', error);
          reject(error);
        },
        async () => {
          // Handle successful uploads on complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !media) return; // Only proceed if there's text or media
  
    try {
      let mediaURL = '';
      if (media) {
        setSendProgress(50); // 50% progress before uploading media
        mediaURL = await uploadMedia(media); // Upload the media file
        setSendProgress(80); // 80% progress after media upload
      }
  
      // Add the message (with media if available) to Firestore
      const messageDocRef = await addDoc(collection(db, `conversations/${conversationID}/messages`), {
        fromUserID: currentUser.uid,
        toUserID: otherUser.uid,
        message: newMessage || '', // Include the message text
        mediaURL, // Media URL if uploaded
        mediaType: media ? media.type : '', // Store the media type (image/video)
        viewOnce: media ? true : false, // Mark media as "viewOnce"
        viewed: false, // Initially set viewed to false
        createdAt: serverTimestamp(),
      });
  
      // If media was sent, save it to the images collection with the receiver and sender info
      if (mediaURL) {
        await addDoc(collection(db, 'images'), {
          senderID: currentUser.uid, // ID of the user sending the media
          receiverID: otherUser.uid, // ID of the user receiving the media
          mediaURL, // Download URL of the media
          mediaType: media.type, // Type of media (image or video)
          createdAt: serverTimestamp(),
        });
      }
  
      setSendProgress(100); // Message fully sent
      setNewMessage(''); // Clear the input field after sending
      setMedia(null); // Clear the media file
      setUploadProgress(0); // Reset upload progress
      setTimeout(() => setSendProgress(0), 1000); // Reset send progress after a delay
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };
  

  // Function to mark media as viewed and prevent re-access
  const handleViewMedia = async (message) => {
    if (message.viewed) return; // If already viewed, do nothing

    // Mark media as viewed
    try {
      await updateDoc(doc(db, `conversations/${conversationID}/messages`, message.id), {
        viewed: true,
      });

      // Open media within the same page
      setOpenMediaId(message.id);

      // Set a timeout to close the media after 1 second
      setTimeout(() => {
        setOpenMediaId(null); // Close the media after 1 second
        alert('Media closed after 1 second.');
      }, 1000);

      // Simulate black screen for mobile on screenshot attempt
      const detectScreenshot = (event) => {
        if (event.key === 'PrintScreen' || (event.ctrlKey && event.key === 'p')) {
          setBlackOverlay(true); // Simulate black screen
          setTimeout(() => {
            setBlackOverlay(false); // Remove black screen after 1 second
            setOpenMediaId(null); // Close the media
            alert('Screenshot detected! Media closed.');
          }, 1000); // Black screen for 1 second before disappearing
        }
      };
      window.addEventListener('keydown', detectScreenshot);

      // Remove listener after closing the media
      return () => window.removeEventListener('keydown', detectScreenshot);
    } catch (error) {
      console.error('Error marking media as viewed:', error);
    }
  };

  // Function to display media messages (images/videos) with "view once" logic
  const displayMediaButton = (msg) => {
    if (msg.viewed) {
      return <p>This media was viewed and is no longer available.</p>;
    }

    return (
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        onClick={() => handleViewMedia(msg)}
      >
        Open Media
      </button>
    );
  };

  // Render loading state if still fetching user data
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative max-w-full mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 lg:max-w-4xl sm:max-w-md">
      {/* Black screen overlay */}
      {blackOverlay && (
        <div className="absolute inset-0 bg-black opacity-100 z-50"></div>
      )}

      <h3 className="text-xl font-semibold mb-4 text-center">
        {otherUser ? otherUser.username : 'Unknown User'}
      </h3>

      <div className="mb-4 h-64 border border-gray-300 p-4 overflow-y-auto">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded-lg max-w-xs ${
              msg.fromUserID === currentUser.uid ? 'ml-auto bg-green-100 text-right' : 'mr-auto bg-gray-100 text-left'
            }`}
          >
            <p className="text-sm">{msg.message}</p>
            {msg.mediaURL && (
              <>
                {displayMediaButton(msg)}
                {openMediaId === msg.id && (
                  <div className="mt-4">
                    {msg.mediaType.includes('image') ? (
                      <img
                        src={msg.mediaURL}
                        alt="Opened Media"
                        className="max-w-full h-auto"
                        style={{ pointerEvents: 'none', userSelect: 'none' }} // Disable interaction (no right-click or copy)
                        onContextMenu={(e) => e.preventDefault()} // Disable right-click
                      />
                    ) : (
                      <video
                        src={msg.mediaURL}
                        className="max-w-full h-auto"
                        controls={false} // Disable controls to prevent downloading
                        style={{ pointerEvents: 'none', userSelect: 'none' }} // Disable interaction
                        onContextMenu={(e) => e.preventDefault()} // Disable right-click
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {uploadProgress > 0 && (
        <div className="w-full bg-gray-300 rounded-lg mb-4">
          <div
            className="bg-green-500 text-white text-xs font-medium text-center p-0.5 leading-none rounded-lg"
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}% uploaded
          </div>
        </div>
      )}

      {sendProgress > 0 && (
        <div className="w-full bg-gray-300 rounded-lg mb-4">
          <div
            className="bg-blue-500 text-white text-xs font-medium text-center p-0.5 leading-none rounded-lg"
            style={{ width: `${sendProgress}%` }}
          >
            {sendProgress}% sending
          </div>
        </div>
      )}

      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
        placeholder="Type your message..."
      ></textarea>

      {/* Input for media (images or videos) */}
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setMedia(e.target.files[0])}
        className="mb-4 w-full"
      />

      <button
        onClick={handleSendMessage}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full"
      >
        Send Message
      </button>
    </div>
  );
};

export default MessageComponent;
