// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import './App.css'; 
import './index.css';

const App = () => {
  const [selectedUser, setSelectedUser] = useState(null); // State to track selected user
  
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />  
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/seedata" element={<Seedata />} />
        <Route path="/claimfollowers" element={<ClaimFollowers />} />
        <Route path="/secureaccount" element={<SecureAccount />} />
        <Route path="/usersearch" element={<UserSearch setSelectedUser={setSelectedUser} />} />
        <Route path="/message/:conversationID" element={<MessageComponent />} />
        <Route path="/viewmedia" element={<ViewMedia />} /> {/* New route for media viewing */}
      </Routes>
    </Router>
  );
};

export default App;
