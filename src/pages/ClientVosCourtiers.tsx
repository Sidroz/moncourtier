import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, HelpCircle, Calendar, Phone, Mail, MapPin, Search, ChevronRight, Plus, Bell, Menu, ChevronDown } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface Courtier {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  specialty?: string[];
  rating?: number;
  contactEmail?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  availableDays?: string[];
  experiences?: {
    company: string;
    position: string;
    startYear: number;
    endYear?: number;
  }[];
}

export default function ClientVosCourtiers() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<{ 
    firstName?: string; 
    lastName?: string;
    photoURL?: string;
  } | null>(null);
  const [courtiers, setCourtiers] = useState<Courtier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
      const fetchCourtiers = async () => {
        try {
          // Récupérer d'abord tous les rendez-vous du client pour connaître les courtiers avec qui il a eu des rendez-vous
          const appointmentsRef = collection(db, 'appointments');
          const appointmentsQuery = query(
            appointmentsRef, 
            where('clientId', '==', user.uid)
          );
          
          const querySnapshot = await getDocs(appointmentsQuery);
          
          // Extraire les ID uniques des courtiers
          const brokerIds = new Set<string>();
          querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.brokerId) {
              brokerIds.add(data.brokerId);
            }
          });
          
          // Récupérer les détails de chaque courtier
          const courtierPromises = Array.from(brokerIds).map(async (brokerId) => {
            const brokerDocRef = doc(db, 'courtiers', brokerId);
            const brokerDoc = await getDoc(brokerDocRef);
            
            if (brokerDoc.exists()) {
              return {
                id: brokerDoc.id,
                ...brokerDoc.data()
              } as Courtier;
            }
            return null;
          });
          
          const courtierResults = await Promise.all(courtierPromises);
          const validCourtiers = courtierResults.filter((c): c is Courtier => c !== null);
          
          setCourtiers(validCourtiers);
        } catch (err) {
          console.error('Erreur lors de la récupération des courtiers:', err);
        }
      };
      
      fetchCourtiers();
    }
  }, [user, authChecked]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const filteredCourtiers = courtiers.filter(courtier => {
    const fullName = `${courtier.firstName} ${courtier.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
      (courtier.specialty && courtier.specialty.some(s => s.toLowerCase().includes(searchLower)));
  });

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
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-100" />
                </div>
                <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition-colors">
                  MonCourtier
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
          <h1 className="text-3xl font-bold text-gray-900">Vos Courtiers</h1>
          <Link 
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Trouver un courtier
          </Link>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#244257] focus:border-[#244257] shadow-sm"
              placeholder="Rechercher un courtier par nom ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* No courtiers message */}
        {courtiers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun courtier trouvé</h3>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore pris rendez-vous avec un courtier.</p>
            <Link 
              to="/search"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Trouver un courtier
            </Link>
          </div>
        )}

        {/* Courtiers grid */}
        {courtiers.length > 0 && filteredCourtiers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500">Aucun courtier ne correspond à votre recherche.</p>
          </div>
        )}

        {filteredCourtiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourtiers.map(courtier => (
              <div 
                key={courtier.id} 
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {courtier.photoUrl ? (
                      <img 
                        src={courtier.photoUrl} 
                        alt={`${courtier.firstName} ${courtier.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{courtier.firstName} {courtier.lastName}</h2>
                    <p className="text-gray-500">{courtier.specialty && courtier.specialty.slice(0, 2).join(' • ')}</p>
                    {courtier.address && (
                      <p className="text-gray-500 text-sm mt-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {courtier.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-3 mb-5 text-sm">
                  {courtier.contactEmail && (
                    <div className="flex items-center text-gray-700">
                      <Mail className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="truncate">{courtier.contactEmail}</span>
                    </div>
                  )}
                  {courtier.phoneNumber && (
                    <div className="flex items-center text-gray-700">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{courtier.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link 
                    to={`/broker-profil/${courtier.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 text-[#244257] hover:text-blue-700 font-medium py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span>Voir le profil</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link 
                    to={`/appointment-booking/${courtier.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 bg-[#244257] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Rendez-vous</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
