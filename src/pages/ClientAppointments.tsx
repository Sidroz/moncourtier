import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, LogOut, HelpCircle, MapPin, Check, X, AlertCircle, ChevronRight, Plus } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface Courtier {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

interface Appointment {
  id: string;
  title?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  brokerId: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  brokerName?: string;
  brokerPhotoURL?: string;
  createdAt?: any;
  location?: string;
  notes?: string;
}

export default function ClientAppointments() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<{ 
    firstName?: string; 
    lastName?: string;
    photoURL?: string;
  } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Attendre que le chargement de l'authentification soit terminé
    if (!loading) {
      setAuthChecked(true);
      
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!user) {
        navigate('/login');
        return;
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Ne récupérer les données utilisateur que si l'utilisateur est connecté et que l'authentification a été vérifiée
    if (user && authChecked) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.warn('Document utilisateur non trouvé dans Firestore');
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des données utilisateur:', err);
        }
      };
      
      fetchUserData();
    }
  }, [user, authChecked]);

  useEffect(() => {
    if (user && authChecked) {
      const fetchAppointments = async () => {
        try {
          const appointmentsRef = collection(db, 'appointments');
          
          // Récupérer les rendez-vous où le client est l'utilisateur actuel
          const appointmentsQuery = query(
            appointmentsRef, 
            where('clientId', '==', user.uid)
          );
          
          const querySnapshot = await getDocs(appointmentsQuery);
          
          const appointmentsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          }) as Appointment[];
          
          // Récupérer les données des courtiers pour chaque rendez-vous
          for (const appointment of appointmentsData) {
            // Récupérer les informations du courtier
            const brokerDocRef = doc(db, 'courtiers', appointment.brokerId);
            const brokerDoc = await getDoc(brokerDocRef);
            
            if (brokerDoc.exists()) {
              const brokerData = brokerDoc.data() as Courtier;
              appointment.brokerName = `${brokerData.firstName} ${brokerData.lastName}`.trim();
              appointment.brokerPhotoURL = brokerData.photoUrl;
            }
          }
          
          // Séparer les rendez-vous passés et à venir
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcoming = appointmentsData
            .filter(appointment => {
              const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
              return appointmentDate >= today;
            })
            .sort((a, b) => {
              const dateA = new Date(`${a.date}T${a.startTime}`);
              const dateB = new Date(`${b.date}T${b.startTime}`);
              return dateA.getTime() - dateB.getTime();
            });
          
          const past = appointmentsData
            .filter(appointment => {
              const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
              return appointmentDate < today;
            })
            .sort((a, b) => {
              const dateA = new Date(`${a.date}T${a.startTime}`);
              const dateB = new Date(`${b.date}T${b.startTime}`);
              return dateB.getTime() - dateA.getTime(); // Ordre chronologique inversé pour les rendez-vous passés
            });
          
          setAppointments(appointmentsData);
          setUpcomingAppointments(upcoming);
          setPastAppointments(past);
        } catch (err) {
          console.error('Erreur lors de la récupération des rendez-vous:', err);
        }
      };
      
      fetchAppointments();
    }
  }, [user, authChecked]);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' } as const;
    return date.toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Erreur: {error.message}</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Veuillez vous connecter.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#244257] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8" />
            <Link to="/" className="text-2xl font-bold hover:text-gray-200 transition-colors">MonCourtier</Link>
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
                {userData?.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm">{userData ? `${userData.firstName} ${userData.lastName}` : user.email || 'Utilisateur'}</span>
                <button 
                  onClick={handleLogout}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
          <Link 
            to="/search"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau rendez-vous
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-[#244257] text-[#244257]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              À venir ({upcomingAppointments.length})
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-[#244257] text-[#244257]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Historique ({pastAppointments.length})
            </button>
          </div>
        </div>

        {/* No appointments message */}
        {(activeTab === 'upcoming' && upcomingAppointments.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous à venir</h3>
            <p className="text-gray-500 mb-6">Vous n'avez pas de rendez-vous programmés pour le moment.</p>
            <Link 
              to="/search"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Prendre un rendez-vous
            </Link>
          </div>
        )}

        {(activeTab === 'past' && pastAppointments.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous passé</h3>
            <p className="text-gray-500">Votre historique de rendez-vous apparaîtra ici.</p>
          </div>
        )}

        {/* Appointments grid */}
        {((activeTab === 'upcoming' && upcomingAppointments.length > 0) || 
          (activeTab === 'past' && pastAppointments.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map(appointment => (
              <div 
                key={appointment.id} 
                className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden ${
                  activeTab === 'past' ? 'opacity-85' : ''
                }`}
              >
                {/* Status indicator */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  appointment.status === 'confirmed' ? 'bg-green-500' :
                  appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  {/* Broker info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {appointment.brokerPhotoURL ? (
                        <img 
                          src={appointment.brokerPhotoURL} 
                          alt={appointment.brokerName || "Courtier"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">{appointment.brokerName || "Courtier"}</p>
                      <p className="text-sm text-gray-500">{appointment.title || "Rendez-vous"}</p>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status === 'confirmed' && (
                      <span className="flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Confirmé
                      </span>
                    )}
                    {appointment.status === 'cancelled' && (
                      <span className="flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        Annulé
                      </span>
                    )}
                    {appointment.status === 'pending' && (
                      <span className="flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        En attente
                      </span>
                    )}
                  </div>
                </div>

                {/* Appointment details */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{appointment.startTime} - {appointment.endTime}</span>
                  </div>
                  {appointment.location && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                      <span>{appointment.location}</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleViewDetails(appointment)}
                  className="w-full flex items-center justify-center space-x-2 text-[#244257] hover:text-blue-700 font-medium py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>Voir les détails</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal for appointment details */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden">
              <div className={`py-3 px-6 ${
                selectedAppointment.status === 'confirmed' ? 'bg-green-500' :
                selectedAppointment.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
              }`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Détail du Rendez-vous</h2>
                  <button 
                    onClick={closeModal}
                    className="text-white hover:text-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Broker info */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {selectedAppointment.brokerPhotoURL ? (
                      <img 
                        src={selectedAppointment.brokerPhotoURL} 
                        alt={selectedAppointment.brokerName || "Courtier"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{selectedAppointment.brokerName || "Courtier"}</p>
                    <p className="text-gray-500">{selectedAppointment.title || "Rendez-vous"}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedAppointment.status === 'confirmed' ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : selectedAppointment.status === 'cancelled' ? (
                      <X className="h-4 w-4 mr-1" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-1" />
                    )}
                    {selectedAppointment.status === 'confirmed' ? 'Confirmé' :
                      selectedAppointment.status === 'cancelled' ? 'Annulé' : 'En attente'}
                  </div>
                </div>

                {/* Appointment details */}
                <div className="space-y-4 mb-6">
                  <div className="flex">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date</p>
                      <p className="text-gray-800">{formatDate(selectedAppointment.date)}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <Clock className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Heure</p>
                      <p className="text-gray-800">{selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                    </div>
                  </div>
                  {selectedAppointment.location && (
                    <div className="flex">
                      <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Lieu</p>
                        <p className="text-gray-800">{selectedAppointment.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-3 mt-6">
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <button className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                        Confirmer
                      </button>
                      <button className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                        Annuler
                      </button>
                    </>
                  )}
                  <button 
                    onClick={closeModal}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
