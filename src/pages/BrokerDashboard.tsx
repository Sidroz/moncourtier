import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Clock, FileText, Settings, LogOut, Users, BarChart as ChartBar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BrokerDashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const checkAuthorization = async () => {
        try {
          const userDocRef = doc(db, 'courtiers', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().type === 'courtier') {
            setIsAuthorized(true);
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de l\'autorisation:', err);
        } finally {
          setAuthChecked(true);
        }
      };
      checkAuthorization();
    }
  }, [user, loading]);

  if (loading || !authChecked) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    console.error("Erreur lors de la vérification de l\'authentification:", error);
    return <div className="min-h-screen flex items-center justify-center">Erreur: {error.message}</div>;
  }

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Accès refusé. Vous n'êtes pas autorisé à voir cette page.</div>;
  }

  // Mock data for demonstration
  const todayAppointments = [
    {
      id: 1,
      client: "Jean Dupont",
      type: "Premier rendez-vous",
      time: "14:30",
      status: "confirmed"
    },
    {
      id: 2,
      client: "Marie Lambert",
      type: "Suivi dossier",
      time: "16:00",
      status: "pending"
    }
  ];

  const stats = [
    { label: "Rendez-vous ce mois", value: "24" },
    { label: "Nouveaux clients", value: "8" },
    { label: "Taux de conversion", value: "65%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <Link to="/" className="text-2xl font-bold text-blue-600">MonCourtier</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Sophie Martin</span>
              <button className="text-gray-600 hover:text-gray-800">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col space-y-4">
                <Link to="/courtier/calendar" className="flex items-center space-x-2 text-blue-600 font-medium">
                  <Calendar className="h-5 w-5" />
                  <span>Agenda</span>
                </Link>
                <Link to="/courtier/availability" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <Clock className="h-5 w-5" />
                  <span>Disponibilités</span>
                </Link>
                <Link to="/courtier/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <Users className="h-5 w-5" />
                  <span>Clients</span>
                </Link>
                <Link to="/courtier/documents" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <FileText className="h-5 w-5" />
                  <span>Documents</span>
                </Link>
                <Link to="/courtier/stats" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <ChartBar className="h-5 w-5" />
                  <span>Statistiques</span>
                </Link>
                <Link to="/courtier/settings" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <Settings className="h-5 w-5" />
                  <span>Paramètres</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Rendez-vous du jour</h2>
                <div className="space-y-4">
                  {todayAppointments.map(appointment => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment.client}</h3>
                          <p className="text-gray-600">{appointment.type}</p>
                          <div className="flex items-center mt-2 text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{appointment.time}</span>
                            <span className={`ml-4 px-2 py-1 rounded-full text-xs ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                            </span>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            Détails
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}