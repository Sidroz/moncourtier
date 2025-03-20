import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { User, Calendar } from 'lucide-react';
import { FaMapPin, FaSquareFacebook, FaLinkedin } from 'react-icons/fa6';
import { getAvailableSlotsForNext7Days, AvailableSlot } from '../services/appointmentService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export default function Results() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || '';
  const location = searchParams.get('location') || '';
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const [courtiers, setCourtiers] = useState<Courtier[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 44.837789,
    lng: -0.57918,
  });

  useEffect(() => {
    const fetchCourtiers = async () => {
      try {
        if (lat && lng) {
          setMapCenter({ lat, lng });
        }

        const courtiersQuery = type && type !== 'all'
          ? query(collection(db, 'courtiers'), where('specialties', 'array-contains', type))
          : query(collection(db, 'courtiers'));

        const querySnapshot = await getDocs(courtiersQuery);
        const courtiersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Courtier[];

        let filteredCourtiers = courtiersData;
        if (lat && lng) {
          filteredCourtiers = courtiersData
            .filter((courtier) => courtier.location)
            .sort((a, b) => {
              const distanceA = Math.sqrt(
                Math.pow(a.location.lat - lat, 2) + Math.pow(a.location.lng - lng, 2)
              );
              const distanceB = Math.sqrt(
                Math.pow(b.location.lat - lat, 2) + Math.pow(b.location.lng - lng, 2)
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
  }, [type, lat, lng]);

  const getSlotsByDay = (slots: AvailableSlot[] = []) => {
    const grouped: { [key: string]: AvailableSlot[] } = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Erreur de configuration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            La clé API Google Maps n'est pas définie. Veuillez ajouter VITE_GOOGLE_MAPS_API_KEY dans le fichier .env.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <Calendar className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-lg font-semibold text-black">MonCourtier</h1>
        </div>
      </header>

      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center space-x-4">
          <span className="text-sm text-gray-700">Spécialité :</span>
          <span className="text-sm text-gray-900 bg-white px-2 py-1 rounded border border-gray-300">
            {type || 'Tous'}
          </span>
          <span className="text-sm text-gray-700">Localisation :</span>
          <span className="text-sm text-gray-900 bg-white px-2 py-1 rounded border border-gray-300">
            {location || 'Non spécifiée'}
          </span>
        </div>
      </div>

      <div className="py-6">
        <h2 className="text-xl font-bold text-black mb-4 text-center">
          Courtiers en {type || 'tous domaines'} disponibles près de {location || 'votre position'}
        </h2>
        <div className="max-w-7xl mx-auto px-4">
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
                    className="bg-white rounded-lg shadow-md p-6"
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
                            <button className="px-4 py-1.5 bg-[#3892d2] text-white rounded-full text-sm font-medium hover:bg-blue-400 w-full">
                              Voir le profil
                            </button>
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
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Colonne des créneaux */}
                      <div className="ml-8 pl-8 border-l border-gray-200">
                        <div className="flex flex-col">
                          <h4 className="text-base font-medium text-gray-900 mb-3">
                            Prochaines disponibilités
                          </h4>
                          {(() => {
                            if (!courtier.availableSlots) return null;
                            const slotsByDay = getSlotsByDay(courtier.availableSlots);

                            return (
                              <div className="flex space-x-3">
                                {Object.entries(slotsByDay).slice(0, 4).map(([date, slots]) => {
                                  const dayDate = new Date(date);
                                  return (
                                    <div key={date} className="flex flex-col items-center min-w-[90px]">
                                      <div className="text-sm text-gray-900 font-medium mb-1.5">
                                        {format(dayDate, 'EEEE', { locale: fr })}
                                        <div className="text-xs text-gray-500">
                                          {format(dayDate, 'd MMM', { locale: fr })}
                                        </div>
                                      </div>
                                      <div className="w-full flex flex-col gap-0.5">
                                        {slots.length > 0 ? (
                                          slots.slice(0, 4).map((slot, index) => (
                                            <Link
                                              key={index}
                                              to={`/appointment-booking/${courtier.id}?date=${slot.date}&time=${slot.startTime}`}
                                              className="text-center py-0.5 px-1 text-sm bg-blue-50 text-[#244257] hover:bg-[#244257] hover:text-white rounded transition-colors"
                                            >
                                              {slot.startTime}
                                            </Link>
                                          ))
                                        ) : (
                                          <div className="text-xs text-gray-500 text-center py-0.5">
                                            -
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                          {courtier.availableSlots && courtier.availableSlots.length > 0 && (
                            <button className="mt-2 text-sm text-[#244257] hover:text-blue-700">
                              Voir plus d'horaires
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Carte Google Maps */}
            <div className="lg:w-1/3">
              <div className="sticky top-6 h-[500px] rounded-lg overflow-hidden shadow-md">
                <LoadScript googleMapsApiKey={googleMapsApiKey}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={12}
                  >
                    {courtiers.map((courtier) => (
                      <Marker
                        key={courtier.id}
                        position={{
                          lat: courtier.location.lat,
                          lng: courtier.location.lng,
                        }}
                        title={`${courtier.firstName} ${courtier.lastName}`}
                      />
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}