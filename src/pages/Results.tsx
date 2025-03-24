import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { User, Calendar } from 'lucide-react';
import { FaMapPin, FaSquareFacebook, FaLinkedin } from 'react-icons/fa6';
import { getAvailableSlotsForNext7Days, AvailableSlot } from '../services/appointmentService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Courtier {
  id: string;
  firstName: string;
  lastName: string;
  firmAddress: string;
  photoUrl?: string;
  specialties: string[];
  location: { lat: number; lng: number };
  availableSlots?: AvailableSlot[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

// Composant principal qui gère le LoadScript
export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || '';
  const location = searchParams.get('location') || '';
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const [courtiers, setCourtiers] = useState<Courtier[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlots, setExpandedSlots] = useState<{ [key: string]: boolean }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedType, setEditedType] = useState(type);
  const [editedLocation, setEditedLocation] = useState(location);
  const [editedLat, setEditedLat] = useState<string>(searchParams.get('lat') || '');
  const [editedLng, setEditedLng] = useState<string>(searchParams.get('lng') || '');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 44.837789,
    lng: -0.57918,
  });
  const [hoveredCourtierId, setHoveredCourtierId] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(12);
  const [user] = useAuthState(auth);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isInitialMount = useRef(true);

  // Fonction pour centrer la carte sur un courtier
  const centerMapOnCourtier = (courtier: Courtier) => {
    if (courtier.location) {
      setMapCenter({
        lat: courtier.location.lat,
        lng: courtier.location.lng,
      });
      setMapZoom(17); // Zoom plus proche lorsqu'on survole un courtier
    }
  };

  // Mettre à jour les valeurs éditées quand les paramètres d'URL changent
  useEffect(() => {
    if (!isInitialMount.current) {
      setEditedType(type);
      setEditedLocation(location);
      setEditedLat(searchParams.get('lat') || '');
      setEditedLng(searchParams.get('lng') || '');
    }
    isInitialMount.current = false;
  }, [type, location, searchParams]);

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    if (editedType) newParams.set('type', editedType);
    if (editedLocation) newParams.set('location', editedLocation);
    if (editedLat) newParams.set('lat', editedLat);
    if (editedLng) newParams.set('lng', editedLng);
    setSearchParams(newParams);
    setIsEditing(false);
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const cityComponent = place.address_components?.find(component => 
        component.types.includes('locality') || component.types.includes('postal_town')
      );
      const cityName = cityComponent ? cityComponent.long_name : place.formatted_address || '';
      
      setEditedLocation(cityName);
      setEditedLat(place.geometry.location.lat().toString());
      setEditedLng(place.geometry.location.lng().toString());
      setMapCenter({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      const newParams = new URLSearchParams();
      if (editedType) newParams.set('type', editedType);
      newParams.set('location', cityName);
      newParams.set('lat', place.geometry.location.lat().toString());
      newParams.set('lng', place.geometry.location.lng().toString());
      setSearchParams(newParams);
    }
  };

  useEffect(() => {
    const fetchCourtiers = async () => {
      try {
        setLoading(true);
        if (editedLat && editedLng) {
          setMapCenter({ lat: parseFloat(editedLat), lng: parseFloat(editedLng) });
        }

        const courtiersQuery = editedType && editedType !== 'all'
          ? query(collection(db, 'courtiers'), where('specialties', 'array-contains', editedType))
          : query(collection(db, 'courtiers'));

        const querySnapshot = await getDocs(courtiersQuery);
        const courtiersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Courtier[];

        let filteredCourtiers = courtiersData;
        if (editedLat && editedLng) {
          filteredCourtiers = courtiersData
            .filter((courtier) => courtier.location)
            .sort((a, b) => {
              const distanceA = Math.sqrt(
                Math.pow(a.location.lat - parseFloat(editedLat), 2) + Math.pow(a.location.lng - parseFloat(editedLng), 2)
              );
              const distanceB = Math.sqrt(
                Math.pow(b.location.lat - parseFloat(editedLat), 2) + Math.pow(b.location.lng - parseFloat(editedLng), 2)
              );
              return distanceA - distanceB;
            });
        }

        const courtiersWithSlots = await Promise.all(
          filteredCourtiers.map(async (courtier) => {
            const availableSlots = await getAvailableSlotsForNext7Days(courtier.id);
            return {
              ...courtier,
              availableSlots
            };
          })
        );

        setCourtiers(courtiersWithSlots);
      } catch (err) {
        console.error('Erreur lors de la récupération des courtiers :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourtiers();
  }, [editedType, editedLat, editedLng]);

  const getSlotsByDay = (slots: AvailableSlot[] = []) => {
    const grouped: { [key: string]: AvailableSlot[] } = {};
    
    // D'abord, regrouper tous les créneaux par date
    slots.forEach(slot => {
      // Ne pas ajouter les jours vides (isEmpty)
      if (!slot.isEmpty) {
        if (!grouped[slot.date]) {
          grouped[slot.date] = [];
        }
        grouped[slot.date].push(slot);
      }
    });
    
    return grouped;
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const extractCity = (address: string) => {
    const parts = address.split(',');
    if (parts.length >= 2) {
      const cityPart = parts[0].trim().split(' ').slice(1).join(' ');
      return cityPart;
    }
    return address;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white shadow-sm w-3/5 z-10 rounded-md mx-auto mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-950" />
              <Link to="/" className="text-2xl font-bold text-blue-950 hover:text-blue-700 transition-colors">MonCourtier</Link>
            </div>
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex space-x-8">
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">Comment ça marche</a>
                <a href="#services" className="text-gray-700 hover:text-blue-600">Nos services</a>
                <a href="#advantages" className="text-gray-700 hover:text-blue-600">Avantages</a>
              </nav>
              <Link 
                to={user ? "/client" : "/login"}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <User className="h-5 w-5" />
                <span>{user ? "Espace Client" : "Connexion"}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100 mb-6">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">Spécialité</span>
                {isEditing ? (
                  <select
                    value={editedType}
                    onChange={(e) => setEditedType(e.target.value)}
                    className="text-sm font-semibold text-blue-950 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Tous</option>
                    <option value="immobilier">Immobilier</option>
                    <option value="assurance">Assurance</option>
                    <option value="expertise">Expertise</option>
                    <option value="finance">Finance</option>
                  </select>
                ) : (
                  <span className="text-sm font-semibold text-blue-950 bg-blue-50 px-3 py-1 rounded-full">
                    {type ? capitalizeFirstLetter(type) : 'Tous'}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">Localisation</span>
                {isEditing ? (
                  <div className="relative">
                    <Autocomplete
                      onLoad={(autocomplete) => {
                        autocompleteRef.current = autocomplete;
                        autocomplete.setComponentRestrictions({ country: 'fr' });
                      }}
                      onPlaceChanged={() => {
                        if (autocompleteRef.current) {
                          const place = autocompleteRef.current.getPlace();
                          if (place.address_components?.some(component => 
                            component.types.includes('country') && 
                            component.short_name === 'FR'
                          )) {
                            handlePlaceSelect(place);
                          } else {
                            alert('Veuillez sélectionner une adresse en France');
                            setEditedLocation('');
                          }
                        }
                      }}
                    >
                      <input
                        type="text"
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        placeholder="Entrez une ville"
                        className="text-sm font-semibold text-blue-950 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 w-40"
                      />
                    </Autocomplete>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-blue-950 bg-blue-50 px-3 py-1 rounded-full">
                    {editedLocation ? extractCity(editedLocation) : 'Non spécifiée'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium px-4 py-1.5 rounded-full hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSearch}
                    className="text-sm text-white bg-blue-950 hover:bg-blue-900 font-medium px-4 py-1.5 rounded-full"
                  >
                    Appliquer
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-950 hover:text-blue-700 font-medium flex items-center"
                >
                  <span>Modifier la recherche</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <h2 className="text-4xl text-black mb-12 text-center font-roboto">
          Courtiers en <span className="font-roboto font-bold">{editedType ? capitalizeFirstLetter(editedType) : 'tous domaines'}</span> disponibles près de <span className="font-roboto font-bold">{location ? extractCity(location) : 'votre position'}</span>
        </h2>
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="space-y-6 flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : courtiers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600">Aucun courtier trouvé pour ces critères.</p>
                </div>
              ) : (
                courtiers.map((courtier) => (
                  <div
                    key={courtier.id}
                    className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-blue-200 border border-transparent"
                    onMouseEnter={() => {
                      setHoveredCourtierId(courtier.id);
                      centerMapOnCourtier(courtier);
                    }}
                    onMouseLeave={() => {
                      setHoveredCourtierId(null);
                      setMapZoom(12); // Retour au zoom initial
                    }}
                  >
                    <div className="flex">
                      <div className="w-36">
                        {courtier.photoUrl ? (
                          <img
                            src={courtier.photoUrl}
                            alt={`${courtier.firstName} ${courtier.lastName}`}
                            className="w-36 h-36 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-16 w-16 text-gray-500" />
                          </div>
                        )}
                        <div className="mt-4">
                          <div className="flex space-x-2">
                            <Link
                              to={`/broker-profil/${courtier.id}`}
                              className="px-4 py-1.5 bg-[#3892d2] text-white rounded-full text-sm font-medium hover:bg-blue-400 w-full text-center"
                            >
                              Voir le profil
                            </Link>
                          </div>
                          <div className="mt-2">
                            <Link 
                              to={`/appointment-booking/${courtier.id}`}
                              className="block px-4 py-1.5 bg-[#244257] text-white rounded-full text-sm font-medium hover:bg-blue-700 text-center"
                            >
                              Prendre RDV
                            </Link>
                          </div>
                          <div className="mt-3 flex justify-center space-x-4">
                            <FaLinkedin className="h-5 w-5 text-[#244257] hover:text-blue-600 cursor-pointer" />
                            <FaSquareFacebook className="h-5 w-5 text-[#244257] hover:text-blue-600 cursor-pointer" />
                          </div>
                        </div>
                      </div>

                      <div className="ml-8 flex-1">
                        <div>
                          <h3 className="text-xl font-semibold text-[#244257]">
                            {courtier.firstName} {courtier.lastName}
                          </h3>
                          <div className="flex items-center mt-2">
                            <FaMapPin className="h-4 w-4 text-gray-600" />
                            <p className="ml-2 text-sm text-gray-600">{courtier.firmAddress}</p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {courtier.specialties.map((specialty) => (
                              <span
                                key={specialty}
                                className="inline-flex items-center px-5 py-1.5 rounded-full text-sm font-medium bg-[#244257]/20 text-gray-700"
                              >
                                {capitalizeFirstLetter(specialty)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="ml-8 pl-8 border-l border-gray-200 w-[600px]">
                        <div className="flex flex-col h-full">
                          <h4 className="text-base font-medium text-gray-900 mb-3">
                            Prochaines disponibilités
                          </h4>
                          <div className="flex-1 flex items-center">
                            {(() => {
                              if (!courtier.availableSlots || courtier.availableSlots.length === 0) {
                                return (
                                  <div className="flex items-center justify-center w-full text-gray-500 text-sm">
                                    Ce courtier ne propose pas la prise de rendez-vous en ligne
                                  </div>
                                );
                              }

                              const slotsByDay = getSlotsByDay(courtier.availableSlots);
                              const isExpanded = expandedSlots[courtier.id];
                              const allDates = Object.keys(slotsByDay).sort();
                              const nextAvailableDate = allDates[0];
                              const nextAvailableDateObj = new Date(nextAvailableDate);
                              const today = new Date();
                              const fiveDaysFromNow = new Date(today.setDate(today.getDate() + 5));

                              if (nextAvailableDateObj > fiveDaysFromNow) {
                                return (
                                  <div className="flex items-center justify-center w-full text-gray-500 text-sm">
                                    Prochain rendez-vous le {format(nextAvailableDateObj, 'd MMMM', { locale: fr })}
                                  </div>
                                );
                              }

                              return (
                                <div className="flex space-x-3 w-full justify-center">
                                  {Object.entries(slotsByDay)
                                    .filter(([_, slots]) => slots.length > 0)
                                    .slice(0, 5)
                                    .map(([date, slots]) => {
                                    const dayDate = new Date(date);
                                    
                                    return (
                                      <div key={date} className="flex flex-col items-center min-w-[90px]">
                                        <div className="text-sm text-gray-900 font-medium mb-1.5">
                                          {format(dayDate, 'EEEE', { locale: fr })}
                                          <div className="text-xs text-gray-500">
                                            {format(dayDate, 'd MMM', { locale: fr })}
                                          </div>
                                        </div>
                                        <div className="w-full flex flex-col gap-2">
                                          {slots.slice(0, isExpanded ? undefined : 4).map((slot, index) => (
                                            <Link
                                              key={index}
                                              to={`/appointment-booking/${courtier.id}?date=${slot.date}&time=${slot.startTime}`}
                                              className="text-center py-1.5 px-2 text-sm bg-blue-50 text-[#244257] hover:bg-[#244257] hover:text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md min-w-[80px]"
                                            >
                                              {slot.startTime}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                          {courtier.availableSlots && courtier.availableSlots.length > 0 && (
                            <button 
                              onClick={() => setExpandedSlots(prev => ({
                                ...prev,
                                [courtier.id]: !prev[courtier.id]
                              }))}
                              className="mt-2 text-sm text-[#244257] hover:text-blue-700 font-medium"
                            >
                              {expandedSlots[courtier.id] ? 'Afficher moins d\'horaires' : 'Afficher plus d\'horaires'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:w-1/3">
              <div className="sticky top-6 h-[500px] rounded-lg overflow-hidden shadow-md">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={mapZoom}
                >
                  {courtiers.map((courtier) => (
                    <Marker
                      key={courtier.id}
                      position={{
                        lat: courtier.location.lat,
                        lng: courtier.location.lng,
                      }}
                      title={`${courtier.firstName} ${courtier.lastName}`}
                      icon={{
                        url: hoveredCourtierId === courtier.id 
                          ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
                          : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        scaledSize: new google.maps.Size(
                          hoveredCourtierId === courtier.id ? 40 : 30, 
                          hoveredCourtierId === courtier.id ? 40 : 30
                        )
                      }}
                      animation={hoveredCourtierId === courtier.id ? google.maps.Animation.BOUNCE : undefined}
                    />
                  ))}
                </GoogleMap>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}