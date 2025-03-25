import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Building, ArrowLeft } from 'lucide-react';
import { createCabinet } from '../services/cabinetService';

const BrokerCreateCabinet: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [cabinetName, setCabinetName] = useState('');
  const [cabinetAddress, setCabinetAddress] = useState('');
  const [cabinetEmail, setCabinetEmail] = useState('');
  const [cabinetPhone, setCabinetPhone] = useState('');
  const [cabinetWebsite, setCabinetWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }

      const checkAuthorization = async () => {
        try {
          const userDocRef = doc(db, 'courtiers', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().type === 'courtier') {
            const courtierData = userDoc.data();
            
            // Vérifier si le courtier a le rôle 'admin'
            if (courtierData.role !== 'admin') {
              navigate('/courtier');
              return;
            }
            
            // Vérifier si le courtier n'a pas déjà un cabinet
            if (courtierData.cabinetId) {
              // Rediriger vers la page de gestion du cabinet existant
              navigate('/courtier/cabinet');
              return;
            }
            
            setIsAuthorized(true);
          } else {
            navigate('/login');
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de l\'autorisation:', err);
          navigate('/login');
        }
      };

      checkAuthorization();
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!cabinetName || !cabinetAddress) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer le cabinet
      if (!user) throw new Error('Utilisateur non connecté');
      
      await createCabinet({
        name: cabinetName,
        address: cabinetAddress,
        email: cabinetEmail,
        phone: cabinetPhone,
        website: cabinetWebsite,
        location: { lat: 0, lng: 0 }, // À remplacer par la vraie géolocalisation
        adminId: user.uid
      }, user.uid);
      
      // Rediriger vers la page de gestion du cabinet
      navigate('/courtier/cabinet');
    } catch (error) {
      console.error('Erreur lors de la création du cabinet:', error);
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p className="mb-4">Seuls les courtiers avec le rôle d'administrateur peuvent créer un cabinet.</p>
          <Link to="/courtier" className="text-blue-600 hover:underline">Retourner au tableau de bord</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/courtier')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-900 text-white py-6 px-8">
            <div className="flex items-center gap-4">
              <Building className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Créer un cabinet</h1>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label htmlFor="cabinetName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du cabinet *
                </label>
                <input 
                  id="cabinetName"
                  type="text"
                  value={cabinetName}
                  onChange={(e) => setCabinetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cabinetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse du cabinet *
                </label>
                <input 
                  id="cabinetAddress"
                  type="text"
                  value={cabinetAddress}
                  onChange={(e) => setCabinetAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cabinetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email du cabinet
                </label>
                <input 
                  id="cabinetEmail"
                  type="email"
                  value={cabinetEmail}
                  onChange={(e) => setCabinetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="cabinetPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone du cabinet
                </label>
                <input 
                  id="cabinetPhone"
                  type="tel"
                  value={cabinetPhone}
                  onChange={(e) => setCabinetPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="cabinetWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                  Site web du cabinet
                </label>
                <input 
                  id="cabinetWebsite"
                  type="url"
                  value={cabinetWebsite}
                  onChange={(e) => setCabinetWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.votrecabinet.fr"
                />
              </div>
              
              <div className="mt-8">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 bg-blue-900 text-white rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Création en cours...' : 'Créer le cabinet'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrokerCreateCabinet; 