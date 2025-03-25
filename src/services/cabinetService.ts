import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, deleteDoc, serverTimestamp, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Cabinet } from '../types/cabinet';
import { Courtier } from '../types/courtier';

const CABINETS_COLLECTION = 'cabinets';
const COURTIERS_COLLECTION = 'courtiers';

// Récupérer un cabinet par son ID
export const getCabinetById = async (cabinetId: string): Promise<Cabinet | null> => {
  try {
    const cabinetDoc = await getDoc(doc(db, CABINETS_COLLECTION, cabinetId));
    
    if (cabinetDoc.exists()) {
      return { id: cabinetDoc.id, ...cabinetDoc.data() } as Cabinet;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du cabinet:', error);
    throw error;
  }
};

// Créer un nouveau cabinet
export const createCabinet = async (cabinetData: Omit<Cabinet, 'id'>, courtierId: string): Promise<Cabinet> => {
  try {
    // Vérifier que le courtier existe
    const courtierDoc = await getDoc(doc(db, COURTIERS_COLLECTION, courtierId));
    if (!courtierDoc.exists()) {
      throw new Error('Le courtier spécifié n\'existe pas');
    }

    // Vérifier que le courtier a le rôle admin
    const courtierData = courtierDoc.data();
    if (courtierData.role !== 'admin') {
      throw new Error('Seuls les courtiers avec le rôle d\'administrateur peuvent créer un cabinet');
    }

    // Créer le document du cabinet avec un ID généré
    const cabinetRef = doc(collection(db, CABINETS_COLLECTION));
    const cabinetWithTimestamp = {
      ...cabinetData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      adminId: courtierId
    };
    
    await setDoc(cabinetRef, cabinetWithTimestamp);
    
    // Mettre à jour le courtier avec le cabinetId mais ne pas changer son rôle
    // car il devrait déjà être admin
    await updateDoc(doc(db, COURTIERS_COLLECTION, courtierId), {
      cabinetId: cabinetRef.id,
      updatedAt: serverTimestamp()
    });
    
    return { 
      ...cabinetWithTimestamp, 
      id: cabinetRef.id,
      // Convertir les timestamps en dates pour l'interface utilisateur
      createdAt: new Date(),
      updatedAt: new Date()
    } as Cabinet;
  } catch (error) {
    console.error('Erreur lors de la création du cabinet:', error);
    throw error;
  }
};

// Mettre à jour un cabinet
export const updateCabinet = async (cabinetId: string, cabinetData: Partial<Cabinet>): Promise<void> => {
  try {
    await updateDoc(doc(db, CABINETS_COLLECTION, cabinetId), {
      ...cabinetData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cabinet:', error);
    throw error;
  }
};

// Supprimer un cabinet
export const deleteCabinet = async (cabinetId: string): Promise<void> => {
  try {
    // Récupérer tous les courtiers associés au cabinet
    const courtierQuery = query(
      collection(db, COURTIERS_COLLECTION),
      where('cabinetId', '==', cabinetId)
    );
    
    const courtierSnapshot = await getDocs(courtierQuery);
    
    // Mettre à jour tous les courtiers pour retirer l'association au cabinet
    const updatePromises = courtierSnapshot.docs.map(courtierDoc => 
      updateDoc(doc(db, COURTIERS_COLLECTION, courtierDoc.id), {
        cabinetId: null,
        role: null,
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    
    // Supprimer le cabinet
    await deleteDoc(doc(db, CABINETS_COLLECTION, cabinetId));
  } catch (error) {
    console.error('Erreur lors de la suppression du cabinet:', error);
    throw error;
  }
};

// Ajouter un courtier à un cabinet
export const addCourtierToCabinet = async (
  cabinetId: string, 
  courtierId: string, 
  role: 'manager' | 'associate' | 'employee' = 'employee'
): Promise<void> => {
  try {
    // Vérifier que le cabinet existe
    const cabinetDoc = await getDoc(doc(db, CABINETS_COLLECTION, cabinetId));
    if (!cabinetDoc.exists()) {
      throw new Error('Le cabinet spécifié n\'existe pas');
    }
    
    // Vérifier que le courtier existe
    const courtierDoc = await getDoc(doc(db, COURTIERS_COLLECTION, courtierId));
    if (!courtierDoc.exists()) {
      throw new Error('Le courtier spécifié n\'existe pas');
    }
    
    // Vérifier si le courtier appartient déjà à un cabinet
    const courtierData = courtierDoc.data();
    if (courtierData.cabinetId && courtierData.cabinetId !== cabinetId) {
      throw new Error('Le courtier appartient déjà à un autre cabinet');
    }
    
    // Mettre à jour le courtier avec le cabinetId et le rôle
    await updateDoc(doc(db, COURTIERS_COLLECTION, courtierId), {
      cabinetId: cabinetId,
      role: role,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du courtier au cabinet:', error);
    throw error;
  }
};

// Retirer un courtier d'un cabinet
export const removeCourtierFromCabinet = async (courtierId: string): Promise<void> => {
  try {
    // Vérifier que le courtier existe
    const courtierDoc = await getDoc(doc(db, COURTIERS_COLLECTION, courtierId));
    if (!courtierDoc.exists()) {
      throw new Error('Le courtier spécifié n\'existe pas');
    }
    
    const courtierData = courtierDoc.data();
    
    // Vérifier si le courtier est un admin de cabinet
    if (courtierData.role === 'admin') {
      const cabinetId = courtierData.cabinetId;
      if (cabinetId) {
        const cabinetDoc = await getDoc(doc(db, CABINETS_COLLECTION, cabinetId));
        if (cabinetDoc.exists() && cabinetDoc.data().adminId === courtierId) {
          throw new Error('Le courtier est l\'administrateur du cabinet. Veuillez transférer l\'administration avant de le retirer.');
        }
      }
    }
    
    // Mettre à jour le courtier pour retirer l'association au cabinet
    await updateDoc(doc(db, COURTIERS_COLLECTION, courtierId), {
      cabinetId: null,
      role: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors du retrait du courtier du cabinet:', error);
    throw error;
  }
};

// Changer l'admin d'un cabinet
export const changeCabinetAdmin = async (cabinetId: string, newAdminId: string): Promise<void> => {
  try {
    // Vérifier que le cabinet existe
    const cabinetDoc = await getDoc(doc(db, CABINETS_COLLECTION, cabinetId));
    if (!cabinetDoc.exists()) {
      throw new Error('Le cabinet spécifié n\'existe pas');
    }
    
    const cabinetData = cabinetDoc.data();
    const currentAdminId = cabinetData.adminId;
    
    // Vérifier que le nouvel admin existe et appartient au cabinet
    const newAdminDoc = await getDoc(doc(db, COURTIERS_COLLECTION, newAdminId));
    if (!newAdminDoc.exists()) {
      throw new Error('Le nouveau courtier administrateur n\'existe pas');
    }
    
    const newAdminData = newAdminDoc.data();
    if (newAdminData.cabinetId !== cabinetId) {
      throw new Error('Le nouveau courtier administrateur n\'appartient pas à ce cabinet');
    }
    
    // Mettre à jour le cabinet avec le nouvel admin
    await updateDoc(doc(db, CABINETS_COLLECTION, cabinetId), {
      adminId: newAdminId,
      updatedAt: serverTimestamp()
    });
    
    // Mettre à jour le rôle du nouvel admin
    await updateDoc(doc(db, COURTIERS_COLLECTION, newAdminId), {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    
    // Mettre à jour le rôle de l'ancien admin s'il existe toujours
    if (currentAdminId && currentAdminId !== newAdminId) {
      await updateDoc(doc(db, COURTIERS_COLLECTION, currentAdminId), {
        role: 'manager',
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Erreur lors du changement d\'administrateur du cabinet:', error);
    throw error;
  }
};

// Récupérer tous les courtiers d'un cabinet
export const getCourtiersByCabinetId = async (cabinetId: string): Promise<Courtier[]> => {
  try {
    const courtierQuery = query(
      collection(db, COURTIERS_COLLECTION),
      where('cabinetId', '==', cabinetId)
    );
    
    const courtierSnapshot = await getDocs(courtierQuery);
    
    return courtierSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Courtier[];
  } catch (error) {
    console.error('Erreur lors de la récupération des courtiers du cabinet:', error);
    throw error;
  }
};

// Trouver un courtier par son email
export const findCourtierByEmail = async (email: string): Promise<Courtier | null> => {
  try {
    const courtierQuery = query(
      collection(db, COURTIERS_COLLECTION),
      where('email', '==', email),
      where('type', '==', 'courtier')
    );
    
    const courtierSnapshot = await getDocs(courtierQuery);
    
    if (courtierSnapshot.empty) {
      return null;
    }
    
    const courtierDoc = courtierSnapshot.docs[0];
    return {
      id: courtierDoc.id,
      ...courtierDoc.data()
    } as Courtier;
  } catch (error) {
    console.error('Erreur lors de la recherche du courtier par email:', error);
    throw error;
  }
};

// Récupérer le cabinet d'un courtier
export const getCabinetByBrokerId = async (brokerId: string): Promise<Cabinet | null> => {
  try {
    const courtierDoc = await getDoc(doc(db, COURTIERS_COLLECTION, brokerId));
    
    if (!courtierDoc.exists()) {
      throw new Error('Le courtier spécifié n\'existe pas');
    }
    
    const courtierData = courtierDoc.data();
    
    if (!courtierData.cabinetId) {
      return null;
    }
    
    return getCabinetById(courtierData.cabinetId);
  } catch (error) {
    console.error('Erreur lors de la récupération du cabinet du courtier:', error);
    throw error;
  }
}; 