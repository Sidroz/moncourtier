import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import BrokerStats from './pages/BrokerStats.tsx';
import ForBrokers from './pages/ForBrokers.tsx';
import BrokerCabinetManagement from './pages/BrokerCabinetManagement.tsx';
import BrokerCreateCabinet from './pages/BrokerCreateCabinet.tsx';
import Pricing from './pages/Pricing.tsx';
import './index.css';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  console.error('La clé API Google Maps n\'est pas définie. Veuillez ajouter VITE_GOOGLE_MAPS_API_KEY dans le fichier .env');
}

// Vérifier si nous sommes sur le sous-domaine pro
const isPro = window.location.hostname === 'pro.localhost' || window.location.hostname === 'pro.moncourtier.fr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        {isPro ? (
          // Routes pour le sous-domaine pro
          <>
            <Route path="/" element={<ForBrokers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<BrokerSignup />} />
            <Route path="/courtier/*" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          // Routes normales
          <>
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
            <Route path="/courtier/cabinet" element={<BrokerCabinetManagement />} />
            <Route path="/courtier/create-cabinet" element={<BrokerCreateCabinet />} />
            <Route path="/appointment-booking/:brokerId" element={<AppointmentBooking />} />
            <Route path="/client/vos-courtiers" element={<ClientVosCourtiers />} />
            <Route path="/broker-profil/:brokerId" element={<BrokerProfil />} />
            <Route path="/courtier/profil" element={<BrokerModifProfil />} />
            <Route path="/courtier/stats" element={<BrokerStats />} />
            <Route path="/pour-les-courtiers" element={<ForBrokers />} />
            <Route path="/pricing" element={<Pricing />} />
          </>
        )}
      </Routes>
    </Router>
  </StrictMode>
);