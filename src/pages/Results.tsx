import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { User } from 'lucide-react';

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
  const type = searchParams.get('type') || ''; // Récupère "type" au lieu de "specialite_client"
  const location = searchParams.get('location') || ''; // Récupère "location" au lieu de "adresse_client"
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

        // Filtrer par localisation (approximation textuelle pour l’instant)
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Courtier en {type} près de {location}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des courtiers */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <p className="text-gray-600">Chargement...</p>
            ) : courtiers.length === 0 ? (
              <p className="text-gray-600">Aucun courtier trouvé pour ces critères.</p>
            ) : (
              courtiers.map((courtier) => (
                <div
                  key={courtier.id}
                  className="bg-white p-6 rounded-lg shadow flex items-start space-x-4"
                >
                  {courtier.photoUrl ? (
                    <img
                      src={courtier.photoUrl}
                      alt={`${courtier.firstName} ${courtier.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {courtier.firstName} {courtier.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{courtier.firmAddress}</p>
                    <div className="mt-4 flex space-x-4">
                      <button className="py-2 px-4 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50">
                        Voir le profil
                      </button>
                      <button className="py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Prendre rendez-vous
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Carte Google Maps */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 bg-white rounded-lg shadow p-4 h-[500px]">
              <LoadScript googleMapsApiKey="AIzaSyDznWGTL7RgpZeYbrkRiIaOHSni2-UYA8g">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={12}
                >
                  {courtiers.map((courtier) => (
                    <Marker
                      key={courtier.id}
                      position={defaultCenter} // À ajuster avec géocodage plus tard
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