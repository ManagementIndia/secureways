import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'; // Firestore imports
import { getAuth } from 'firebase/auth';

const db = getFirestore();

const UserSearch = ({ setSelectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [notifications, setNotifications] = useState([]); // State for notifications
  const auth = getAuth();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // Async function to fetch conversations and messages
    const fetchConversations = async () => {
      // Listen for new messages in real-time for the current user
      const conversationsRef = collection(db, "conversations");
      const q = query(conversationsRef, where("participants", "array-contains", currentUser.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.forEach(async (doc) => {
          const conversationID = doc.id;

          // Listening for new messages in the conversation's "messages" sub-collection
          const messagesRef = collection(db, `conversations/${conversationID}/messages`);
          const messagesQuery = query(messagesRef, where("viewed", "==", false)); // Check for unseen messages

          const messagesSnapshot = await getDocs(messagesQuery);

          messagesSnapshot.forEach(async (messageDoc) => {
            const messageData = messageDoc.data();

            // Check if the message is from someone else (not the current user)
            if (messageData.fromUserID !== currentUser.uid && !messageData.viewed) {
              // Get the sender's user info
              const senderDoc = await getDoc(doc(db, "users", messageData.fromUserID));
              const senderData = senderDoc.exists() ? senderDoc.data() : {};

              // Notify if there's an unread message
              setNotifications((prevNotifications) => [
                ...prevNotifications,
                {
                  conversationID,
                  messageID: messageDoc.id,
                  senderUsername: senderData.username || 'Unknown',
                  messageText: messageData.message || 'New message',
                }
              ]);
            }
          });
        });
      });

      return unsubscribe;
    };

    fetchConversations();
  }, [currentUser]);

  // Function to search users by username
  const searchUsers = async () => {
    const usersCollection = collection(db, "users"); // Firestore users collection
    const q = query(usersCollection, where("username", "==", searchTerm)); // Search by username

    try {
      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      if (users.length > 0) {
        setUserResults(users);  // Display the results if found
      } else {
        alert('No user found with that username');
        setUserResults([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users');
    }
  };

  // Function to create the conversation and navigate to message page
  const handleMessage = async (user) => {
    if (!currentUser) {
      alert('You must be logged in to send a message.');
      return;
    }

    try {
      // Create a unique conversation ID using both users' UIDs (order-agnostic)
      const conversationID =
        currentUser.uid < user.uid
          ? `${currentUser.uid}_${user.uid}`
          : `${user.uid}_${currentUser.uid}`;

      // Reference to the conversation document
      const conversationRef = doc(db, "conversations", conversationID);

      // Ensure the conversation document exists, even if there are no messages yet
      await setDoc(conversationRef, {
        participants: [currentUser.uid, user.uid],
        createdAt: serverTimestamp(),
      }, { merge: true });

      // Set the selected user and navigate to the message page with conversationID
      setSelectedUser(user);
      navigate(`/message/${conversationID}`); // Navigate to the MessageComponent page
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Error creating conversation');
    }
  };

  // Function to navigate to conversation when clicking a notification
  const handleNotificationClick = (conversationID) => {
    navigate(`/message/${conversationID}`); // Navigate to the conversation
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Search User by Username</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          placeholder="Enter Username"
        />
        <button 
          onClick={searchUsers}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Search
        </button>
      </div>

      {userResults.map(user => (
        <div key={user.id} className="bg-gray-100 p-4 mb-2 rounded-lg shadow">
          <p className="text-lg font-semibold">Username: {user.username}</p>
          <p className="text-lg font-semibold">Email: {user.email}</p>
          <button
            onClick={() => handleMessage(user)}  // Create conversation and navigate to MessageComponent page
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Message
          </button>
        </div>
      ))}

      {/* Notification Section */}
      {notifications.length > 0 && (
        <div className="bg-yellow-200 p-4 mt-4 rounded-lg shadow">
          <h3 className="text-lg font-bold text-yellow-800">New Messages</h3>
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="p-2 border-b border-yellow-300 cursor-pointer hover:bg-yellow-300"
              onClick={() => handleNotificationClick(notification.conversationID)}
            >
              <p className="text-yellow-700">
                You got a new message from <strong>{notification.senderUsername}</strong>: "{notification.messageText}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
