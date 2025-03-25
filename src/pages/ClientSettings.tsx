import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getAuth, updateEmail, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast, Toaster } from 'react-hot-toast';
import { Calendar, LogOut, User, Lock, MapPin, Shield, ArrowRight, HelpCircle, Upload, Bell, Menu, ChevronDown } from 'lucide-react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  photoURL?: string;
  latitude?: number;
  longitude?: number;
}

// Composant d'autocomplétion d'adresse Google
const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onSelect 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  onSelect: (address: string, city: string, postalCode: string, lat: number, lng: number) => void;
}) => {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'fr' },
    },
    debounce: 300,
    defaultValue: value
  });

  useEffect(() => {
    if (value) {
      setValue(value);
    }
  }, [value, setValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const handleSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    setValue(suggestion.description, false);
    onChange(suggestion.description);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: suggestion.description });
      const { lat, lng } = await getLatLng(results[0]);
      
      // Extraire le code postal et la ville
      let city = '';
      let postalCode = '';
      
      results[0].address_components.forEach(component => {
        if (component.types.includes('postal_code')) {
          postalCode = component.long_name;
        }
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
      });
      
      onSelect(suggestion.description, city, postalCode, lat, lng);
    } catch (error) {
      console.error('😱 Error: ', error);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInput}
        disabled={!ready}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
        placeholder="Entrez votre adresse"
      />
      {status === 'OK' && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
          {data.map(suggestion => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function ClientSettings() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Vérifier si l'API Google Maps est déjà chargée
  useEffect(() => {
    // Si window.google et window.google.maps existent, l'API est déjà chargée
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
    } else {
      // Vérifier périodiquement si l'API a été chargée par un autre composant
      const checkGoogleMapsLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          setScriptLoaded(true);
          clearInterval(checkGoogleMapsLoaded);
        }
      }, 500);

      // Nettoyer l'intervalle si le composant est démonté
      return () => clearInterval(checkGoogleMapsLoaded);
    }
  }, []);

  // Surveiller l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (_user) => {
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.currentUser && !authLoading) {
        navigate('/login');
        return;
      }

      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: auth.currentUser.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              city: userData.city || '',
              postalCode: userData.postalCode || '',
              photoURL: userData.photoURL || ''
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false); // Toujours passer loading à false, même en cas d'erreur
      }
    };

    // Ne lancer fetchUserProfile que lorsque authLoading est terminé
    if (!authLoading) {
      fetchUserProfile();
    }
  }, [auth.currentUser, navigate, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Vous devez être connecté pour modifier votre profil');
      return;
    }

    setSaving(true);
    try {
      // Mise à jour des données dans Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Création d'un objet avec seulement les champs définis
      const userData: Record<string, any> = {};
      
      if (profile.firstName !== undefined) userData.firstName = profile.firstName;
      if (profile.lastName !== undefined) userData.lastName = profile.lastName;
      if (profile.phone !== undefined) userData.phone = profile.phone || '';
      if (profile.address !== undefined) userData.address = profile.address || '';
      if (profile.city !== undefined) userData.city = profile.city || '';
      if (profile.postalCode !== undefined) userData.postalCode = profile.postalCode || '';
      if (profile.latitude !== undefined) userData.latitude = profile.latitude;
      if (profile.longitude !== undefined) userData.longitude = profile.longitude;

      console.log('Données à mettre à jour:', userData);
      console.log('ID utilisateur:', auth.currentUser.uid);
      console.log('Référence document:', userRef.path);

      // Ne mettre à jour que si nous avons des données à mettre à jour
      if (Object.keys(userData).length > 0) {
        await updateDoc(userRef, userData);
        console.log('Document mis à jour avec succès');
      } else {
        console.log('Aucune donnée à mettre à jour');
      }

      // Mise à jour de l'email si modifié
      if (profile.email && profile.email !== auth.currentUser.email) {
        try {
          console.log('Mise à jour de l\'email:', profile.email);
          await updateEmail(auth.currentUser, profile.email);
          console.log('Email mis à jour avec succès');
        } catch (error: any) {
          console.error('Erreur lors de la mise à jour de l\'email:', error);
          if (error.code === 'auth/requires-recent-login') {
            toast.error('Pour des raisons de sécurité, veuillez vous reconnecter pour modifier votre email');
            return;
          }
          throw error;
        }
      }

      toast.success('Profil mis à jour avec succès');

      // Recharger les données mises à jour
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        const updatedData = updatedDoc.data() as UserProfile;
        console.log('Données récupérées après mise à jour:', updatedData);
        setProfile({
          ...updatedData,
          email: auth.currentUser.email || ''
        });
      } else {
        console.warn('Le document mis à jour n\'existe pas');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleAddressSelect = (address: string, city: string, postalCode: string, lat: number, lng: number) => {
    setProfile(prev => ({
      ...prev,
      address,
      city,
      postalCode,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && auth.currentUser) {
      const file = e.target.files[0];
      
      // Vérifier la taille du fichier (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error('La taille du fichier doit être inférieure à 1MB');
        return;
      }

      // Vérifier le type du fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image');
        return;
      }

      try {
        setSaving(true);
        const storage = getStorage();
        const storageRef = ref(storage, `profile-photos/${auth.currentUser.uid}`);
        
        // Uploader le fichier
        await uploadBytes(storageRef, file);
        
        // Obtenir l'URL de téléchargement
        const downloadURL = await getDownloadURL(storageRef);
        
        // Mettre à jour le profil dans Firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          photoURL: downloadURL
        });

        // Mettre à jour l'état local
        setProfile(prev => ({
          ...prev,
          photoURL: downloadURL
        }));

        toast.success('Photo de profil mise à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'upload de la photo:', error);
        toast.error('Erreur lors de la mise à jour de la photo de profil');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté et le chargement est terminé
  if (!auth.currentUser && !authLoading) {
    navigate('/login');
    return null;
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
                    location.pathname.includes('/client/settings') || location.pathname.includes('/client/securite')
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
                    {profile.photoURL ? (
                      <img 
                        src={profile.photoURL} 
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-blue-100" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{profile.firstName} {profile.lastName}</span>
                  <ChevronDown className="h-4 w-4 text-gray-300 hidden md:block" />
                </button>
                
                {/* Menu déroulant */}
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 transform origin-top-right">
                  <div className="py-2 px-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{profile.firstName} {profile.lastName}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/client/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</Link>
                    <button 
                      onClick={handleSignOut}
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

      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#244257] mb-2">Paramètres du compte</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 mb-8">
            <button className="bg-[#244257] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#1a3244] transition-colors duration-200 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Mon Profil</span>
            </button>
            <Link to="/client/securite">
              <button className="bg-white text-[#244257] px-6 py-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Sécurité</span>
              </button>
            </Link>
          </div>

          {/* Main Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Confidentiality Notice */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start space-x-4 mb-8">
              <Lock className="h-6 w-6 text-[#244257] flex-shrink-0 mt-1" />
              <div>
                <p className="text-[#244257] font-semibold mb-1">
                  Ces données sont confidentielles
                </p>
                <p className="text-gray-600 text-sm">
                  Nous ne recueillerons et n'utiliserons les informations que de manière utile pour vous et d'une manière compatible avec vos droits.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#244257] transition-colors duration-200 overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                  />
                  {profile.photoURL ? (
                    <img 
                      src={profile.photoURL} 
                      alt="Photo de profil"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Photo de profil</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Photo de profil</h3>
                  <p className="text-sm text-gray-500">Format JPG ou PNG. Taille max 1MB</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={profile.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-[#244257]" />
                  Adresse
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    {scriptLoaded ? (
                      <AddressAutocomplete 
                        value={profile.address} 
                        onChange={(value) => handleInputChange({ target: { name: 'address', value } } as any)} 
                        onSelect={handleAddressSelect} 
                      />
                    ) : (
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={profile.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                        placeholder="Chargement de l'autocomplétion..."
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={profile.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                      placeholder="Votre ville"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      value={profile.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                      placeholder="Code postal"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#244257] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#1a3244] transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <span>Enregistrer les modifications</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Toaster pour les notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#28a745',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#dc3545',
              color: '#fff',
            },
          },
        }}
      />
    </div>
  );
}