import React, { useState, useRef } from 'react';
import { Calendar, User, Lock, Building2, Phone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { Autocomplete, LoadScript } from '@react-google-maps/api';

// Définir libraries en dehors du composant pour éviter les rechargements inutiles
const libraries: ('places')[] = ['places'];

export default function BrokerSignup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [firmName, setFirmName] = useState('');
  const [firmAddress, setFirmAddress] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [website, setWebsite] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Définir specialtiesOptions à l'intérieur du composant
  const specialtiesOptions = ['assurance', 'habitation', 'crédit', 'investissement', 'épargne'];

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
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!coordinates) {
      alert('Veuillez sélectionner une adresse valide via l’autocomplétion.');
      return;
    }
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
      console.error('Erreur lors de l’inscription :', err);
      alert('Erreur d’inscription : ' + (err as Error).message);
    }
  };

  const renderProgressBar = () => (
    <div className="flex justify-between mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`w-1/4 h-2 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Erreur de configuration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            La clé API Google Maps n’est pas définie. Veuillez ajouter VITE_GOOGLE_MAPS_API_KEY dans le fichier .env.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={libraries}
      onError={(err) => {
        console.error('Erreur lors du chargement de l’API Google Maps :', err);
        setApiError('Impossible de charger l’API Google Maps. Vérifiez votre clé API et votre connexion.');
      }}
    >
      {apiError ? (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Erreur de chargement
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">{apiError}</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Inscription Courtier - MonCourtier
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Créez votre compte courtier en quelques étapes
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {renderProgressBar()}

              {step === 1 && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse email
                    </label>
                    <div className="mt-1 relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmer le mot de passe
                    </label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Suivant
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <div className="mt-1 relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <div className="mt-1 relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Numéro de téléphone
                    </label>
                    <div className="mt-1 relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                      Photo de profil (facultatif)
                    </label>
                    <input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Cette photo sera affichée sur votre profil Courtier
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Suivant
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="firmName" className="block text-sm font-medium text-gray-700">
                      Nom du cabinet
                    </label>
                    <div className="mt-1 relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="firmName"
                        name="firmName"
                        type="text"
                        required
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="firmAddress" className="block text-sm font-medium text-gray-700">
                      Adresse du cabinet
                    </label>
                    <div className="mt-1 relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                          className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Entrez l’adresse de votre cabinet"
                        />
                      </Autocomplete>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Spécialités
                    </label>
                    <div className="mt-2 space-y-2">
                      {specialtiesOptions.map((specialty) => (
                        <div key={specialty} className="flex items-center">
                          <input
                            id={specialty}
                            type="checkbox"
                            checked={specialties.includes(specialty)}
                            onChange={() => handleSpecialtyChange(specialty)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={specialty} className="ml-2 text-sm text-gray-700">
                            {specialty}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      URL du site web (facultatif)
                    </label>
                    <div className="mt-1 relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="website"
                        name="website"
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      S'inscrire
                    </button>
                  </div>
                </form>
              )}

              {step === 4 && (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">Inscription réussie !</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Votre compte courtier a été créé avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Se connecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </LoadScript>
  );
}