import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { User, Calendar } from 'lucide-react';
import { FaMapPin, FaSquareFacebook, FaLinkedin } from "react-icons/fa6";


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
                  className="bg-white rounded border border-gray-200 h-[300px] p-4 content-center"
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
                      <div className="ml-2.5">
                      <h3 className="font-roboto font-semibold text-xl text-[#244257]">
                        {courtier.firstName} {courtier.lastName}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <FaMapPin className="h-4 w-4 text-gray-600" />
                          <p className="text-sm text-gray-600">{courtier.firmAddress}</p>
                        </div>
                        <div className="mt-2 inline-flex flex-wrap space-x-2">
                          {courtier.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="font-roboto capitalize inline-block bg-[#244257]/20 text-gray-700 text-xs h-[35px] flex items-center justify-center px-5 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex space-x-2.5 mb-4">
                        <button className="w-[150px] py-2 bg-[#3892d2] text-white rounded-2xl text-base font-medium hover:bg-blue-400">
                          VOIR PROFIL
                        </button>
                        <button className="w-[270px] py-2 bg-[#244257] text-white rounded-2xl text-base font-medium hover:bg-blue-800">
                        PRENDRE RENDEZ-VOUS
                        </button>
                      </div>
                      <div className="w-[150px] flex justify-center">
                        <div className="flex space-x-2">
                          <FaLinkedin className="h-5 w-5 text-[#244257] hover:text-blue-600" />
                          <FaSquareFacebook className="h-5 w-5 text-[#244257] hover:text-blue-600" />
                        </div>
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