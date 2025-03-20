import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, updateEmail, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { Calendar, LogOut, User, Lock, HelpCircle, Home, Calendar as CalendarIcon, Users, Shield, ArrowRight } from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function ClientSettings() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setProfile({
            ...userDoc.data() as UserProfile,
            email: auth.currentUser.email || ''
          });
        }
      } catch (error) {
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [auth.currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postalCode: profile.postalCode
      });

      if (profile.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, profile.email);
      }

      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-[#244257] mb-2">Paramètres du compte</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 mb-8">
            <button className="bg-[#244257] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#1a3244] transition-colors duration-200 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Mon Profil</span>
            </button>
            <Link to="/client/security">
              <button className="bg-white text-[#244257] px-6 py-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Sécurité</span>
              </button>
            </Link>
          </div>

          {/* Main Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Confidentiality Notice */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start space-x-4 mb-8">
              <Lock className="h-6 w-6 text-[#244257] flex-shrink-0 mt-1" />
              <div>
                <p className="text-[#244257] font-semibold mb-1">
                  Ces données sont confidentielles
                </p>
                <p className="text-gray-600 text-sm">
                  Nous ne recueillerons et n'utiliserons les informations que de manière utile pour vous et d'une manière compatible avec vos droits.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#244257] transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <User className="w-8 h-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Photo de profil</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Photo de profil</h3>
                  <p className="text-sm text-gray-500">Format JPG ou PNG. Taille max 1MB</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={profile.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={profile.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                      placeholder="Votre adresse"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={profile.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                      placeholder="Votre ville"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      value={profile.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#244257] focus:border-transparent transition-shadow duration-200"
                      placeholder="Code postal"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#244257] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#1a3244] transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <span>Enregistrer les modifications</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}