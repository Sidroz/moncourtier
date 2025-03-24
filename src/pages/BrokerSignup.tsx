import React, { useState, useRef, useEffect } from 'react';
import { Calendar, User, Lock, Building2, Phone, Globe, Check, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

// Définir libraries en dehors du composant pour éviter les rechargements inutiles
const libraries: ('places')[] = ['places'];

// Styles communs pour les inputs qui seront réutilisés
const inputClasses = "pl-10 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm py-3";
const buttonClasses = "flex items-center justify-center py-4 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200";
const secondaryButtonClasses = "flex items-center py-4 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200";

export default function BrokerSignup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [firmName, setFirmName] = useState('');
  const [firmAddress, setFirmAddress] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [website, setWebsite] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Utiliser useJsApiLoader au lieu de LoadScript
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Effet pour créer une URL pour la prévisualisation de la photo
  useEffect(() => {
    if (photo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(photo);
    } else {
      setPhotoPreview(null);
    }
  }, [photo]);

  // Définir specialtiesOptions à l'intérieur du composant
  const specialtiesOptions = [
    { id: 'assurance', label: 'Assurance', icon: '🛡️' },
    { id: 'habitation', label: 'Habitation', icon: '🏠' },
    { id: 'crédit', label: 'Crédit', icon: '💰' },
    { id: 'investissement', label: 'Investissement', icon: '📈' },
    { id: 'épargne', label: 'Épargne', icon: '💼' }
  ];

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setCoordinates({ lat, lng });
      setFirmAddress(place.formatted_address || '');
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSpecialtyChange = (specialty: string) => {
    setSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!coordinates) {
      alert("Veuillez sélectionner une adresse valide via l'autocomplétion.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let photoUrl = null;
      if (photo) {
        const photoRef = ref(storage, `courtiers/${user.uid}/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoUrl = await getDownloadURL(photoRef);
      }

      await setDoc(doc(db, 'courtiers', user.uid), {
        firstName,
        lastName,
        email,
        phone,
        firmName,
        firmAddress,
        specialties,
        website: website || null,
        type: 'courtier',
        photoUrl,
        location: { lat: coordinates.lat, lng: coordinates.lng },
      });

      console.log('Courtier inscrit avec succès dans Firestore');
      handleNext();
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      alert("Erreur d'inscription : " + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="flex justify-between mb-10 relative">
      <div className="absolute h-1 bg-gray-200 top-1/2 left-0 right-0 -translate-y-1/2 z-0"></div>
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="z-10 flex flex-col items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              s < step ? 'bg-green-500 text-white' : 
              s === step ? 'bg-blue-600 text-white' : 
              'bg-white border-2 border-gray-300 text-gray-400'
            }`}
          >
            {s < step ? (
              <Check className="h-5 w-5" />
            ) : (
              <span>{s}</span>
            )}
          </div>
          <span 
            className={`mt-2 text-xs font-medium ${
              s <= step ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            {s === 1 ? 'Compte' : 
             s === 2 ? 'Profil' : 
             s === 3 ? 'Cabinet' : 
             'Terminé'}
          </span>
        </div>
      ))}
    </div>
  );

  // Vérifier si Google Maps API est en cours de chargement
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-700 font-medium">Chargement de Google Maps...</p>
      </div>
    );
  }

  // Vérifier s'il y a une erreur de chargement
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-10 shadow-xl rounded-xl">
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Erreur de chargement
            </h2>
            <p className="mt-4 text-center text-sm text-gray-600">
              Impossible de charger l'API Google Maps. Vérifiez votre clé API et votre connexion.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4 shadow-lg">
            <Calendar className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            MonCourtier
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Créez votre compte professionnel
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-500">
          <div className="px-8 pt-8">
            {renderProgressBar()}
          </div>

          <div className="p-8 md:p-10">
            {step === 1 && (
              <form className="space-y-7" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Créez votre compte</h2>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputClasses}`}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClasses}`}
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">8 caractères minimum avec lettres et chiffres</p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClasses}`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className={`w-full ${buttonClasses}`}
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-center text-xs text-gray-500 mt-4">
                  En créant un compte, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité
                </p>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-7" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos informations personnelles</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`${inputClasses}`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`${inputClasses}`}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${inputClasses}`}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-3">
                    Photo de profil
                  </label>
                  <div className="mt-2 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <div className="flex-shrink-0">
                      <div className={`h-28 w-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 ${photoPreview ? 'border-blue-500' : 'border-gray-300'} shadow-md`}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Prévisualisation" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-16 w-16 text-gray-300" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                      />
                      <label 
                        htmlFor="photo"
                        className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        {photoPreview ? 'Changer de photo' : 'Ajouter une photo'}
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        JPG, PNG ou GIF, 2 Mo max. <br/>
                        Une photo professionnelle améliore votre crédibilité.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className={secondaryButtonClasses}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    className={buttonClasses}
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form className="space-y-7" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations du cabinet</h2>
                
                <div>
                  <label htmlFor="firmName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du cabinet
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firmName"
                      name="firmName"
                      type="text"
                      required
                      value={firmName}
                      onChange={(e) => setFirmName(e.target.value)}
                      className={`${inputClasses}`}
                      placeholder="Nom de votre cabinet"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="firmAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse du cabinet
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <Autocomplete
                      onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                      onPlaceChanged={handlePlaceChanged}
                      restrictions={{ country: 'fr' }}
                    >
                      <input
                        id="firmAddress"
                        name="firmAddress"
                        type="text"
                        required
                        value={firmAddress}
                        onChange={(e) => setFirmAddress(e.target.value)}
                        className={`${inputClasses}`}
                        placeholder="Entrez l'adresse de votre cabinet"
                      />
                    </Autocomplete>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Sélectionnez une adresse dans la liste pour validation
                  </p>
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Site web (facultatif)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className={`${inputClasses}`}
                      placeholder="https://www.votrecabinet.fr"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Spécialités
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {specialtiesOptions.map((specialty) => (
                      <div 
                        key={specialty.id} 
                        onClick={() => handleSpecialtyChange(specialty.id)}
                        className={`relative rounded-lg border ${
                          specialties.includes(specialty.id) 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        } p-5 flex cursor-pointer transition-all duration-200 hover:shadow-md`}
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-4">{specialty.icon}</span>
                          <span className="text-base font-medium text-gray-900">{specialty.label}</span>
                        </div>
                        {specialties.includes(specialty.id) && (
                          <div className="absolute top-3 right-3">
                            <Check className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className={secondaryButtonClasses}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${buttonClasses} ${
                      isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        S'inscrire
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie !</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Votre compte courtier a été créé avec succès. Vous pouvez maintenant vous connecter pour commencer à utiliser la plateforme MonCourtier.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className={`inline-flex ${buttonClasses} text-base px-8`}
                >
                  Se connecter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà inscrit ? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Connectez-vous</a>
        </p>
      </div>
    </div>
  );
}