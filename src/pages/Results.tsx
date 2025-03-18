import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Calendar } from 'lucide-react';

// Mock data for demonstration
const mockBrokers = [
  {
    id: 1,
    name: 'Sophie Martin',
    type: 'insurance',
    specialty: 'Assurance Vie',
    location: 'Paris',
    rating: 4.8,
    reviews: 127,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 2,
    name: 'Thomas Bernard',
    type: 'realestate',
    specialty: 'Immobilier Commercial',
    location: 'Lyon',
    rating: 4.9,
    reviews: 93,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 3,
    name: 'Marie Dubois',
    type: 'credit',
    specialty: 'Prêt Immobilier',
    location: 'Marseille',
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
  },
];

export default function Results() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';
  const type = searchParams.get('type') || 'all';

  // Filter brokers based on search params
  const filteredBrokers = mockBrokers.filter(broker => {
    const matchesLocation = location === '' || broker.location.toLowerCase().includes(location.toLowerCase());
    const matchesType = type === 'all' || broker.type === type;
    return matchesLocation && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </Link>
        </div>

        {/* Search Results */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {filteredBrokers.length} courtiers trouvés
          {location && ` à ${location}`}
          {type !== 'all' && ` en ${type}`}
        </h1>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrokers.map(broker => (
            <div key={broker.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={broker.image}
                    alt={broker.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{broker.name}</h3>
                    <p className="text-blue-600 font-medium">{broker.specialty}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(broker.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        ({broker.reviews} avis)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                    {broker.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2 text-gray-400" />
                    Téléphone disponible après réservation
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2 text-gray-400" />
                    Email disponible après réservation
                  </div>
                </div>

                <button className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Prendre rendez-vous
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}