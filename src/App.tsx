import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, Building2, Shield, Wallet, CheckCircle, ArrowRight, Briefcase, Calculator, PiggyBank, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { auth, db } from './firebase'; // Assure-toi que le chemin est correct
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

type BrokerType = 'assurance' | 'realestate' | 'credit' | 'retirement' | 'tax' | 'recruitment' | 'all';
type UserType = 'client' | 'courtier' | string | null;

function App() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Vérifier l'état de l'utilisateur connecté
  const [user, loading, error] = useAuthState(auth);
  const [userType, setUserType] = useState<UserType>(null);
  
  useEffect(() => {
    const fetchUserType = async () => {
      if (user) {
        try {
          // Vérification dans la collection 'users' (pour les clients)
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Données utilisateur de la collection 'users':", userData);
            // Si l'utilisateur existe dans 'users', c'est un client
            setUserType('client');
          } else {
            // Si non trouvé dans 'users', on vérifie dans 'courtiers'
            const brokerDocRef = doc(db, 'courtiers', user.uid);
            const brokerDoc = await getDoc(brokerDocRef);
            
            if (brokerDoc.exists()) {
              const brokerData = brokerDoc.data();
              console.log("Données utilisateur de la collection 'courtiers':", brokerData);
              // Si l'utilisateur existe dans 'courtiers', c'est un courtier
              setUserType('courtier');
            } else {
              console.log('Utilisateur non trouvé dans aucune collection');
              setUserType('client'); // Par défaut
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          setUserType('client'); // En cas d'erreur, on considère l'utilisateur comme client
        }
      } else {
        setUserType(null);
      }
    };

    fetchUserType();
  }, [user]);

  const [selectedType, setSelectedType] = useState<BrokerType>('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Fonction pour déterminer l'URL de redirection en fonction du type d'utilisateur
  const getUserDashboardUrl = () => {
    if (!user) return '/login';
    
    console.log("getUserDashboardUrl - userType:", userType);
    
    if (userType === 'courtier') {
      console.log("Redirection vers l'espace courtier");
      return '/courtier';
    }
    
    console.log("Redirection vers l'espace client");
    return '/client';
  };

  // Fonction pour obtenir le texte du lien en fonction du type d'utilisateur
  const getUserDashboardText = () => {
    if (!user) return 'Connexion';
    
    console.log("getUserDashboardText - userType:", userType);
    
    if (userType === 'courtier') {
      return 'Espace Courtier';
    }
    
    return 'Espace Client';
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setCoordinates({ lat, lng });
      setSearchLocation(place.formatted_address || '');
    } else {
      alert("Impossible de récupérer les coordonnées de l'adresse. Veuillez sélectionner une adresse valide.");
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
    console.error("Erreur lors de la vérification de l'authentification:", error);
    return <div className="min-h-screen flex items-center justify-center">Erreur: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white fixed shadow-xl w-11/12 z-50 rounded-2xl left-1/2 -translate-x-1/2 mt-6 border border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-950" />
              </div>
              <span className="text-2xl font-extrabold text-blue-950 tracking-tight">Courtizy</span>
            </div>
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex space-x-8">
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-950 font-medium transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-blue-950">Comment ça marche</a>
                <a href="#services" className="text-gray-700 hover:text-blue-950 font-medium transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-blue-950">Nos services</a>
                <a href="#advantages" className="text-gray-700 hover:text-blue-950 font-medium transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-blue-950">Avantages</a>
                <Link to="/pour-les-courtiers" className="text-gray-700 hover:text-blue-950 font-medium transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-blue-950">Vous êtes Courtiers ?</Link>
              </nav>
              <Link 
                to={getUserDashboardUrl()}
                className="flex items-center space-x-2 bg-blue-950 text-white py-2 px-4 rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md"
              >
                <User className="h-5 w-5" />
                <span>{getUserDashboardText()}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBmaWxsPSIjMTcyNTU0IiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iNzAyLjUiIGN5PSIzNzQuNSIgcj0iMTc4LjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iNTI1IiBjeT0iNDk3IiByPSIxMTkiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iOTAyLjUiIGN5PSIyNTcuNSIgcj0iODMuNSIvPjxjaXJjbGUgc3Ryb2tlPSIjMUEzMjY4IiBzdHJva2Utd2lkdGg9IjIiIGN4PSI3MDYuNSIgY3k9IjMxNC41IiByPSIzMS41Ii8+PGNpcmNsZSBzdHJva2U9IiMxQTMyNjgiIHN0cm9rZS13aWR0aD0iMiIgY3g9IjYwMi41IiBjeT0iNDY1LjUiIHI9IjQxLjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iODY3IiBjeT0iMzQzIiByPSIzMSIvPjwvZz48L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
              Trouvez le courtier idéal<br />pour <span className="text-blue-200">réussir</span> vos projets
            </h1>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-light">
              Notre plateforme vous connecte en quelques clics avec les meilleurs courtiers professionnels près de chez vous.
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-4xl mx-auto transform hover:translate-y-[-5px] transition-all duration-300 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <MapPin className="absolute left-4 top-5 h-6 w-6 text-blue-950" />
                <Autocomplete
                  onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                  onPlaceChanged={handlePlaceChanged}
                  restrictions={{ country: 'fr' }}
                >
                  <input
                    type="text"
                    placeholder="Où ? (ville, code postal)"
                    className="pl-14 w-full h-16 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:border-transparent shadow-sm text-lg"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </Autocomplete>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-5 h-6 w-6 text-blue-950" />
                <select
                  className="pl-14 w-full h-16 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:border-transparent shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%236B7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat text-lg"
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
              className="w-full mt-8 bg-gradient-to-r from-blue-950 to-indigo-900 text-white py-5 rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center space-x-3 font-medium text-xl"
            >
              <span>Rechercher un courtier</span>
              <ArrowRight className="h-6 w-6 ml-2 animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">Domaines de nos courtiers partenaires</h2>
        <p className="text-center text-gray-600 text-xl mb-16 max-w-3xl mx-auto">
          Trouvez le courtier spécialisé qui correspond à vos besoins parmi notre réseau de professionnels qualifiés
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
              <Shield className="h-12 w-12 text-blue-950" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Assurance</h3>
            <p className="text-gray-600 mb-6">Rencontrez des courtiers en assurance pour une protection optimale de vos biens.</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Assurance Vie</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Auto & Habitation</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Prévoyance</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
              <Building2 className="h-12 w-12 text-blue-950" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Immobilier</h3>
            <p className="text-gray-600 mb-6">Découvrez des courtiers immobiliers pour un accompagnement personnalisé dans vos projets.</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Achat & Vente</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Investissement locatif</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Estimation gratuite</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
              <Wallet className="h-12 w-12 text-blue-950" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Crédit</h3>
            <p className="text-gray-600 mb-6">Entrez en contact avec des experts en crédit pour des solutions de financement adaptées.</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Prêt immobilier</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Rachat de crédit</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Crédit professionnel</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
              <PiggyBank className="h-12 w-12 text-blue-950" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Retraite</h3>
            <p className="text-gray-600 mb-6">Rencontrez des spécialistes en retraite pour préparer sereinement votre avenir.</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Plan d'épargne retraite</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Conseil patrimonial</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Optimisation fiscale</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
              <Calculator className="h-12 w-12 text-blue-950" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Fiscalité</h3>
            <p className="text-gray-600 mb-6">Échangez avec des courtiers fiscalistes pour optimiser votre situation patrimoniale.</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Défiscalisation</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Conseil en investissement</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Optimisation IR/IFI</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
              <Briefcase className="h-12 w-12 text-blue-950" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Recrutement</h3>
            <p className="text-gray-600 mb-6">Connectez-vous avec des courtiers en recrutement pour trouver les meilleurs talents.</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Recrutement cadres</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Chasse de têtes</span>
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span>Conseil RH</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">Comment ça marche ?</h2>
          <p className="text-center text-gray-600 text-xl mb-16 max-w-3xl mx-auto">
            Un processus simple et efficace pour trouver votre courtier en quelques minutes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-100 -z-10 transform -translate-y-1/2"></div>
            
            <div className="bg-white rounded-2xl p-10 text-center shadow-md border border-gray-100 relative z-10">
              <div className="w-20 h-20 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-2xl font-bold">1</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Recherchez</h3>
              <p className="text-gray-600">Trouvez le courtier qui correspond à vos besoins selon sa spécialité et sa localisation.</p>
            </div>

            <div className="bg-white rounded-2xl p-10 text-center shadow-md border border-gray-100 relative z-10">
              <div className="w-20 h-20 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-2xl font-bold">2</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Réservez</h3>
              <p className="text-gray-600">Choisissez un créneau qui vous convient et prenez rendez-vous en quelques clics.</p>
            </div>

            <div className="bg-white rounded-2xl p-10 text-center shadow-md border border-gray-100 relative z-10">
              <div className="w-20 h-20 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-2xl font-bold">3</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Rencontrez</h3>
              <p className="text-gray-600">Échangez avec votre courtier et bénéficiez de son expertise pour votre projet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advantages Section */}
      <div id="advantages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">Pourquoi choisir Courtizy ?</h2>
        <p className="text-center text-gray-600 text-xl mb-16 max-w-3xl mx-auto">
          La plateforme qui simplifie votre mise en relation avec des courtiers professionnels
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-blue-950" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Courtiers certifiés</h3>
            <p className="text-gray-600">Tous les courtiers de notre réseau sont des professionnels agréés et expérimentés</p>
          </div>
          
          <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-blue-950" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Gain de temps</h3>
            <p className="text-gray-600">Trouvez rapidement le courtier idéal grâce à notre interface intuitive</p>
          </div>

          <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-blue-950" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Service gratuit</h3>
            <p className="text-gray-600">Notre service de mise en relation est entièrement gratuit pour les utilisateurs</p>
          </div>

          <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-blue-950" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Expertise locale</h3>
            <p className="text-gray-600">Notre réseau vous connecte avec des courtiers qui connaissent parfaitement votre région</p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Vous êtes un courtier professionnel ?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Rejoignez notre réseau et développez votre activité en vous connectant avec des clients qualifiés.
          </p>
          <Link 
            to="/pour-les-courtiers" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-950 to-indigo-900 text-white rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 font-medium"
          >
            Découvrir notre processus de recrutement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-blue-950 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <Calendar className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold">Courtizy</span>
            </div>
            <div className="flex flex-wrap gap-5 justify-center">
              <Link to="/pour-les-courtiers" className="text-white hover:text-blue-200 transition-colors">Espace Courtiers</Link>
              <a href="#how-it-works" className="text-white hover:text-blue-200 transition-colors">Comment ça marche</a>
              <a href="#services" className="text-white hover:text-blue-200 transition-colors">Nos services</a>
              <a href="#" className="text-white hover:text-blue-200 transition-colors">Mentions légales</a>
              <a href="#" className="text-white hover:text-blue-200 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-indigo-900 text-center text-blue-200">
            <p>© {new Date().getFullYear()} Courtizy. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;