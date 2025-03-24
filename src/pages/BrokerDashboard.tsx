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
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[95%] mx-auto px-4 py-3 sm:px-6 lg:px-8">
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

      <div className="w-full pt-16 flex">
        {/* Sidebar */}
        <div className="w-24 fixed left-0 top-1/2 transform -translate-y-1/2 h-[500px] py-6 ml-[20px] bg-[#244257] rounded-3xl flex flex-col items-center justify-center shadow-lg">
          <div className="flex flex-col items-center space-y-8">
            <Link to="/courtier/calendrier" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <Calendar className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Agenda</span>
            </Link>
            <Link to="/courtier/clients" className="flex flex-col items-center text-white group transition-all duration-300 relative">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Clients</span>
            </Link>
            <Link to="/courtier/disponibilites" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <Clock className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Disponibilités</span>
            </Link>
            <Link to="/courtier/documents" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <FileText className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Documents</span>
            </Link>
            <Link to="/courtier/stats" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <ChartBar className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Statistiques</span>
            </Link>
            <Link to="/courtier/settings" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <Settings className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Paramètres</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-[140px] pr-[20px]">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Rendez-vous du jour</h2>
              <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
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
  );
}