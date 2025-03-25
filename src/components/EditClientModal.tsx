import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { updateClient, getClientById } from '../services/clientService';
import { createBrokerClientRelation } from '../services/brokerClientRelationService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerId: string;
  brokerName: string;
  clientId: string;
  relationId: string;
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
}

export default function EditClientModal({ isOpen, onClose, brokerId, brokerName, clientId, relationId, onSuccess }: EditClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserAccount, setHasUserAccount] = useState(false);

  // Charger les données du client
  useEffect(() => {
    if (isOpen && clientId) {
      const fetchClientData = async () => {
        setIsLoading(true);
        try {
          const client = await getClientById(clientId);
          if (client) {
            setFormData({
              firstName: client.firstName || '',
              lastName: client.lastName || '',
              email: client.email || '',
              phone: client.phone || '',
              address: client.address || '',
              city: client.city || '',
              postalCode: client.postalCode || '',
              notes: client.notes || ''
            });
            
            // Vérifier si l'email du client correspond à un compte utilisateur existant
            try {
              // Cette vérification pourrait être déplacée dans un service dédié
              const usersRef = collection(db, 'users');
              const q = query(
                usersRef,
                where('email', '==', client.email),
                where('type', '==', 'client')
              );
              const querySnapshot = await getDocs(q);
              
              // Si on trouve un utilisateur avec cet email et de type 'client', c'est un compte utilisateur
              setHasUserAccount(!querySnapshot.empty);
            } catch (error) {
              console.error('Erreur lors de la vérification du compte utilisateur:', error);
              // En cas d'erreur, on utilise la méthode de secours
              setHasUserAccount(client.hasAccount === true || client.type === 'client');
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données du client:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchClientData();
    }
  }, [isOpen, clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à saisir
    if (errors[name as keyof ClientFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};
    
    if (!hasUserAccount) {
      // Validation complète seulement pour les clients sans compte utilisateur
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
    } else {
      // Pour les clients avec compte, on ne valide que les notes
      // Pas de validation spécifique pour les notes
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (hasUserAccount) {
        // Pour les clients avec compte utilisateur, on ne met à jour que les notes
        // et on met à jour la relation courtier-client
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
      } else {
        // Pour les clients sans compte, on met à jour toutes les informations
        const success = await updateClient(clientId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || '',
          address: formData.address || '',
          city: formData.city || '',
          postalCode: formData.postalCode || '',
          notes: formData.notes || ''
        });
        
        if (success) {
          // Mettre à jour la relation courtier-client avec les nouvelles informations
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
        }
      }
      
      onClose();
      
      // Appeler la fonction de succès si elle est fournie
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la modification du client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Modifier le client</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {hasUserAccount && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-amber-600 h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Ce client possède un compte utilisateur</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Ce client gère ses propres informations. Seules les notes peuvent être modifiées par vous.
                  </p>
                </div>
              </div>
            )}
            
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
                disabled={hasUserAccount}
                readOnly={hasUserAccount}
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
                disabled={hasUserAccount}
                readOnly={hasUserAccount}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                disabled={hasUserAccount}
                readOnly={hasUserAccount}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
                disabled={hasUserAccount}
                readOnly={hasUserAccount}
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
                disabled={hasUserAccount}
                readOnly={hasUserAccount}
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
                  disabled={hasUserAccount}
                  readOnly={hasUserAccount}
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
                  disabled={hasUserAccount}
                  readOnly={hasUserAccount}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes {hasUserAccount && "(Modifiable)"}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 