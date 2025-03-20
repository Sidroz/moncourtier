import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Results from './pages/Results.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import BrokerSignup from './pages/BrokerSignup.tsx';
import ClientDashboard from './pages/ClientDashboard.tsx';
import ClientSettings from './pages/ClientSettings.tsx';
import ClientSecurity from './pages/ClientSecurity.tsx';
import ClientAppointments from './pages/ClientAppointments.tsx';
import BrokerDashboard from './pages/BrokerDashboard.tsx';
import BrokerCalendar from './pages/BrokerCalendar.tsx';
import BrokerAvailability from './pages/BrokerAvailability.tsx';
import AppointmentBooking from './pages/AppointmentBooking.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courtier/dashboard" element={<BrokerDashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/broker-signup" element={<BrokerSignup />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client/settings" element={<ClientSettings />} />
        <Route path="/results" element={<Results />} />
        <Route path="/client/security" element={<ClientSecurity />} />
        <Route path="/client/appointments" element={<ClientAppointments />} />
        <Route path="/courtier/calendar" element={<BrokerCalendar />} />
        <Route path="/courtier/availability" element={<BrokerAvailability />} />
        <Route path="/appointment-booking/:brokerId" element={<AppointmentBooking />} />
      </Routes>
    </Router>
  </StrictMode>
);