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
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  updateDoc
} from 'firebase/firestore';

// Types
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  appointmentCount: number;
  lastAppointmentDate?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  brokerId?: string;
  type?: string;
  hasAccount?: boolean;
}

// Fonction pour obtenir les clients d'un courtier
export const getBrokerClients = async (
  brokerId: string,
  limitCount: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ clients: Client[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    const usersRef = collection(db, 'users');
    let q;
    
    if (lastDoc) {
      q = query(
        usersRef,
        where('type', 'in', ['client', 'client_managed']),
        where('brokerId', '==', brokerId),
        orderBy('lastName'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    } else {
      q = query(
        usersRef,
        where('type', 'in', ['client', 'client_managed']),
        where('brokerId', '==', brokerId),
        orderBy('lastName'),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const lastVisible = querySnapshot.docs.length > 0 
      ? querySnapshot.docs[querySnapshot.docs.length - 1] 
      : null;
      
    const clients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Client));
    
    return { clients, lastVisible };
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return { clients: [], lastVisible: null };
  }
};

// Fonction pour rechercher des clients
export const searchClients = async (
  brokerId: string,
  searchTerm: string
): Promise<Client[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('type', 'in', ['client', 'client_managed']),
      where('brokerId', '==', brokerId)
    );
    
    const querySnapshot = await getDocs(q);
    const clients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Client));
    
    // Filtrer les clients par le terme de recherche
    const searchTermLower = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.firstName.toLowerCase().includes(searchTermLower) ||
      client.lastName.toLowerCase().includes(searchTermLower) ||
      client.email.toLowerCase().includes(searchTermLower) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.address && client.address.toLowerCase().includes(searchTermLower)) ||
      (client.city && client.city.toLowerCase().includes(searchTermLower)) ||
      (client.postalCode && client.postalCode.includes(searchTerm))
    );
  } catch (error) {
    console.error('Erreur lors de la recherche des clients:', error);
    return [];
  }
};

// Fonction pour obtenir un client spécifique
export const getClientById = async (clientId: string): Promise<Client | null> => {
  try {
    const userDocRef = doc(db, 'users', clientId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && (userDoc.data().type === 'client' || userDoc.data().type === 'client_managed')) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as Client;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    return null;
  }
};

// Fonction pour créer un nouveau client
export const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'appointmentCount'>): Promise<string> => {
  try {
    const usersRef = collection(db, 'users');
    
    const newClient = {
      ...clientData,
      type: 'client_managed', // Client géré par le courtier, pas un compte utilisateur
      hasAccount: false, // Indique que ce client n'a pas de compte utilisateur
      appointmentCount: 0,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(usersRef, newClient);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    throw error;
  }
};

// Fonction pour mettre à jour un client existant
export const updateClient = async (clientId: string, clientData: Partial<Client>): Promise<boolean> => {
  try {
    const clientRef = doc(db, 'users', clientId);
    await updateDoc(clientRef, clientData);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    return false;
  }
}; 