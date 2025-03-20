import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

// Types pour les disponibilités
interface TimeSlot {
  start: string; // Format "HH:mm"
  end: string; // Format "HH:mm"
}

interface DayAvailability {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

const defaultTimeSlot: TimeSlot = { start: "08:00", end: "17:00" };

const defaultDayAvailability: DayAvailability = {
  enabled: false,
  timeSlots: [{ ...defaultTimeSlot }]
};

const defaultWeeklyAvailability: WeeklyAvailability = {
  monday: { ...defaultDayAvailability, enabled: true },
  tuesday: { ...defaultDayAvailability, enabled: true },
  wednesday: { ...defaultDayAvailability, enabled: true },
  thursday: { ...defaultDayAvailability, enabled: true },
  friday: { ...defaultDayAvailability, enabled: true },
  saturday: { ...defaultDayAvailability },
  sunday: { ...defaultDayAvailability }
};

// Traduction des jours de la semaine
const dayTranslations = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche"
};

export default function BrokerAvailability() {
  const [user] = useAuthState(auth);
  const [availability, setAvailability] = useState<WeeklyAvailability>(defaultWeeklyAvailability);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchAvailability = async () => {
        try {
          const userDocRef = doc(db, 'courtiers', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().availability) {
            setAvailability(userDoc.data().availability);
          }
          setLoading(false);
        } catch (error) {
          console.error('Erreur lors de la récupération des disponibilités:', error);
          setLoading(false);
        }
      };
      
      fetchAvailability();
    }
  }, [user]);

  const handleDayToggle = (day: keyof WeeklyAvailability) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  const handleAddTimeSlot = (day: keyof WeeklyAvailability) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, { ...defaultTimeSlot }]
      }
    }));
  };

  const handleRemoveTimeSlot = (day: keyof WeeklyAvailability, index: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index)
      }
    }));
  };

  const handleTimeChange = (
    day: keyof WeeklyAvailability,
    index: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const saveAvailability = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const userDocRef = doc(db, 'courtiers', user.uid);
      await updateDoc(userDocRef, {
        availability
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des disponibilités:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/courtier/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gérer mes disponibilités</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Définissez vos horaires de disponibilité pour chaque jour de la semaine. 
            Ces créneaux seront proposés à vos clients lors de la prise de rendez-vous.
          </p>
          
          {Object.entries(availability).map(([day, dayData]) => (
            <div key={day} className="border-b border-gray-200 py-4 last:border-b-0">
              <div className="flex items-center mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={dayData.enabled}
                    onChange={() => handleDayToggle(day as keyof WeeklyAvailability)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 font-medium w-24">{dayTranslations[day as keyof typeof dayTranslations]}</span>
                </label>
              </div>
              
              {dayData.enabled && (
                <div className="ml-7">
                  {dayData.timeSlots.map((slot: TimeSlot, index: number) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => handleTimeChange(day as keyof WeeklyAvailability, index, 'start', e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span>à</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => handleTimeChange(day as keyof WeeklyAvailability, index, 'end', e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <button
                        onClick={() => handleRemoveTimeSlot(day as keyof WeeklyAvailability, index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={dayData.timeSlots.length === 1}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => handleAddTimeSlot(day as keyof WeeklyAvailability)}
                    className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Ajouter un créneau</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={saveAvailability}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer mes disponibilités'}
          </button>
        </div>
        
        {saveSuccess && (
          <div className="mt-4 p-2 bg-green-100 text-green-800 rounded-md">
            Vos disponibilités ont été enregistrées avec succès.
          </div>
        )}
      </div>
    </div>
  );
}
