import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { updateEmail, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { Calendar, Clock, Settings, LogOut, Users, BarChart as ChartBar, Mail, User, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function BrokerSettings() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string; photoURL?: string; }>({});
  const [hasCabinet, setHasCabinet] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // États pour les formulaires
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  useEffect(() => {
    if (!loading && user) {
      setEmail(user.email || '');
      
      const checkAuthorization = async () => {
        try {
          const userDocRef = doc(db, 'courtiers', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().type === 'courtier') {
            setIsAuthorized(true);
            setUserData({
              firstName: userDoc.data().firstName || '',
              lastName: userDoc.data().lastName || '',
              photoURL: userDoc.data().photoURL || '',
            });
            
            // Vérifier si le courtier a un cabinet
            setHasCabinet(!!userDoc.data().cabinetId);
            setIsAdmin(userDoc.data().role === 'admin');
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de l\'autorisation:', err);
        } finally {
          setAuthChecked(true);
        }
      };
      
      checkAuthorization();
    } else if (!loading && !user) {
      navigate('/login');
      setAuthChecked(true);
    }
  }, [user, loading, navigate]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, email);
      toast.success('Email mis à jour avec succès');
      setCurrentPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const credential = EmailAuthProvider.credential(user.email!, deleteConfirmPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Supprimer les données du courtier dans Firestore
      await deleteDoc(doc(db, 'brokers', user.uid));
      
      // Supprimer le compte Firebase
      await deleteUser(user);
      
      toast.success('Compte supprimé avec succès');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  if (!authChecked || loading || !isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[95%] mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <Link to="/" className="text-2xl font-bold text-blue-600">Courtizy</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{userData.firstName} {userData.lastName}</span>
              <button 
                onClick={() => auth.signOut()}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full pt-20 flex">
        {/* Sidebar */}
        <div className="w-24 fixed left-0 top-1/2 transform -translate-y-1/2 h-[600px] py-6 ml-[20px] bg-[#244257]/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center shadow-xl transition-all duration-300 hover:shadow-2xl animate-fadeIn">
          <div className="flex flex-col items-center space-y-6 animate-slideIn">
            <Link to="/courtier/calendrier" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <Calendar className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Agenda</span>
            </Link>
            <Link to="/courtier/clients" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Clients</span>
            </Link>
            <Link to="/courtier/disponibilites" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <Clock className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Disponibilités</span>
            </Link>
            {hasCabinet && (
              <Link to="/courtier/cabinet" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
                <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                <Building className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs mt-2 font-medium">Cabinet</span>
              </Link>
            )}
            <Link to="/courtier/stats" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <ChartBar className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Statistiques</span>
            </Link>
            <Link to="/courtier/settings" className="flex flex-col items-center text-white bg-white/10 group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-100 transition-opacity -z-10"></div>
              <Settings className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Paramètres</span>
            </Link>
            <Link to="/courtier/profil" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Profil</span>
            </Link>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 ml-[140px] pr-[20px]">
          <h1 className="text-2xl font-bold mb-8">Paramètres du compte</h1>

          {/* Section Email */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Modifier l'email
            </h2>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nouvel email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Mettre à jour l'email
              </button>
            </form>
          </div>

          {/* Section Mot de passe */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Modifier le mot de passe</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Mettre à jour le mot de passe
              </button>
            </form>
          </div>

          {/* Section Suppression du compte */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Supprimer le compte</h2>
            <p className="text-gray-600 mb-4">
              Attention : Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmez votre mot de passe</label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Supprimer mon compte
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
