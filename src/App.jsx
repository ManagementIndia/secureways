// src/App.jsx
import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'; // Use HashRouter instead of BrowserRouter
import Signup from '../src/components/Signup';
import SignIn from '../src/components/Signin';
import Dashboard from './components/Dashboard';
import FormPage from './components/Formdata';
import Seedata from './components/Seedata';
import ClaimFollowers from './components/Claimfollowers';
import SecureAccount from './components/Secureaccount';
import UserSearch from './components/Usersearch';
import MessageComponent from './components/Messagecomponent';
import ViewMedia from './components/Viewmedia';
import GlobalSeeData from './components/Globalseedata';
import GmailLogin from './components/GmailLogin';
import './App.css'; 
import './index.css';

const App = () => {
  const [selectedUser, setSelectedUser] = useState(null); // State to track selected user
  
  return (
    <Router> {/* HashRouter here */}
      <Routes>
        <Route path="/signup" element={<Signup />} />  
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/form/:userId" element={<FormPage />} /> {/* Updated to include userId */}
        <Route path="/seedata" element={<Seedata />} /> {/* Updated to include userId */}
        <Route path="/claimfollowers/:userId" element={<ClaimFollowers />} /> {/* Updated to include userId */}
        <Route path="/secureaccount/:userId" element={<SecureAccount />} /> {/* Updated to include userId */}
        <Route path="/usersearch" element={<UserSearch setSelectedUser={setSelectedUser} />} />
        <Route path="/message/:conversationID" element={<MessageComponent />} />
        <Route path="/viewmedia" element={<ViewMedia />} />
        <Route path="/gb" element={<GlobalSeeData/>} />
        <Route path="/gmaillogin/:userId" element={<GmailLogin/>}/>
      </Routes>
    </Router>
  );
};

export default App;
