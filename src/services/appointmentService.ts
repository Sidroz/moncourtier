import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { startOfDay, addDays, format, parse, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
export interface TimeSlot {
  start: string; // Format "HH:mm"
  end: string; // Format "HH:mm"
}

export interface DayAvailability {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

export interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface Appointment {
  id?: string;
  brokerId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string; // Format "YYYY-MM-DD"
  startTime: string; // Format "HH:mm"
  endTime: string; // Format "HH:mm"
  status: 'pending' | 'confirmed' | 'cancelled';
  title: string;
  notes?: string;
  createdAt: Timestamp;
}

export interface AvailableSlot {
  date: string; // Format "YYYY-MM-DD"
  startTime: string; // Format "HH:mm"
  endTime: string; // Format "HH:mm"
  formattedDate: string; // Format localisé pour l'affichage
}

// Jours de la semaine en français
const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Fonction pour obtenir les disponibilités d'un courtier
export const getBrokerAvailability = async (brokerId: string): Promise<WeeklyAvailability | null> => {
  try {
    const brokerDocRef = doc(db, 'courtiers', brokerId);
    const brokerDoc = await getDoc(brokerDocRef);
    
    if (brokerDoc.exists() && brokerDoc.data().availability) {
      return brokerDoc.data().availability as WeeklyAvailability;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return null;
  }
};

// Fonction pour obtenir les rendez-vous d'un courtier sur une période donnée
export const getBrokerAppointments = async (
  brokerId: string, 
  startDate: Date, 
  endDate: Date
): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    const q = query(
      appointmentsRef,
      where('brokerId', '==', brokerId),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    return [];
  }
};

// Fonction pour créer un nouveau rendez-vous
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const newAppointment = {
      ...appointment,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(appointmentsRef, newAppointment);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    return null;
  }
};

// Fonction pour mettre à jour un rendez-vous
export const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<boolean> => {
  try {
    const appointmentRef = doc(db, 'appointments', id);
    await updateDoc(appointmentRef, data);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    return false;
  }
};

// Fonction pour annuler un rendez-vous
export const cancelAppointment = async (id: string): Promise<boolean> => {
  try {
    const appointmentRef = doc(db, 'appointments', id);
    await updateDoc(appointmentRef, { status: 'cancelled' });
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'annulation du rendez-vous:', error);
    return false;
  }
};

// Fonction pour supprimer un rendez-vous (généralement réservé à l'administration)
export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    const appointmentRef = doc(db, 'appointments', id);
    await deleteDoc(appointmentRef);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    return false;
  }
};

// Fonction pour obtenir les créneaux disponibles d'un courtier pour les 7 prochains jours
export const getAvailableSlotsForNext7Days = async (brokerId: string): Promise<AvailableSlot[]> => {
  try {
    // Récupérer les disponibilités du courtier
    const availability = await getBrokerAvailability(brokerId);
    if (!availability) return [];
    
    // Récupérer les rendez-vous existants pour les 7 prochains jours
    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);
    const appointments = await getBrokerAppointments(brokerId, today, nextWeek);
    
    const availableSlots: AvailableSlot[] = [];
    
    // Pour chaque jour des 7 prochains jours
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(today, i);
      const dayOfWeek = weekDays[currentDate.getDay()];
      const dayAvailability = availability[dayOfWeek as keyof WeeklyAvailability];
      
      // Si le jour est activé et a des créneaux
      if (dayAvailability.enabled && dayAvailability.timeSlots.length > 0) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const formattedDate = format(currentDate, 'EEEE dd MMMM', { locale: fr });
        
        // Pour chaque créneau horaire disponible ce jour-là
        for (const slot of dayAvailability.timeSlots) {
          // Diviser le créneau en plages de 30 minutes
          const startTime = parse(slot.start, 'HH:mm', new Date());
          const endTime = parse(slot.end, 'HH:mm', new Date());
          
          let currentSlotStart = startTime;
          while (currentSlotStart < endTime) {
            const currentSlotEnd = addDays(currentSlotStart, 0);
            currentSlotEnd.setMinutes(currentSlotStart.getMinutes() + 30);
            
            if (currentSlotEnd <= endTime) {
              const startTimeStr = format(currentSlotStart, 'HH:mm');
              const endTimeStr = format(currentSlotEnd, 'HH:mm');
              
              // Vérifier si ce créneau n'est pas déjà pris par un rendez-vous
              const isSlotAvailable = !appointments.some(appointment => {
                if (appointment.date !== dateStr) return false;
                
                const appointmentStart = parse(appointment.startTime, 'HH:mm', new Date());
                const appointmentEnd = parse(appointment.endTime, 'HH:mm', new Date());
                
                return isWithinInterval(currentSlotStart, { start: appointmentStart, end: appointmentEnd }) ||
                       isWithinInterval(currentSlotEnd, { start: appointmentStart, end: appointmentEnd }) ||
                       (currentSlotStart <= appointmentStart && currentSlotEnd >= appointmentEnd);
              });
              
              if (isSlotAvailable) {
                availableSlots.push({
                  date: dateStr,
                  startTime: startTimeStr,
                  endTime: endTimeStr,
                  formattedDate: formattedDate
                });
              }
            }
            
            currentSlotStart = currentSlotEnd;
          }
        }
      }
    }
    
    return availableSlots;
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux disponibles:', error);
    return [];
  }
};
