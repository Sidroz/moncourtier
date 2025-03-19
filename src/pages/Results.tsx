import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { User, Calendar, Linkedin, Facebook } from 'lucide-react';

interface Courtier {
  id: string;
  firstName: string;
  lastName: string;
  firmAddress: string;
  photoUrl?: string;
  specialties: string[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 44.837789, // Bordeaux par défaut
  lng: -0.57918,
};

export default function Results() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || '';
  const location = searchParams.get('location') || '';
  const [courtiers, setCourtiers] = useState<Courtier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourtiers = async () => {
      try {
        const courtiersQuery = query(
          collection(db, 'courtiers'),
          where('specialties', 'array-contains', type)
        );
        const querySnapshot = await getDocs(courtiersQuery);
        const courtiersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Courtier[];

        const filteredCourtiers = courtiersData.filter((courtier) =>
          courtier.firmAddress.toLowerCase().includes(location.toLowerCase())
        );
        setCourtiers(filteredCourtiers);
      } catch (err) {
        console.error('Erreur lors de la récupération des courtiers :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourtiers();
  }, [type, location]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
          <Calendar className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-lg font-semibold text-black">MonCourtier</h1>
        </div>
      </header>

      {/* Barre de recherche */}
      <div className="bg-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center space-x-4">
          <span className="text-sm text-gray-700">Spécialité :</span>
          <span className="text-sm text-gray-900 bg-white px-2 py-1 rounded border border-gray-300">
            {type}
          </span>
          <span className="text-sm text-gray-700">Localisation :</span>
          <span className="text-sm text-gray-900 bg-white px-2 py-1 rounded border border-gray-300">
            {location}
          </span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="py-6">
        <h2 className="text-xl font-bold text-black mb-4 text-center">
          Courtiers en {type} disponibles près de {location}
        </h2>
        <div className="flex flex-col lg:flex-row gap-6 ml-20 mr-20">
          {/* Liste des courtiers */}
          <div className="space-y-3 w-[1200px]">
            {loading ? (
              <p className="text-gray-600">Chargement...</p>
            ) : courtiers.length === 0 ? (
              <p className="text-gray-600">Aucun courtier trouvé pour ces critères.</p>
            ) : (
              courtiers.map((courtier) => (
                <div
                  key={courtier.id}
                  className="bg-white rounded border border-gray-200 h-[300px] p-4"
                >
                  <div className="ml-5">
                    <div className="flex items-start">
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
                      <div className="ml-2.5 flex-1">
                        <h3 className="text-base font-semibold text-black">
                          {courtier.firstName} {courtier.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2.5">{courtier.firmAddress}</p>
                        <div className="mt-2 space-x-2">
                          {courtier.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex space-x-2.5 mb-4">
                        <button className="w-[150px] py-2 bg-blue-300 text-white rounded text-sm font-medium hover:bg-blue-400">
                          Voir Profil
                        </button>
                        <button className="w-[270px] py-2 bg-blue-700 text-white rounded text-sm font-medium hover:bg-blue-800">
                          Prendre Rendez-vous
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <Linkedin className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                        <Facebook className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Carte Google Maps */}
          <div className="ml-14 flex-1">
            <div className="bg-white rounded border border-gray-200 h-[calc(100vh-200px)]">
              <LoadScript googleMapsApiKey="TA_CLE_API_GOOGLE_MAPS">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={12}
                >
                  {courtiers.map((courtier) => (
                    <Marker
                      key={courtier.id}
                      position={defaultCenter} // À ajuster avec géocodage
                    />
                  ))}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}