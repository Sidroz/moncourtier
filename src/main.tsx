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
import BrokerClients from './pages/BrokerClients.tsx';
import BrokerProfil from './pages/BrokerProfil.tsx';
import AppointmentBooking from './pages/AppointmentBooking.tsx';
import ClientVosCourtiers from './pages/ClientVosCourtiers.tsx';
import BrokerModifProfil from './pages/BrokerModifProfil.tsx';
import './index.css';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  console.error('La clé API Google Maps n\'est pas définie. Veuillez ajouter VITE_GOOGLE_MAPS_API_KEY dans le fichier .env');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courtier" element={<BrokerDashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courtier-signup" element={<BrokerSignup />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client/settings" element={<ClientSettings />} />
        <Route path="/results" element={<Results />} />
        <Route path="/client/securite" element={<ClientSecurity />} />
        <Route path="/client/rendezvous" element={<ClientAppointments />} />
        <Route path="/courtier/calendrier" element={<BrokerCalendar />} />
        <Route path="/courtier/disponibilites" element={<BrokerAvailability />} />
        <Route path="/courtier/clients" element={<BrokerClients />} />
        <Route path="/appointment-booking/:brokerId" element={<AppointmentBooking />} />
        <Route path="/client/vos-courtiers" element={<ClientVosCourtiers />} />
        <Route path="/broker-profil/:brokerId" element={<BrokerProfil />} />
        <Route path="/courtier/profil" element={<BrokerModifProfil />} />
      </Routes>
    </Router>
  </StrictMode>
);