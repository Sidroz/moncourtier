import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { Calendar, LogOut, User, HelpCircle, Shield, ArrowRight, Trash2 } from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
}

export default function ClientSecurity() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [profile, setProfile] = useState<UserProfile>({ firstName: '', lastName: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    };

    fetchUserProfile();
  }, [auth.currentUser, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (newPassword !== confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSaving(true);
    try {
      // Réauthentification avec le mot de passe actuel
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Mise à jour du mot de passe
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Le mot de passe actuel est incorrect');
      } else {
        toast.error('Erreur lors de la mise à jour du mot de passe');
        console.error(error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    if (deleteConfirmation !== "SUPPRIMER") {
      toast.error('Veuillez écrire "SUPPRIMER" pour confirmer');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid));
      await deleteUser(auth.currentUser);
      toast.success('Compte supprimé avec succès');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#244257] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8" />
            <span className="text-2xl font-bold">MonCourtier</span>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link to="/" className="px-4 py-2 bg-white text-[#244257] rounded-lg hover:bg-gray-100">
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
                <span className="text-sm">{profile.firstName} {profile.lastName}</span>
                <button 
                  onClick={handleSignOut}
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
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#244257] mb-2">Sécurité du compte</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 mb-8">
            <Link to="/client/settings">
              <button className="bg-white text-[#244257] px-6 py-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Mon Profil</span>
              </button>
            </Link>
            <button className="bg-[#244257] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#1a3244] transition-colors duration-200 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Sécurité</span>
            </button>
          </div>

          {/* Main Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Password Change Section */}
            <form onSubmit={handlePasswordChange} className="space-y-6 mb-12">
              <h3 className="text-lg font-medium text-gray-900">Changer le mot de passe</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Votre mot de passe actuel
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#244257] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#1a3244] transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Mise à jour...</span>
                    </>
                  ) : (
                    <>
                      <span>Mettre à jour le mot de passe</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Delete Account Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-red-600 mb-4">Zone dangereuse</h3>
              <p className="text-gray-600 mb-6">
                Une fois que vous supprimez votre compte, il n'y a pas de retour en arrière. Soyez certain.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder='Écrivez "SUPPRIMER" pour confirmer'
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Supprimer mon compte</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
