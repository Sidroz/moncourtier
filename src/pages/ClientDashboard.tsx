import React, { useState, useEffect } from 'react';
import { Calendar, HelpCircle, User, LogOut, PlusSquare, ArrowRight } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { FaPlus } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
  
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.warn('Document utilisateur non trouvé dans Firestore');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
      }
    };
  
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Rediriger vers la page de connexion
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  if (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error);
    return <div className="min-h-screen flex items-center justify-center">Erreur: {error.message}</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Veuillez vous connecter.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#244257] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8" />
            <span className="text-2xl font-bold">MonCourtier</span>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link to="/client" className="px-4 py-2 bg-white text-[#244257] rounded-lg hover:bg-gray-100">
                Accueil
              </Link>
              <button className="px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-800">
                Rendez-vous
              </button>
              <button className="px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-800">
                Vos Courtiers
              </button>
              <Link to="/client/settings" className="px-4 py-2 bg-white text-[#244257] rounded-lg hover:bg-gray-100">
                Profil
              </Link>
            </nav>
            <button className="flex items-center space-x-2 px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-800">
              <HelpCircle className="h-5 w-5" />
              <span>Centre d'aide</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm">{userData ? `${userData.firstName} ${userData.lastName}` : user.email || 'Utilisateur'}</span>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-gray-300 hover:text-white text-left flex items-center"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {userData ? userData.firstName : 'Utilisateur'}
          </h1>
          <p className="text-gray-600 mt-2">Vous n'avez pas de rendez-vous de prévu.</p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Liste des rendez-vous */}
          <div className="bg-white rounded-lg shadow-md p-6 relative min-h-[400px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Liste des rendez-vous</h2>
            </div>
            <p className="text-gray-600 mb-4 text-center">Vous n'avez pas de rendez-vous.</p>
            <button className="mt-6 w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium py-2 px-4 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <FaPlus className="h-5 w-5" />
                <span>Prendre un rendez-vous</span>
            </button>
            <div className="absolute top-5 right-4 bg-[#244257] text-white rounded-full w-8 h-8 flex items-center justify-center">
              0
            </div>
          </div>

          {/* Card 2: Liste des courtiers */}
          <div className="bg-white rounded-lg shadow-md p-6 relative min-h-[400px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Liste des Courtiers</h2>
              <User className="h-6 w-6 text-[#244257]" />
            </div>
            <p className="text-gray-600 mb-4 text-center">Vous n'avez pas de Courtier enregistré.</p>
            <button className="mt-6 w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              Voir tous mes courtiers
            </button>
          </div>

          {/* Card 3: Informations de l'utilisateur */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-900 font-semibold">{userData ? `${userData.firstName} ${userData.lastName}` : user.email || 'Utilisateur'}</p>
              <p className="text-gray-900 font-regular">{user.email}</p>
              <button className="mt-2 inline-block px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-800">
                Voir mon compte
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}