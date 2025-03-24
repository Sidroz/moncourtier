import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

// Types
export interface BrokerClientRelation {
  id: string;
  brokerId: string;
  clientId: string;
  startDate: Timestamp;
  status: 'active' | 'inactive';
  appointmentCount: number;
  lastAppointmentDate: Timestamp;
  nextAppointmentDate?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  clientName?: string;
  brokerName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Fonction pour créer une nouvelle relation courtier-client
export const createBrokerClientRelation = async (
  brokerId: string,
  clientId: string,
  clientName: string,
  brokerName: string,
  appointmentDate: Timestamp,
  clientEmail?: string,
  clientPhone?: string,
  clientAddress?: string,
  notes?: string
): Promise<string> => {
  try {
    const relationsRef = collection(db, 'broker_client_relations');
    
    // Vérifier si la relation existe déjà
    const q = query(
      relationsRef,
      where('brokerId', '==', brokerId),
      where('clientId', '==', clientId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // La relation existe déjà, on met à jour les compteurs et les informations du client
      const relationDoc = querySnapshot.docs[0];
      const updateData: any = {
        appointmentCount: (relationDoc.data().appointmentCount || 0) + 1,
        lastAppointmentDate: appointmentDate,
        nextAppointmentDate: appointmentDate,
        updatedAt: Timestamp.now(),
        status: 'active',
        clientName
      };

      // Ajouter les champs optionnels seulement s'ils sont définis
      if (clientEmail) updateData.email = clientEmail;
      if (clientPhone) updateData.phone = clientPhone;
      if (clientAddress) updateData.address = clientAddress;
      if (notes) updateData.notes = notes;

      await updateDoc(doc(db, 'broker_client_relations', relationDoc.id), updateData);
      
      return relationDoc.id;
    }
    
    // Créer une nouvelle relation
    const newRelation: any = {
      brokerId,
      clientId,
      startDate: appointmentDate,
      status: 'active',
      appointmentCount: 1,
      lastAppointmentDate: appointmentDate,
      nextAppointmentDate: appointmentDate,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      clientName,
      brokerName
    };

    // Ajouter les champs optionnels seulement s'ils sont définis
    if (clientEmail) newRelation.email = clientEmail;
    if (clientPhone) newRelation.phone = clientPhone;
    if (clientAddress) newRelation.address = clientAddress;
    if (notes) newRelation.notes = notes;
    
    const docRef = await addDoc(relationsRef, newRelation);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la relation courtier-client:', error);
    throw error;
  }
};

// Fonction pour obtenir toutes les relations d'un courtier
export const getBrokerRelations = async (
  brokerId: string,
  limitCount: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ relations: BrokerClientRelation[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    const relationsRef = collection(db, 'broker_client_relations');
    let q;
    
    if (lastDoc) {
      q = query(
        relationsRef,
        where('brokerId', '==', brokerId),
        where('status', '==', 'active'),
        orderBy('updatedAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    } else {
      q = query(
        relationsRef,
        where('brokerId', '==', brokerId),
        where('status', '==', 'active'),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const lastVisible = querySnapshot.docs.length > 0 
      ? querySnapshot.docs[querySnapshot.docs.length - 1] 
      : null;
      
    const relations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as BrokerClientRelation));
    
    return { relations, lastVisible };
  } catch (error) {
    console.error('Erreur lors de la récupération des relations:', error);
    return { relations: [], lastVisible: null };
  }
};

// Fonction pour mettre à jour une relation lors d'un nouveau rendez-vous
export const updateRelationForAppointment = async (
  brokerId: string,
  clientId: string,
  appointmentDate: Timestamp
): Promise<void> => {
  try {
    const relationsRef = collection(db, 'broker_client_relations');
    const q = query(
      relationsRef,
      where('brokerId', '==', brokerId),
      where('clientId', '==', clientId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const relationDoc = querySnapshot.docs[0];
      const currentData = relationDoc.data();
      
      await updateDoc(doc(db, 'broker_client_relations', relationDoc.id), {
        appointmentCount: (currentData.appointmentCount || 0) + 1,
        lastAppointmentDate: Timestamp.now(),
        nextAppointmentDate: appointmentDate,
        updatedAt: Timestamp.now(),
        status: 'active'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la relation:', error);
    throw error;
  }
};

// Fonction pour désactiver une relation
export const deactivateRelation = async (relationId: string): Promise<void> => {
  try {
    const relationRef = doc(db, 'broker_client_relations', relationId);
    await updateDoc(relationRef, {
      status: 'inactive',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation de la relation:', error);
    throw error;
  }
}; 