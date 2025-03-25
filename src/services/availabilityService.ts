import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getCabinetByBrokerId } from './cabinetService';

const COURTIERS_COLLECTION = 'courtiers';

// Types pour les disponibilités
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

export const defaultTimeSlot: TimeSlot = { start: "08:00", end: "17:00" };

export const defaultDayAvailability: DayAvailability = {
  enabled: false,
  timeSlots: [{ ...defaultTimeSlot }]
};

export const defaultWeeklyAvailability: WeeklyAvailability = {
  monday: { ...defaultDayAvailability, enabled: true },
  tuesday: { ...defaultDayAvailability, enabled: true },
  wednesday: { ...defaultDayAvailability, enabled: true },
  thursday: { ...defaultDayAvailability, enabled: true },
  friday: { ...defaultDayAvailability, enabled: true },
  saturday: { ...defaultDayAvailability },
  sunday: { ...defaultDayAvailability }
};

// Obtenir les disponibilités d'un courtier
export const getBrokerAvailability = async (brokerId: string): Promise<WeeklyAvailability> => {
  try {
    const brokerDocRef = doc(db, COURTIERS_COLLECTION, brokerId);
    const brokerDoc = await getDoc(brokerDocRef);
    
    if (brokerDoc.exists() && brokerDoc.data().availability) {
      return brokerDoc.data().availability as WeeklyAvailability;
    }
    
    return defaultWeeklyAvailability;
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return defaultWeeklyAvailability;
  }
};

// Mettre à jour les disponibilités d'un courtier
export const updateBrokerAvailability = async (
  brokerId: string, 
  availability: WeeklyAvailability
): Promise<void> => {
  try {
    const brokerDocRef = doc(db, COURTIERS_COLLECTION, brokerId);
    await updateDoc(brokerDocRef, {
      availability,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des disponibilités:', error);
    throw error;
  }
};

// Vérifier si un utilisateur a le droit de modifier les disponibilités d'un courtier
export const canManageBrokerAvailability = async (currentUserId: string, targetBrokerId: string): Promise<boolean> => {
  try {
    // Si c'est le courtier lui-même, il peut toujours modifier ses disponibilités
    if (currentUserId === targetBrokerId) {
      return true;
    }
    
    // Sinon, vérifier si l'utilisateur est un admin ou manager du cabinet
    const currentUserDocRef = doc(db, COURTIERS_COLLECTION, currentUserId);
    const currentUserDoc = await getDoc(currentUserDocRef);
    
    if (!currentUserDoc.exists()) {
      return false;
    }
    
    const currentUserData = currentUserDoc.data();
    const isAdminOrManager = currentUserData.role === 'admin' || currentUserData.role === 'manager';
    
    if (!isAdminOrManager) {
      return false;
    }
    
    // Vérifier si les deux courtiers appartiennent au même cabinet
    const targetUserDocRef = doc(db, COURTIERS_COLLECTION, targetBrokerId);
    const targetUserDoc = await getDoc(targetUserDocRef);
    
    if (!targetUserDoc.exists()) {
      return false;
    }
    
    const targetUserData = targetUserDoc.data();
    
    return currentUserData.cabinetId && 
           targetUserData.cabinetId && 
           currentUserData.cabinetId === targetUserData.cabinetId;
  } catch (error) {
    console.error('Erreur lors de la vérification des droits:', error);
    return false;
  }
};

// Obtenir tous les courtiers d'un cabinet avec leurs disponibilités
export const getCabinetBrokersAvailability = async (currentUserId: string): Promise<{ 
  brokerId: string; 
  firstName: string; 
  lastName: string; 
  role: string;
  availability: WeeklyAvailability;
}[]> => {
  try {
    // Vérifier que l'utilisateur est admin ou manager
    const userDocRef = doc(db, COURTIERS_COLLECTION, currentUserId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const userData = userDoc.data();
    
    if (!userData.cabinetId) {
      throw new Error('Vous n\'appartenez pas à un cabinet');
    }
    
    if (userData.role !== 'admin' && userData.role !== 'manager') {
      throw new Error('Vous n\'avez pas les droits pour accéder à ces informations');
    }
    
    // Récupérer tous les courtiers du cabinet
    const courtierQuery = query(
      collection(db, COURTIERS_COLLECTION),
      where('cabinetId', '==', userData.cabinetId)
    );
    
    const courtierSnapshot = await getDocs(courtierQuery);
    
    const brokersAvailability = courtierSnapshot.docs.map(doc => {
      const brokerData = doc.data();
      return {
        brokerId: doc.id,
        firstName: brokerData.firstName || '',
        lastName: brokerData.lastName || '',
        role: brokerData.role || 'employee',
        availability: brokerData.availability || defaultWeeklyAvailability
      };
    });
    
    return brokersAvailability;
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités du cabinet:', error);
    throw error;
  }
};

// Mettre à jour les disponibilités d'un courtier par un admin
export const updateBrokerAvailabilityByAdmin = async (
  adminId: string,
  brokerId: string,
  availability: WeeklyAvailability
): Promise<void> => {
  try {
    // Vérifier que l'admin a le droit de modifier les disponibilités
    const hasPermission = await canManageBrokerAvailability(adminId, brokerId);
    
    if (!hasPermission) {
      throw new Error('Vous n\'avez pas les droits pour modifier les disponibilités de ce courtier');
    }
    
    // Mettre à jour les disponibilités
    await updateBrokerAvailability(brokerId, availability);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des disponibilités par l\'admin:', error);
    throw error;
  }
}; 