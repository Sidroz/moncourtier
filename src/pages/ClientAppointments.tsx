import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, LogOut, HelpCircle, MapPin, Check, X, AlertCircle, ChevronRight, Plus, Phone, Bell, Menu, ChevronDown } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
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

  // Fonction pour vérifier si un rendez-vous est annulable (plus de 2 heures avant)
  const isAppointmentCancellable = (appointment: Appointment): boolean => {
    const appointmentTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const now = new Date();
    
    // Calculer la différence en millisecondes
    const timeDifference = appointmentTime.getTime() - now.getTime();
    
    // Convertir en heures (1000 ms * 60 s * 60 min = 3600000 ms par heure)
    const hoursDifference = timeDifference / 3600000;
    
    // Vérifier si le rendez-vous est à plus de 2 heures et n'est pas déjà annulé
    return hoursDifference > 2 && appointment.status !== 'cancelled';
  };

  // Fonction pour annuler un rendez-vous
  const cancelAppointment = async (appointmentId: string) => {
    if (!user) return;
    
    try {
      setIsCancelling(true);
      
      // Référence au document du rendez-vous
      const appointmentRef = doc(db, 'appointments', appointmentId);
      
      // Mettre à jour le statut du rendez-vous
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
        cancelledBy: user.uid
      });
      
      // Mettre à jour l'état local
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: 'cancelled' } 
            : appt
        )
      );
      
      setUpcomingAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: 'cancelled' } 
            : appt
        )
      );
      
      // Mettre à jour le rendez-vous sélectionné si c'est celui qui est annulé
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({
          ...selectedAppointment,
          status: 'cancelled'
        });
      }
      
      setCancellationMessage({
        type: 'success',
        message: 'Votre rendez-vous a été annulé avec succès.'
      });
      
      // Fermer le message après 3 secondes
      setTimeout(() => {
        setCancellationMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de l\'annulation du rendez-vous:', error);
      setCancellationMessage({
        type: 'error',
        message: 'Une erreur est survenue lors de l\'annulation du rendez-vous.'
      });
      
      // Fermer le message après 3 secondes
      setTimeout(() => {
        setCancellationMessage(null);
      }, 3000);
    } finally {
      setIsCancelling(false);
    }
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
      <header className="bg-gradient-to-r from-[#1a3548] to-[#244257] text-white shadow-md border-b border-[#1a3548]/10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          {/* Logo et navigation principale */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 py-2">
                <Link to="/" className="bg-white p-1.5 rounded-lg">
                <img src="https://courtizy.fr/logo.png" alt="Logo" style={{ width: '32px', height: '32px', backgroundColor: 'transparent' }} />
                </Link>
                <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition-colors">
                  Courtizy
                </Link>
              </div>
              
              <nav className="hidden md:flex items-center ml-10 space-x-1">
                <Link 
                  to="/client" 
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname === '/client' 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-100 hover:bg-white/5'
                  }`}
                >
                  Accueil
                </Link>
                <Link 
                  to="/client/rendezvous" 
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname === '/client/rendezvous' 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-100 hover:bg-white/5'
                  }`}
                >
                  Rendez-vous
                </Link>
                <Link 
                  to="/client/vos-courtiers" 
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname === '/client/vos-courtiers' 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-100 hover:bg-white/5'
                  }`}
                >
                  Vos Courtiers
                </Link>
                <Link 
                  to="/client/settings" 
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname.includes('/client/settings') || location.pathname.includes('/client/security')
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-100 hover:bg-white/5'
                  }`}
                >
                  Profil
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Icônes d'action */}
              <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                <Bell className="h-5 w-5 text-gray-100" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-white/10 text-white rounded-lg border border-white/5 hover:bg-white/15 transition-colors text-sm">
                <HelpCircle className="h-4 w-4" />
                <span>Centre d'aide</span>
              </button>
              
              {/* Menu utilisateur */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-800/30 ring-2 ring-white/20 flex items-center justify-center overflow-hidden">
                    {userData?.photoURL ? (
                      <img 
                        src={userData.photoURL} 
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-blue-100" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{userData ? `${userData.firstName} ${userData.lastName}` : user.email || 'Utilisateur'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-300 hidden md:block" />
                </button>
                
                {/* Menu déroulant */}
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 transform origin-top-right">
                  <div className="py-2 px-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userData ? `${userData.firstName} ${userData.lastName}` : user.email || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/client/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Menu mobile */}
              <button className="md:hidden p-2 rounded-lg hover:bg-white/10">
                <Menu className="h-6 w-6 text-white" />
              </button>
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

        {/* Message de confirmation/erreur */}
        {cancellationMessage && (
          <div className={`mb-4 p-4 rounded-lg ${
            cancellationMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {cancellationMessage.message}
          </div>
        )}

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
                  {selectedAppointment.status === 'pending' && isAppointmentCancellable(selectedAppointment) && (
                    <button 
                      onClick={() => cancelAppointment(selectedAppointment.id)}
                      disabled={isCancelling}
                      className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCancelling ? 'Annulation...' : 'Annuler'}
                    </button>
                  )}
                  
                  {selectedAppointment.status === 'confirmed' && isAppointmentCancellable(selectedAppointment) && (
                    <button 
                      onClick={() => cancelAppointment(selectedAppointment.id)}
                      disabled={isCancelling}
                      className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCancelling ? 'Annulation...' : 'Annuler'}
                    </button>
                  )}
                  
                  {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && 
                   !isAppointmentCancellable(selectedAppointment) && (
                    <div className="flex-1 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
                      <p className="flex items-center font-medium mb-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Annulation impossible
                      </p>
                      <p>Le rendez-vous est dans moins de 2 heures. Veuillez contacter directement votre courtier.</p>
                      <a href="tel:" className="mt-2 flex items-center text-amber-800 font-medium hover:underline">
                        <Phone className="h-4 w-4 mr-1" />
                        Contacter le courtier
                      </a>
                    </div>
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
