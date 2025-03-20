import React, { useState, useRef } from 'react';
import { Search, MapPin, Calendar, Clock, Building2, Shield, Wallet, CheckCircle, ArrowRight, Briefcase, Calculator, PiggyBank, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { auth } from './firebase'; // Assure-toi que le chemin est correct
import { useAuthState } from 'react-firebase-hooks/auth';

type BrokerType = 'assurance' | 'realestate' | 'credit' | 'retirement' | 'tax' | 'recruitment' | 'all';

function App() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Vérifier l'état de l'utilisateur connecté
  const [user, loading, error] = useAuthState(auth);

  const [selectedType, setSelectedType] = useState<BrokerType>('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setCoordinates({ lat, lng });
      setSearchLocation(place.formatted_address || '');
    } else {
      alert('Impossible de récupérer les coordonnées de l’adresse. Veuillez sélectionner une adresse valide.');
    }
  };

  const handleSearch = () => {
    if (!searchLocation) {
      alert('Veuillez entrer une localisation.');
      return;
    }
    const queryParams = new URLSearchParams({
      location: searchLocation,
      type: selectedType,
      ...(coordinates ? { lat: coordinates.lat.toString(), lng: coordinates.lng.toString() } : {}),
    });
    navigate(`/results?${queryParams.toString()}`);
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Chargement de Google Maps...</div>;
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Erreur lors du chargement de Google Maps: {loadError.message}
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    console.error('Erreur lors de la vérification de l’authentification:', error);
    return <div className="min-h-screen flex items-center justify-center">Erreur: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white fixed shadow-sm w-3/5 z-10 rounded-md left-1/2 -translate-x-1/2 mt-2">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-950" />
              <span className="text-2xl font-bold text-blue-950">MonCourtier</span>
            </div>
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex space-x-8">
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">Comment ça marche</a>
                <a href="#services" className="text-gray-700 hover:text-blue-600">Nos services</a>
                <a href="#advantages" className="text-gray-700 hover:text-blue-600">Avantages</a>
              </nav>
              <Link 
                to={user ? "/client" : "/login"} // Redirige vers /dashboard si connecté, sinon /login
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <User className="h-5 w-5" />
                <span>{user ? "Espace Client" : "Connexion"}</span> {/* Change le texte selon l'état */}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-950 to-indigo-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Trouvez le courtier idéal<br />pour concrétiser vos projets
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Prenez rendez-vous en quelques clics avec des courtiers professionnels dans tous les domaines.
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl mx-auto transform hover:scale-105 transition-transform duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
                <Autocomplete
                  onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                  onPlaceChanged={handlePlaceChanged}
                  restrictions={{ country: 'fr' }}
                >
                  <input
                    type="text"
                    placeholder="Où ? (ville, code postal)"
                    className="pl-12 w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </Autocomplete>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
                <select
                  className="pl-12 w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as BrokerType)}
                >
                  <option value="all">Tous les types de courtiers</option>
                  <option value="assurance">Courtier en Assurance</option>
                  <option value="realestate">Courtier Immobilier</option>
                  <option value="credit">Courtier en Crédit</option>
                  <option value="retirement">Courtier en Retraite</option>
                  <option value="tax">Courtier en Fiscalité</option>
                  <option value="recruitment">Courtier en Recrutement</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="w-full mt-4 bg-blue-950 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Rechercher un courtier</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos domaines d'expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <Shield className="h-12 w-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Assurance</h3>
            <p className="text-gray-600 mb-4">Protection optimale pour vous et vos biens avec nos courtiers spécialisés.</p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Assurance Vie
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Auto & Habitation
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Prévoyance
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <Building2 className="h-12 w-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Immobilier</h3>
            <p className="text-gray-600 mb-4">Accompagnement personnalisé pour vos projets immobiliers.</p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Achat & Vente
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Investissement locatif
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Estimation gratuite
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <Wallet className="h-12 w-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Crédit</h3>
            <p className="text-gray-600 mb-4">Solutions de financement adaptées à vos besoins.</p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Prêt immobilier
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Rachat de crédit
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Crédit professionnel
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <PiggyBank className="h-12 w-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Retraite</h3>
            <p className="text-gray-600 mb-4">Préparez votre avenir avec nos experts en retraite.</p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Plan d'épargne retraite
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Conseil patrimonial
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Optimisation fiscale
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <Calculator className="h-12 w-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Fiscalité</h3>
            <p className="text-gray-600 mb-4">Optimisez votre situation fiscale avec nos experts.</p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Défiscalisation
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Conseil en investissement
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Optimisation IR/IFI
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <Briefcase className="h-12 w-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-semibold mb-4">Recrutement</h3>
            <p className="text-gray-600 mb-4">Trouvez les meilleurs talents pour votre entreprise.</p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Recrutement cadres
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Chasse de têtes
              </li>
              <li className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Conseil RH
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div id="how-it-works" className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Recherchez</h3>
              <p className="text-gray-600">Trouvez le courtier qui correspond à vos besoins selon sa spécialité et sa localisation.</p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Réservez</h3>
              <p className="text-gray-600">Choisissez un créneau qui vous convient et prenez rendez-vous en quelques clics.</p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Rencontrez</h3>
              <p className="text-gray-600">Échangez avec votre courtier et bénéficiez de son expertise pour votre projet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advantages Section */}
      <div id="advantages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Pourquoi choisir MonCourtier ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Courtiers certifiés</h3>
            <p className="text-gray-600">Tous nos courtiers sont des professionnels agréés</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Gain de temps</h3>
            <p className="text-gray-600">Prise de rendez-vous rapide et simple</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Service gratuit</h3>
            <p className="text-gray-600">Aucun frais pour utiliser notre plateforme</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Expertise locale</h3>
            <p className="text-gray-600">Des courtiers qui connaissent votre région</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;