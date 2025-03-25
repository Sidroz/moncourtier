import { useState, useEffect } from 'react';
import { X, AlertTriangle, UserCheck } from 'lucide-react';
import { Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { addClient } from '../services/clientService';
import { createBrokerClientRelation } from '../services/brokerClientRelationService';
import { db } from '../firebase';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerId: string;
  brokerName: string;
  onSuccess?: () => void;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  brokerId?: string;
}

export default function AddClientModal({ isOpen, onClose, brokerId, brokerName, onSuccess }: AddClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    brokerId: brokerId
  });
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [existingClientId, setExistingClientId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      notes: '',
      brokerId: brokerId
    });
    setErrors({});
    setEmailExists(false);
    setExistingClientId(null);
  };

  const checkEmailExists = async (email: string): Promise<{exists: boolean, clientId?: string, clientData?: any}> => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return { exists: false };
    }
    
    try {
      setIsCheckingEmail(true);
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '==', email.trim())
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { 
          exists: true, 
          clientId: userDoc.id,
          clientData: userDoc.data()
        };
      }
      return { exists: false };
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return { exists: false };
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Ne pas mettre à jour les champs en lecture seule si le client existe déjà
    if (emailExists && name !== 'notes' && name !== 'email') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof ClientFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    if (name === 'email') {
      setEmailExists(false);
      setExistingClientId(null);
      
      const debounceTimer = setTimeout(async () => {
        if (value.trim() && /\S+@\S+\.\S+/.test(value)) {
          const result = await checkEmailExists(value);
          if (result.exists && result.clientData) {
            setEmailExists(true);
            setExistingClientId(result.clientId || null);
            
            // Préremplir les informations du client existant
            setFormData(prev => ({
              ...prev,
              firstName: result.clientData.firstName || '',
              lastName: result.clientData.lastName || '',
              phone: result.clientData.phone || '',
              address: result.clientData.address || '',
              city: result.clientData.city || '',
              postalCode: result.clientData.postalCode || '',
              // Ne pas remplacer les notes que l'utilisateur pourrait avoir déjà écrites
              notes: prev.notes || result.clientData.notes || ''
            }));
          }
        }
      }, 800);
      
      return () => clearTimeout(debounceTimer);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};
    
    // Si l'email existe déjà, on ne valide que l'email et les notes
    if (emailExists) {
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    } else {
      // Validation complète pour un nouveau client
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Le prénom est requis';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Le nom est requis';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification finale de l'email si ce n'est pas déjà marqué comme existant
    if (!emailExists) {
      const result = await checkEmailExists(formData.email);
      if (result.exists) {
        setEmailExists(true);
        setExistingClientId(result.clientId || null);
        
        // Préremplir les informations du client existant
        if (result.clientData) {
          setFormData(prev => ({
            ...prev,
            firstName: result.clientData.firstName || '',
            lastName: result.clientData.lastName || '',
            phone: result.clientData.phone || '',
            address: result.clientData.address || '',
            city: result.clientData.city || '',
            postalCode: result.clientData.postalCode || '',
            notes: prev.notes || result.clientData.notes || ''
          }));
        }
        
        // Ne pas afficher d'erreur, permettre la création de la relation
      }
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let clientId = existingClientId;
      
      // Si le client n'existe pas déjà, créer un nouveau client
      if (!emailExists || !existingClientId) {
        clientId = await addClient({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || '',
          address: formData.address || '',
          city: formData.city || '',
          postalCode: formData.postalCode || '',
          notes: formData.notes || '',
          brokerId: formData.brokerId
        });
      }
      
      // Créer ou mettre à jour la relation courtier-client
      if (clientId) {
        await createBrokerClientRelation(
          brokerId,
          clientId,
          `${formData.firstName} ${formData.lastName}`,
          brokerName,
          Timestamp.now(),
          formData.email,
          formData.phone || '',
          formData.address || '',
          formData.notes || ''
        );
        
        resetForm();
        onClose();
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ajouter un client</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {emailExists && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <UserCheck className="text-blue-600 h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Client existant trouvé avec cet email</p>
                <p className="text-xs text-blue-700 mt-1">
                  Les informations ont été automatiquement remplies. Vous pouvez ajouter ce client à votre liste sans modifier ses informations personnelles.
                </p>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : emailExists ? 'border-blue-500' : 'border-gray-300'}`}
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              disabled={emailExists}
              readOnly={emailExists}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              disabled={emailExists}
              readOnly={emailExists}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={emailExists}
              readOnly={emailExists}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={emailExists}
              readOnly={emailExists}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={emailExists}
                readOnly={emailExists}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={emailExists}
                readOnly={emailExists}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes {emailExists && "(Modifiable)"}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting || isCheckingEmail}
            >
              {isSubmitting 
                ? 'Envoi en cours...' 
                : emailExists 
                  ? 'Ajouter à mes clients' 
                  : 'Ajouter le client'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 