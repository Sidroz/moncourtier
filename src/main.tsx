import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Results from './pages/Results.tsx';
import Login from './pages/Login.tsx';
import ClientDashboard from './pages/ClientDashboard.tsx';
import BrokerDashboard from './pages/BrokerDashboard.tsx';
import Signup from './pages/Signup.tsx';
import BrokerSignup from './pages/BrokerSignup';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/results" element={<Results />} />
        <Route path="/login" element={<Login />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/courtier/dashboard" element={<BrokerDashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/broker-signup" element= {<BrokerSignup />} /> // Nouvelle route
      </Routes>
    </Router>
  </StrictMode>
);