import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  getAvailableSlotsForNext7Days, 
  createAppointment, 
  AvailableSlot 
} from '../services/appointmentService';

interface Courtier {
  id: string;
  firstName: string;
  lastName: string;
  firmAddress: string;
  photoUrl?: string;
  specialties: string[];
}

export default function AppointmentBooking() {
  const { brokerId } = useParams<{ brokerId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date');
  const initialTime = searchParams.get('time');
  
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courtier, setCourtier] = useState<Courtier | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Nombre de jours par page pour l'affichage des disponibilités
  const daysPerPage = 3;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthChecked(true);
      
      if (!user) {
        // Rediriger vers la page de connexion avec un paramètre de retour
        navigate(`/login?redirect=/appointment-booking/${brokerId}`);
        return;
      }

      try {
        // Récupérer les informations du client
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("Données client récupérées:", data);
          setUserData(prevData => ({
            ...prevData,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: user.email || '',
            phone: data.phone || ''
          }));
        } else {
          // Si le document n'existe pas, on garde juste l'email de l'authentification
          console.log("Document client non trouvé pour l'utilisateur:", user.uid);
          setUserData(prevData => ({
            ...prevData,
            email: user.email || ''
          }));
        }

        // Récupérer les informations du courtier
        if (brokerId) {
          const courtierDoc = await getDoc(doc(db, 'courtiers', brokerId));
          if (courtierDoc.exists()) {
            setCourtier({
              id: courtierDoc.id,
              ...courtierDoc.data()
            } as Courtier);

            // Récupérer les créneaux disponibles
            const slots = await getAvailableSlotsForNext7Days(brokerId);
            setAvailableSlots(slots);
            
            // Si un créneau a été présélectionné via les paramètres d'URL
            if (initialDate && initialTime) {
              const preselectedSlot = slots.find(
                slot => slot.date === initialDate && slot.startTime === initialTime
              );
              if (preselectedSlot) {
                setSelectedSlot(preselectedSlot);
                setStep(2);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [brokerId, navigate, initialDate, initialTime]);

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !courtier || !userData) return;

    // Validation de base
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Créer le rendez-vous
      const appointmentId = await createAppointment({
        brokerId: courtier.id,
        clientId: user.uid,
        clientName: `${userData.firstName} ${userData.lastName}`,
        clientEmail: userData.email,
        clientPhone: userData.phone,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        status: 'confirmed',
        title: `RDV avec ${courtier.firstName} ${courtier.lastName}`,
        notes: userData.notes || ''
      });

      if (appointmentId) {
        setSuccess(true);
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      setError('Une erreur est survenue lors de la prise de rendez-vous. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Créer directement une nouvelle structure avec seulement les jours ayant des créneaux
  const validSlots = availableSlots.filter(slot => slot.startTime && slot.date);
  console.log("Créneaux valides:", validSlots.length);
  
  // Grouper les créneaux par jour mais seulement ceux qui ont des valeurs
  const daysWithSlots: Record<string, AvailableSlot[]> = {};
  
  validSlots.forEach(slot => {
    if (!daysWithSlots[slot.date]) {
      daysWithSlots[slot.date] = [];
    }
    daysWithSlots[slot.date].push(slot);
  });
  
  // Obtenez les jours classés qui ont au moins un créneau
  const sortedDays = Object.keys(daysWithSlots).sort();
  console.log("Jours après tri et filtrage:", sortedDays);
  
  // Pagination des jours avec des créneaux uniquement
  const totalPages = Math.ceil(sortedDays.length / daysPerPage);
  const currentDays = sortedDays.slice(
    currentPageIndex * daysPerPage, 
    (currentPageIndex + 1) * daysPerPage
  );
  
  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };
  
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEE d MMM', { locale: fr });
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !courtier) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Erreur
          </h2>
          <p className="mt-2 text-center text-sm text-red-600">
            {error}
          </p>
          <div className="mt-6 text-center">
            <Link to="/results" className="text-blue-600 hover:text-blue-800">
              Retour aux résultats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-indigo-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-white mr-2" />
            <h1 className="text-xl font-bold text-white">MonCourtier</h1>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center space-x-1 text-white hover:text-blue-200 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Étapes du processus */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between mb-6">
            <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1/2 transform -translate-y-1/2 z-0"></div>
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center z-10 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              <Calendar size={16} />
            </div>
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center z-10 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              <FileText size={16} />
            </div>
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center z-10 ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className={`${step === 1 ? 'text-blue-600' : 'text-gray-500'}`}>Sélection du créneau</span>
            <span className={`${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Informations</span>
            <span className={`${step === 3 ? 'text-blue-600' : 'text-gray-500'}`}>Confirmation</span>
          </div>
        </div>

        {courtier && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <div className="flex items-center">
                {courtier.photoUrl ? (
                  <img
                    src={courtier.photoUrl}
                    alt={`${courtier.firstName} ${courtier.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white shadow-md">
                    <User className="h-10 w-10 text-blue-400" />
                  </div>
                )}
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {courtier.firstName} {courtier.lastName}
                  </h2>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <p>{courtier.firmAddress}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {courtier.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <Briefcase className="h-3 w-3 mr-1" />
                        {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sélectionnez un créneau disponible</h2>
              
              {sortedDays.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-10 text-center">
                  <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Aucun créneau disponible pour les 7 prochains jours.</p>
                  <p className="text-gray-500 mt-2">Veuillez contacter le courtier directement ou réessayer plus tard.</p>
                </div>
              ) : (
                <>
                  {/* Navigation des jours */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mb-6 px-2">
                      <button 
                        onClick={goToPrevPage}
                        disabled={currentPageIndex === 0}
                        className={`flex items-center ${currentPageIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        <ChevronLeft size={18} />
                        <span className="ml-1">Précédent</span>
                      </button>
                      <span className="text-sm text-gray-500">
                        Page {currentPageIndex + 1} sur {totalPages}
                      </span>
                      <button 
                        onClick={goToNextPage}
                        disabled={currentPageIndex === totalPages - 1}
                        className={`flex items-center ${currentPageIndex === totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        <span className="mr-1">Suivant</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                
                  <div className="space-y-8">
                    {currentDays.map((day) => (
                      <div key={day} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-blue-50 py-3 px-4">
                          <h3 className="font-medium text-blue-900 capitalize">
                            {formatDate(day)}
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {daysWithSlots[day].map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => handleSlotSelect(slot)}
                                className="relative group overflow-hidden"
                              >
                                <div className="bg-white text-blue-800 font-medium py-3 px-4 rounded-lg border border-blue-100 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-blue-300 group-hover:bg-blue-50 text-center">
                                  {slot.startTime}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {step === 2 && selectedSlot && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Finalisez votre rendez-vous</h2>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-8 flex items-start">
                <Clock className="h-8 w-8 text-blue-500 mr-4 mt-1" />
                <div>
                  <p className="font-bold text-blue-900 text-lg">
                    {formatDate(selectedSlot.date)}
                  </p>
                  <p className="text-blue-700">
                    De {selectedSlot.startTime} à {selectedSlot.endTime}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Durée approximative : 45 minutes
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos coordonnées</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={userData.firstName}
                        readOnly
                        placeholder="Votre prénom"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={userData.lastName}
                        readOnly
                        placeholder="Votre nom"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                          placeholder="votre@email.com"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          placeholder="06 12 34 56 78"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes / Raison du rendez-vous (facultatif)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={userData.notes}
                    onChange={(e) => setUserData({ ...userData, notes: e.target.value })}
                    placeholder="Précisez la raison de votre rendez-vous ou toute information complémentaire..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  ></textarea>
                </div>
                
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement en cours...
                      </>
                    ) : (
                      'Confirmer le rendez-vous'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 3 && success && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Rendez-vous confirmé !</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Votre rendez-vous a été enregistré avec succès. Vous recevrez bientôt un email de confirmation avec tous les détails.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-8">
              <h3 className="font-medium text-gray-900 mb-4 text-lg text-left">Détails du rendez-vous :</h3>
              
              <div className="space-y-4">
                <div className="flex items-start text-left">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {selectedSlot && formatDate(selectedSlot.date)}
                    </p>
                    <p className="text-gray-600">
                      {selectedSlot && `De ${selectedSlot.startTime} à ${selectedSlot.endTime}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start text-left">
                  <User className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {courtier?.firstName} {courtier?.lastName}
                    </p>
                    <p className="text-gray-600">
                      {courtier?.specialties.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start text-left">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <p className="text-gray-600">
                    {courtier?.firmAddress}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={courtier ? `/broker-profil/${courtier.id}` : '/'}
                className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              >
                Voir profil du courtier
              </Link>
              <Link
                to="/client/rendezvous"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Gérer mes rendez-vous
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
