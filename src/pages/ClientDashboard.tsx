import { useState, useEffect } from 'react';
import { Calendar, HelpCircle, LogOut, User, Plus } from 'lucide-react';
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
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Mettre à minuit pour comparer seulement les dates
              return appointmentDate >= today;
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
                className={`px-4 py-2 rounded-lg hover:bg-gray-100 ${
                  location.pathname === '/client' 
                    ? 'bg-white text-[#244257]' 
                    : 'bg-[#244257] text-white hover:bg-blue-800'
                }`}
              >
                Accueil
              </Link>
              <Link 
                to="/client/rendezvous" 
                className={`px-4 py-2 rounded-lg hover:bg-blue-800 ${
                  location.pathname === '/client/rendezvous' 
                    ? 'bg-white text-[#244257]' 
                    : 'bg-[#244257] text-white hover:bg-blue-800'
                }`}
              >
                Rendez-vous
              </Link>
              <Link 
                to="/client/vos-courtiers" 
                className={`px-4 py-2 rounded-lg hover:bg-blue-800 ${
                  location.pathname === '/client/vos-courtiers' 
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tableau de bord</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 relative min-h-[400px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Prochains Rendez-vous</h2>
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
            <Link to="/search">
              <button className="mt-6 w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium py-2 px-4 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <Plus className="h-5 w-5" />
                <span>Prendre un rendez-vous</span>
              </button>
            </Link>
          </div>

          {/* Card 2: Liste des courtiers */}
          <div className="bg-white rounded-lg shadow-md p-6 relative min-h-[400px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Liste des Courtiers</h2>
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
            <button className="mt-6 w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              Voir tous mes courtiers
            </button>
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