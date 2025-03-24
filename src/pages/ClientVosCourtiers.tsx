import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, HelpCircle, Calendar, Star, Phone, Mail, MapPin, Search, ChevronRight, Plus, X } from 'lucide-react';
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
  const [selectedCourtier, setSelectedCourtier] = useState<Courtier | null>(null);
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

  const handleSelectCourtier = (courtier: Courtier) => {
    setSelectedCourtier(courtier);
  };

  const closeModal = () => {
    setSelectedCourtier(null);
  };

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

  const renderStars = (rating?: number) => {
    if (!rating) return 'Non évalué';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {halfStar && <Star className="h-4 w-4 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
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
                className={`px-4 py-2 rounded-lg hover:bg-blue-800 ${
                  location.pathname === '/client/appointments' 
                    ? 'bg-white text-[#244257]' 
                    : 'bg-[#244257] text-white hover:bg-blue-800'
                }`}
              >
                Rendez-vous
              </Link>
              <Link 
                to="/client/brokers" 
                className={`px-4 py-2 rounded-lg hover:bg-gray-100 ${
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
          <h1 className="text-3xl font-bold text-gray-900">Vos Courtiers</h1>
          <Link 
            to="/search"
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
                    <div className="mt-1">
                      {renderStars(courtier.rating)}
                    </div>
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
                  {courtier.address && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="truncate">{courtier.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleSelectCourtier(courtier)}
                    className="flex-1 flex items-center justify-center space-x-2 text-[#244257] hover:text-blue-700 font-medium py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span>Voir le profil</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <Link 
                    to={`/search?courtier=${courtier.id}`}
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

        {/* Modal for courtier details */}
        {selectedCourtier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-auto overflow-hidden">
              <div className="bg-[#244257] py-3 px-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Profil du Courtier</h2>
                  <button 
                    onClick={closeModal}
                    className="text-white hover:text-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Courtier header info */}
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 md:mb-0">
                    {selectedCourtier.photoUrl ? (
                      <img 
                        src={selectedCourtier.photoUrl} 
                        alt={`${selectedCourtier.firstName} ${selectedCourtier.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedCourtier.firstName} {selectedCourtier.lastName}</h3>
                    {selectedCourtier.specialty && (
                      <p className="text-gray-600">{selectedCourtier.specialty.join(' • ')}</p>
                    )}
                    <div className="mt-2">
                      {renderStars(selectedCourtier.rating)}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  {selectedCourtier.contactEmail && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-gray-800">{selectedCourtier.contactEmail}</p>
                      </div>
                    </div>
                  )}
                  {selectedCourtier.phoneNumber && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Téléphone</p>
                        <p className="text-gray-800">{selectedCourtier.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  {selectedCourtier.address && (
                    <div className="flex items-center col-span-full">
                      <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Adresse</p>
                        <p className="text-gray-800">{selectedCourtier.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {selectedCourtier.bio && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">À propos</h4>
                    <p className="text-gray-700">{selectedCourtier.bio}</p>
                  </div>
                )}

                {/* Experience */}
                {selectedCourtier.experiences && selectedCourtier.experiences.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Expérience professionnelle</h4>
                    <div className="space-y-3">
                      {selectedCourtier.experiences.map((exp, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <p className="font-medium">{exp.position}</p>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {exp.startYear} - {exp.endYear || 'Présent'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-3 mt-6">
                  <Link 
                    to={`/search?courtier=${selectedCourtier.id}`}
                    className="flex-1 py-2 px-4 bg-[#244257] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Prendre rendez-vous
                  </Link>
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
