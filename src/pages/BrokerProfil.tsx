import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  User, 
  MapPin, 
  Clock, 
  Calendar,
  Phone, 
  Mail, 
  Globe, 
  CreditCard, 
  CheckCircle, 
  Award, 
  ThumbsUp, 
  Star,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { FaLinkedin, FaSquareFacebook, FaLocationDot, FaMoneyBill } from 'react-icons/fa6';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAvailableSlotsForNext7Days, AvailableSlot } from '../services/appointmentService';

interface Courtier {
  id: string;
  firstName: string;
  lastName: string;
  firmAddress: string;
  photoUrl?: string;
  specialties: string[];
  description?: string;
  location: { lat: number; lng: number };
  phone?: string;
  email?: string;
  website?: string;
  experience?: { value: number; unit: string };
  languages?: string[];
  paymentMethods?: string[];
  availableSlots?: AvailableSlot[];
  education?: string[];
  certifications?: string[];
  services?: string[];
  accessMethods?: string[];
}

const BrokerProfil: React.FC = () => {
  const { brokerId } = useParams<{ brokerId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courtier, setCourtier] = useState<Courtier | null>(null);
  const [activeTab, setActiveTab] = useState('about');
  const [availabilityExpanded, setAvailabilityExpanded] = useState(false);

  useEffect(() => {
    const fetchCourtierData = async () => {
      if (!brokerId) {
        navigate('/results');
        return;
      }

      try {
        setLoading(true);
        const courtierDoc = await getDoc(doc(db, 'courtiers', brokerId));
        
        if (courtierDoc.exists()) {
          const courtierData = {
            id: courtierDoc.id,
            ...courtierDoc.data(),
          } as Courtier;
          
          // Récupérer les créneaux disponibles
          const slots = await getAvailableSlotsForNext7Days(brokerId);
          courtierData.availableSlots = slots;
          
          setCourtier(courtierData);
        } else {
          navigate('/results');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données du courtier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourtierData();
  }, [brokerId, navigate]);

  const getSlotsByDay = (slots: AvailableSlot[] = []) => {
    const slotsByDay: Record<string, AvailableSlot[]> = {};
    
    slots.forEach(slot => {
      // Vérifier que le créneau est valide
      if (slot && slot.date) {
        const day = slot.date;
        if (!slotsByDay[day]) {
          slotsByDay[day] = [];
        }
        slotsByDay[day].push(slot);
      }
    });
    
    return slotsByDay;
  };

  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatExperience = (experience?: { value: number; unit: string }) => {
    if (!experience) return "Expérience non spécifiée";
    const { value, unit } = experience;
    if (unit === 'mois') {
      return value === 1 ? "1 mois d'expérience" : `${value} mois d'expérience`;
    } else {
      return value === 1 ? "1 an d'expérience" : `${value} ans d'expérience`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!courtier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">Courtier introuvable</h1>
        <Link to="/results" className="text-blue-600 hover:text-blue-800">
          Retour aux résultats
        </Link>
      </div>
    );
  }

  // Données fictives pour la démo (à remplacer par les vraies données du courtier)
  const demoData = {
    description: courtier.description || `${courtier.firstName} ${courtier.lastName} est un courtier professionnel spécialisé dans ${courtier.specialties.join(', ')}. Fort d'une expérience significative dans le domaine, il accompagne ses clients dans la réalisation de leurs projets avec expertise et dévouement.`,
    education: courtier.education || ["Master en Finance - Université de Bordeaux", "Licence en Économie - Université de Paris"],
    certifications: courtier.certifications || ["Certification ORIAS n°123456789", "Certification AMF"],
    services: courtier.services || ["Consultation personnalisée", "Analyse de besoins", "Recherche des meilleures offres", "Accompagnement jusqu'à la signature"],
    languages: courtier.languages || ["Français", "Anglais"],
    paymentMethods: courtier.paymentMethods || ["Carte bancaire", "Virement bancaire", "Espèces", "Chèque"],
    accessMethods: courtier.accessMethods || ["En cabinet", "À domicile", "Visioconférence"],
    experience: courtier.experience || { value: 8, unit: 'ans' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec photo de couverture */}
      <div className="relative h-40 bg-gradient-to-r from-blue-900 to-indigo-800">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-4 left-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center space-x-1 text-white bg-black bg-opacity-30 px-3 py-1.5 rounded-full hover:bg-opacity-50 transition-all"
          >
            <ArrowLeft size={16} />
            <span>Retour</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative p-6 sm:p-8 pt-6">
            {/* Photo de profil et informations principales */}
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 flex flex-col items-center md:items-start">
                <div className="relative -mt-4">
                  {courtier.photoUrl ? (
                    <img
                      src={courtier.photoUrl}
                      alt={`${courtier.firstName} ${courtier.lastName}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-md">
                      <User className="h-14 w-14 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full border-2 border-white">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="mt-5 text-center md:text-left">
                  <div className="text-xl font-semibold text-gray-900">
                    {courtier.firstName} {courtier.lastName}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                    {courtier.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {capitalizeFirstLetter(specialty)}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex items-center text-gray-600 justify-center md:justify-start">
                    <FaLocationDot className="h-4 w-4 text-gray-600" />
                    <p className="ml-2 text-sm">{courtier.firmAddress}</p>
                  </div>
                  
                  <div className="mt-3 flex items-center text-gray-600 justify-center md:justify-start">
                    <Award className="h-4 w-4 text-gray-600" />
                    <p className="ml-2 text-sm">{formatExperience(courtier.experience)}</p>
                  </div>
                  
                  <div className="mt-6">
                    <Link 
                      to={`/appointment-booking/${courtier.id}`}
                      className="inline-block w-full px-4 py-3 bg-blue-950 text-white rounded-md hover:bg-blue-800 text-center font-medium transition-colors"
                    >
                      Prendre rendez-vous
                    </Link>
                  </div>
                  
                  <div className="mt-4 flex justify-center md:justify-start space-x-4">
                    <FaLinkedin className="h-6 w-6 text-[#0077B5] hover:opacity-80 cursor-pointer" />
                    <FaSquareFacebook className="h-6 w-6 text-[#1877F2] hover:opacity-80 cursor-pointer" />
                    {courtier.website && (
                      <a href={courtier.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-6 w-6 text-gray-700 hover:text-gray-900" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:w-3/4 md:pl-8 mt-8 md:mt-0">
                {/* Onglets */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'about', name: 'À propos' },
                      { id: 'services', name: 'Services' },
                      { id: 'availability', name: 'Disponibilités' },
                      { id: 'contact', name: 'Contact' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm
                          ${activeTab === tab.id
                            ? 'border-blue-950 text-blue-950 font-semibold'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Contenu des onglets */}
                <div className="py-6">
                  {activeTab === 'about' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Présentation</h3>
                        <p className="mt-2 text-gray-600 leading-relaxed">
                          {demoData.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Formation et certifications</h3>
                        <div className="mt-2 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Formation</h4>
                            <ul className="mt-1 pl-5 list-disc text-gray-600">
                              {demoData.education.map((edu, index) => (
                                <li key={index}>{edu}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Certifications</h4>
                            <ul className="mt-1 pl-5 list-disc text-gray-600">
                              {demoData.certifications.map((cert, index) => (
                                <li key={index}>{cert}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Langues parlées</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {demoData.languages.map((lang, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'services' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Services proposés</h3>
                        <ul className="mt-3 pl-5 list-disc text-gray-600 space-y-2">
                          {demoData.services.map((service, index) => (
                            <li key={index} className="leading-relaxed">{service}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Modes d'accès</h3>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {demoData.accessMethods.map((method, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Moyens de paiement acceptés</h3>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {demoData.paymentMethods.map((method, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-50 text-gray-700">
                              <FaMoneyBill className="h-4 w-4 mr-2" />
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'availability' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Prochaines disponibilités</h3>
                      
                      {!courtier.availableSlots || courtier.availableSlots.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">
                            Ce courtier ne propose pas la prise de rendez-vous en ligne.
                          </p>
                          <p className="mt-2 text-gray-500">
                            Veuillez le contacter directement pour fixer un rendez-vous.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(getSlotsByDay(courtier.availableSlots))
                            .filter(([_, slots]) => slots.length > 0) // Filtrer les jours sans créneaux
                            .slice(0, availabilityExpanded ? undefined : 3)
                            .map(([date, slots]) => (
                              <div key={date} className="bg-white border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b">
                                  <div className="font-medium text-gray-900">
                                    {formatDay(date)}
                                  </div>
                                </div>
                                <div className="p-4">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {slots.map((slot, idx) => (
                                      <Link
                                        key={idx}
                                        to={`/appointment-booking/${courtier.id}?date=${slot.date}&time=${slot.startTime}`}
                                        className="text-center py-2 px-3 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                                      >
                                        {slot.startTime}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                          {courtier.availableSlots.length > 0 && (
                            <div className="text-center mt-4">
                              <Link 
                                to={`/appointment-booking/${courtier.id}`}
                                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Voir toutes les disponibilités
                              </Link>
                            </div>
                          )}
                          
                          <div className="bg-blue-50 rounded-lg p-4 mt-6 flex items-start">
                            <div className="flex-shrink-0 mr-4">
                              <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-blue-800">
                                Les rendez-vous sont d'une durée de 45 minutes. Vous recevrez une confirmation par email après votre réservation.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'contact' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Coordonnées</h3>
                        <div className="mt-4 space-y-4">
                          {courtier.phone && (
                            <div className="flex items-center">
                              <Phone className="h-5 w-5 text-gray-600 mr-3" />
                              <a href={`tel:${courtier.phone}`} className="text-blue-600 hover:text-blue-800">
                                {courtier.phone}
                              </a>
                            </div>
                          )}
                          
                          {courtier.email && (
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-gray-600 mr-3" />
                              <a href={`mailto:${courtier.email}`} className="text-blue-600 hover:text-blue-800">
                                {courtier.email}
                              </a>
                            </div>
                          )}
                          
                          {courtier.website && (
                            <div className="flex items-center">
                              <Globe className="h-5 w-5 text-gray-600 mr-3" />
                              <a href={courtier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                {courtier.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                          
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-gray-800">
                                {courtier.firmAddress}
                              </p>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(courtier.firmAddress)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-1 inline-block text-sm text-blue-600 hover:text-blue-800"
                              >
                                Voir sur Google Maps
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6 mt-6">
                        <div className="flex items-center mb-4">
                          <Calendar className="h-5 w-5 text-gray-700 mr-2" />
                          <h3 className="text-base font-medium text-gray-900">Prendre rendez-vous</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          La façon la plus simple de rencontrer {courtier.firstName} est de réserver un créneau en ligne.
                        </p>
                        <Link 
                          to={`/appointment-booking/${courtier.id}`}
                          className="inline-block w-full px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-800 text-center font-medium transition-colors"
                        >
                          Prendre rendez-vous
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerProfil; 