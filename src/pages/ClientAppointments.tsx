import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Clock, User, LogOut, HelpCircle } from 'lucide-react';

interface Appointment {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  brokerPhotoURL: string;
}

export default function ClientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Fictitious appointments data
    const mockAppointments: Appointment[] = [
      { id: 1, title: 'Meeting with Alex', date: '2025-03-22', time: '10:00 AM', location: 'Office', brokerPhotoURL: 'https://example.com/path/to/broker-photo.jpg' },
      { id: 2, title: 'Dentist Appointment', date: '2025-03-23', time: '02:00 PM', location: 'Dental Clinic', brokerPhotoURL: 'https://example.com/path/to/broker-photo.jpg' },
      { id: 3, title: 'Lunch with Sarah', date: '2025-03-24', time: '12:00 PM', location: 'Cafe', brokerPhotoURL: 'https://example.com/path/to/broker-photo.jpg' },
    ];
    
    // Sort appointments by date
    const sortedAppointments = mockAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setAppointments(sortedAppointments);
  }, []);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#244257] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8" />
            <span className="text-2xl font-bold">MonCourtier</span>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link 
                to="/client" 
                className={`px-4 py-2 rounded-lg hover:bg-blue-800 ${
                  location.pathname === '/client' 
                    ? 'bg-white text-[#244257]' 
                    : 'bg-[#244257] text-white hover:bg-blue-800'
                }`}
              >
                Accueil
              </Link>
              <Link 
                to="/client/appointments" 
                className={`px-4 py-2 rounded-lg hover:bg-gray-100 ${
                  location.pathname === '/client/appointments' 
                    ? 'bg-white text-[#244257]' 
                    : 'bg-[#244257] text-white hover:bg-blue-800'
                }`}
              >
                Rendez-vous
              </Link>
              <Link 
                to="/client/brokers" 
                className={`px-4 py-2 rounded-lg hover:bg-blue-800 ${
                  location.pathname === '/client/brokers' 
                    ? 'bg-white text-[#244257]' 
                    : 'bg-[#244257] text-white hover:bg-blue-800'
                }`}
              >
                Vos Courtiers
              </Link>
              <Link 
                to="/client/settings" 
                className={`px-4 py-2 rounded-lg hover:bg-blue-800 ${
                  location.pathname.includes('/client/settings') || location.pathname.includes('/client/security')
                    ? 'bg-white text-[#244257]' 
                    : 'bg-[#244257] text-white hover:bg-blue-800'
                }`}
              >
                Profil
              </Link>
            </nav>
            <button className="flex items-center space-x-2 px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-800">
              <HelpCircle className="h-5 w-5" />
              <span>Centre d'aide</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm">Utilisateur</span>
                <button 
                  onClick={() => {}}
                  className="text-sm text-gray-300 hover:text-white text-left flex items-center"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mes Rendez-vous</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map(appointment => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 transition-transform transform hover:scale-105 hover:shadow-lg relative">
              <h2 className="text-lg font-semibold text-gray-900">{appointment.title}</h2>
              <div className="flex items-center text-gray-600 mt-2">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center text-gray-600 mt-2">
                <Clock className="h-5 w-5 mr-2" />
                <span>{appointment.time}</span>
              </div>
              <div className="text-gray-600 mt-2">
                <span>{appointment.location}</span>
              </div>
              <button 
                onClick={() => handleViewDetails(appointment)}
                className="mt-4 w-full inline-flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Voir détail
              </button>
            </div>
          ))}
        </div>

        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Détail du Rendez-vous</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700"><strong>Titre:</strong> {selectedAppointment.title}</p>
                <p className="text-gray-700"><strong>Date:</strong> {selectedAppointment.date}</p>
                <p className="text-gray-700"><strong>Heure:</strong> {selectedAppointment.time}</p>
                <p className="text-gray-700"><strong>Lieu:</strong> {selectedAppointment.location}</p>
              </div>
              <div className="mt-6 text-right">
                <button 
                  onClick={closeModal}
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
