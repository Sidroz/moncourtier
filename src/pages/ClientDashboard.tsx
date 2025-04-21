import { useState, useEffect } from 'react';
import { Calendar, HelpCircle, LogOut, User, Plus, Bell, Menu, ChevronDown } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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
}

export default function ClientDashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<{ 
    firstName?: string; 
    lastName?: string;
    photoURL?: string;
  } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [courtiers, setCourtiers] = useState<{[key: string]: Courtier}>({});
  const navigate = useNavigate();
  const location = useLocation();

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

  // Récupérer les rendez-vous du client
  useEffect(() => {
    if (user && authChecked) {
      const fetchAppointments = async () => {
        try {
          const appointmentsRef = collection(db, 'appointments');
          console.log("Recherche des rendez-vous pour l'utilisateur:", user.uid);
          
          // D'abord vérifier si la collection appointments contient des données
          const allAppointmentsSnapshot = await getDocs(appointmentsRef);
          console.log("Nombre total de rendez-vous dans la collection:", allAppointmentsSnapshot.size);
          if (allAppointmentsSnapshot.size > 0) {
            console.log("Exemple de rendez-vous:", allAppointmentsSnapshot.docs[0].data());
          }
          
          // Récupérer les rendez-vous où le client est l'utilisateur actuel (sans filtrer sur le statut)
          const appointmentsQuery = query(
            appointmentsRef, 
            where('clientId', '==', user.uid)
          );
          
          const querySnapshot = await getDocs(appointmentsQuery);
          console.log("Nombre de rendez-vous trouvés:", querySnapshot.size);
          
          const appointmentsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log("Rendez-vous trouvé:", { id: doc.id, ...data });
            return {
              id: doc.id,
              ...data,
            };
          }) as Appointment[];
          
          // Récupérer les données des courtiers pour chaque rendez-vous
          const brokersCache: {[key: string]: Courtier} = {};
          
          for (const appointment of appointmentsData) {
            if (!brokersCache[appointment.brokerId]) {
              // Récupérer les informations du courtier
              const brokerDocRef = doc(db, 'courtiers', appointment.brokerId);
              const brokerDoc = await getDoc(brokerDocRef);
              
              if (brokerDoc.exists()) {
                const brokerData = brokerDoc.data() as Courtier;
                brokersCache[appointment.brokerId] = {
                  id: brokerDoc.id,
                  firstName: brokerData.firstName || '',
                  lastName: brokerData.lastName || '',
                  photoUrl: brokerData.photoUrl || ''
                };
                console.log("Données du courtier récupérées:", brokerData);
              } else {
                console.log("Courtier non trouvé dans Firestore:", appointment.brokerId);
              }
            }
            
            // Ajouter les informations du courtier au rendez-vous
            const broker = brokersCache[appointment.brokerId];
            if (broker) {
              appointment.brokerName = `${broker.firstName} ${broker.lastName}`.trim();
              appointment.brokerPhotoURL = broker.photoUrl;
              console.log("Rendez-vous avec infos courtier:", appointment);
            }
          }
          
          // Trier les rendez-vous par date (du plus proche au plus éloigné)
          const sortedAppointments = appointmentsData
            // Filtre pour ne garder que les rendez-vous à venir
            .filter(a => {
              const appointmentDate = new Date(`${a.date}T${a.startTime}`);
              const now = new Date(); // Utiliser la date et l'heure actuelles
              return appointmentDate >= now; // Comparer avec la date ET l'heure actuelle
            })
            .sort((a, b) => {
              const dateA = new Date(`${a.date}T${a.startTime}`);
              const dateB = new Date(`${b.date}T${b.startTime}`);
              return dateA.getTime() - dateB.getTime();
            });
          
          console.log("Rendez-vous triés et prêts à être affichés:", sortedAppointments);
          setAppointments(sortedAppointments);
          console.log("Courtiers récupérés:", brokersCache);
          setCourtiers(brokersCache);
        } catch (err) {
          console.error('Erreur lors de la récupération des rendez-vous:', err);
        }
      };
      
      fetchAppointments();
    }
  }, [user, authChecked]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Rediriger vers la page de connexion
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  if (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error);
    return <div className="min-h-screen flex items-center justify-center">Erreur: {error.message}</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Veuillez vous connecter.</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' } as const;
    return date.toLocaleDateString('fr-FR', options);
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <div className="mb-6">
          <p className="text-gray-700 font-medium">
            Bonjour  {userData ? `${userData.firstName} ${userData.lastName}` : 'cher utilisateur'} 👋
          </p>
          <p className="text-gray-600 mt-1">
            {appointments.length > 0 
              ? `Vous avez ${appointments.length} rendez-vous ${appointments.length === 1 ? 'prochainement' : 'à venir'}.` 
              : "Vous n'avez pas de rendez-vous prochainement."}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 relative min-h-[400px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Link to="/client/rendezvous" className="text-lg font-semibold text-gray-900">Prochains Rendez-vous</Link>
              <div className="absolute top-5 right-4 bg-[#244257] text-white rounded-full w-8 h-8 flex items-center justify-center">
                {appointments.length}
              </div>
            </div>
            {appointments.length === 0 ? (
              <p className="text-gray-600 text-center mb-10">
                Vous n'avez pas de rendez-vous à venir.
                <br /><span className="text-xs mt-2 block">Consultez la section rendez-vous pour voir l'historique.</span>
              </p>
            ) : (
              <ul className="space-y-4">
                {appointments.slice(0, 3).map(appointment => (
                  <li key={appointment.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                      <p className="text-gray-700 font-semibold">{appointment.brokerName || "Courtier"}</p>
                      <p className="text-gray-500 text-sm">{formatDate(appointment.date)} - {appointment.startTime}</p>
                      {appointment.status === 'pending' && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          En attente
                        </span>
                      )}
                      {appointment.status === 'confirmed' && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          Confirmé
                        </span>
                      )}
                      {appointment.status === 'cancelled' && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                          Annulé
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/">
              <button className="mt-6 w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium py-2 px-4 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <Plus className="h-5 w-5" />
                <span>Prendre un rendez-vous</span>
              </button>
            </Link>
          </div>

          {/* Card 2: Liste des courtiers */}
          <div className="bg-white rounded-lg shadow-md p-6 relative min-h-[400px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Link to="/client/vos-courtiers" className="text-lg font-semibold text-gray-900">Liste des Courtiers</Link>
              <User className="h-6 w-6 text-[#244257]" />
            </div>
            {Object.keys(courtiers).length === 0 ? (
              <p className="text-gray-600 mb-4 text-center">Vous n'avez pas de Courtier enregistré.</p>
            ) : (
              <ul className="space-y-4">
                {Object.values(courtiers).map((courtier) => (
                  <li key={courtier.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {courtier.photoUrl ? (
                        <img 
                          src={courtier.photoUrl} 
                          alt={`${courtier.firstName} ${courtier.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold">{courtier.firstName} {courtier.lastName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/client/vos-courtiers">
              <button className="mt-6 w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                Voir tous mes courtiers
              </button>
            </Link>
          </div>

          {/* Card 3: Informations de l'utilisateur */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {userData?.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-500" />
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-900 font-semibold">{userData ? `${userData.firstName} ${userData.lastName}` : user.email || 'Utilisateur'}</p>
              <p className="text-gray-900 font-regular">{user.email}</p>
              <Link to="/client/settings">
                <button className="mt-2 inline-block px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-800">
                  Voir mon compte
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}