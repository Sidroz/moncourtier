import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getAuth, updateEmail, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast, Toaster } from 'react-hot-toast';
import { LoadScript } from '@react-google-maps/api';
import { Calendar, LogOut, User, Lock, MapPin, Shield, ArrowRight, HelpCircle, Upload } from 'lucide-react';
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
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [auth.currentUser, navigate, authLoading]);

  // Surveiller l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (_user) => {
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              <button className="px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-800">
                Rendez-vous
              </button>
              <button className="px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-800">
                Vos Courtiers
              </button>
              <Link 
                to="/client/settings" 
                className={`px-4 py-2 rounded-lg hover:bg-gray-100 ${
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
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm">{profile.firstName} {profile.lastName}</span>
                <button 
                  onClick={handleSignOut}
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
            <Link to="/client/security">
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

            <LoadScript 
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
              onLoad={() => setScriptLoaded(true)}
              onError={(error) => console.error('Google Maps script failed to load', error)}
              libraries={['places']}
            >
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
            </LoadScript>
          </div>
        </div>
      </div>
      
      {/* Toaster pour les notifications */}
      <Toaster 
        position="top-right"
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