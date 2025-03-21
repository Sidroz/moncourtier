import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar, Clock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
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
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [step, setStep] = useState(1); // 1: Sélection du créneau, 2: Formulaire, 3: Confirmation
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
        const userDoc = await getDoc(doc(db, 'clients', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(prevData => ({
            ...prevData,
            firstName: data.firstName || prevData.firstName,
            lastName: data.lastName || prevData.lastName,
            email: user.email || prevData.email,
            phone: data.phone || prevData.phone
          }));
        } else {
          // Si le document n'existe pas, on garde juste l'email de l'authentification
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
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [brokerId, navigate]);

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !courtier || !userData) return;

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
        notes: ''
      });

      if (appointmentId) {
        setSuccess(true);
        setStep(3);
      }
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      setError('Une erreur est survenue lors de la prise de rendez-vous. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Grouper les créneaux par jour
  const slotsByDay = availableSlots.reduce((acc, slot) => {
    const day = slot.formattedDate;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlot[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  if (!authChecked || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
              Retour à la recherche
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-lg font-semibold text-black">MonCourtier</h1>
          </div>
          <Link to="/results" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux résultats
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {courtier && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              {courtier.photoUrl ? (
                <img
                  src={courtier.photoUrl}
                  alt={`${courtier.firstName} ${courtier.lastName}`}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {courtier.firstName} {courtier.lastName}
                </h2>
                <p className="text-gray-600">{courtier.firmAddress}</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sélectionnez un créneau disponible</h2>
            
            {availableSlots.length === 0 ? (
              <p className="text-gray-600">Aucun créneau disponible pour les 7 prochains jours.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(slotsByDay).map(([day, slots]) => (
                  <div key={day} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="font-medium text-gray-900 mb-3 capitalize">{day}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {slots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSlotSelect(slot)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded border border-blue-200 transition-colors"
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedSlot && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Finalisez votre rendez-vous</h2>
            
            <div className="bg-blue-50 rounded-md p-4 mb-6 flex items-start">
              <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">
                  {formatDate(selectedSlot.date)}
                </p>
                <p className="text-blue-600">
                  De {selectedSlot.startTime} à {selectedSlot.endTime}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    placeholder="Prénom"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    placeholder="Nom"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="votre@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="clientPhone"
                  name="clientPhone"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (facultatif)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Traitement...' : 'Confirmer le rendez-vous'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && success && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
            <p className="text-gray-600 mb-6">
              Votre rendez-vous a été enregistré avec succès. Vous recevrez bientôt un email de confirmation.
            </p>
            <div className="bg-gray-50 rounded-md p-4 mb-6 mx-auto max-w-md">
              <p className="font-medium text-gray-900 mb-1">Détails du rendez-vous :</p>
              <p className="text-gray-700">
                {selectedSlot && formatDate(selectedSlot.date)}
              </p>
              <p className="text-gray-700">
                {selectedSlot && `De ${selectedSlot.startTime} à ${selectedSlot.endTime}`}
              </p>
              <p className="text-gray-700 mt-2">
                Avec : {courtier?.firstName} {courtier?.lastName}
              </p>
            </div>
            <div className="flex justify-center">
              <Link
                to="/"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
