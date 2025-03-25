'use client';
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Calendar, Clock, FileText, Settings, LogOut, Users, BarChart as ChartBar, Upload, User, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BrokerModifProfil = () => {
  const [user, loading, error] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    presentation: '',
    anneesExperience: '',
    experienceUnit: 'annees',
    specialties: [] as string[],
    facebookUrl: '',
    linkedinUrl: '',
    formations: [] as string[],
    certifications: [] as string[],
    languesParlees: [] as string[],
    modesAcces: [] as string[],
    moyensPaiement: [] as string[],
    photoUrl: '',
    firstName: '',
    lastName: ''
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newFormation, setNewFormation] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLangue, setNewLangue] = useState('');
  const [newModeAcces, setNewModeAcces] = useState('');
  const [newMoyenPaiement, setNewMoyenPaiement] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [hasCabinet, setHasCabinet] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const specialtiesOptions = ['assurance', 'habitation', 'crédit', 'investissement', 'épargne'];
  const languesOptions = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Arabe', 'Portugais', 'Mandarin'];
  const modesAccesOptions = ['En présentiel', 'À distance', 'À domicile', 'Au bureau'];
  const moyensPaiementOptions = ['Carte bancaire', 'Virement', 'Chèque', 'Espèces', 'Prélèvement'];

  useEffect(() => {
    if (!loading && user) {
      const checkAuthorization = async () => {
        try {
          const userDocRef = doc(db, 'courtiers', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().type === 'courtier') {
            setIsAuthorized(true);
            const courtierData = userDoc.data();
            
            // Gérer la nouvelle structure d'expérience
            let experienceValue = '';
            let experienceUnit = 'annees';
            
            if (courtierData.experience) {
              if (typeof courtierData.experience === 'object') {
                // Nouvelle structure
                experienceValue = courtierData.experience.value.toString();
                experienceUnit = courtierData.experience.unit;
              } else {
                // Ancienne structure (pour la compatibilité)
                const experience = courtierData.experience;
                if (experience < 1) {
                  experienceValue = Math.round(experience * 12).toString();
                  experienceUnit = 'mois';
                } else {
                  experienceValue = experience.toString();
                  experienceUnit = 'annees';
                }
              }
            }

            setFormData({
              presentation: courtierData.description || '',
              anneesExperience: experienceValue,
              experienceUnit,
              specialties: courtierData.specialties || [],
              facebookUrl: courtierData.facebookUrl || '',
              linkedinUrl: courtierData.linkedinUrl || '',
              formations: courtierData.education || [],
              certifications: courtierData.certifications || [],
              languesParlees: courtierData.languages || [],
              modesAcces: courtierData.accessMethods || [],
              moyensPaiement: courtierData.paymentMethods || [],
              photoUrl: courtierData.photoUrl || '',
              firstName: courtierData.firstName || '',
              lastName: courtierData.lastName || ''
            });
            setHasCabinet(!!courtierData.cabinetId);
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de l\'autorisation:', err);
          toast.error('Erreur lors du chargement des données');
        } finally {
          setAuthChecked(true);
        }
      };
      checkAuthorization();
    }
  }, [user, loading]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = (field: keyof typeof formData, value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }));
    setValue('');
  };

  const handleRemoveItem = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleAddSpecialty = (specialty: string) => {
    if (!formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    }
  };

  const handleAddFromSelect = (field: keyof typeof formData, value: string) => {
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const userDocRef = doc(db, 'courtiers', user.uid);
      
      // Sauvegarder à la fois la valeur et l'unité de l'expérience
      const experienceValue = parseFloat(formData.anneesExperience) || 0;

      await updateDoc(userDocRef, {
        description: formData.presentation,
        experience: {
          value: experienceValue,
          unit: formData.experienceUnit
        },
        specialties: formData.specialties,
        linkedinUrl: formData.linkedinUrl,
        facebookUrl: formData.facebookUrl,
        education: formData.formations,
        certifications: formData.certifications,
        languages: formData.languesParlees,
        accessMethods: formData.modesAcces,
        paymentMethods: formData.moyensPaiement,
        photoUrl: formData.photoUrl,
        firstName: formData.firstName,
        lastName: formData.lastName,
        updatedAt: new Date()
      });
      
      setSuccessMessage('Profil mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setErrorMessage('Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Créer une référence unique pour l'image
      const imageRef = ref(storage, `courtiers/${user.uid}/profile-${Date.now()}`);
      
      // Upload l'image
      await uploadBytes(imageRef, file);
      
      // Obtenir l'URL de l'image
      const photoUrl = await getDownloadURL(imageRef);
      
      // Mettre à jour le formulaire
      setFormData(prev => ({
        ...prev,
        photoUrl
      }));

      toast.success('Photo uploadée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      toast.error('Erreur lors de l\'upload de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading || !authChecked) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Erreur: {error.message}</div>;
  }

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Accès refusé. Vous n'êtes pas autorisé à voir cette page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[95%] mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <Link to="/" className="text-2xl font-bold text-blue-600">MonCourtier</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{formData.firstName} {formData.lastName}</span>
              <button className="text-gray-600 hover:text-gray-800">
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
            <Link to="/courtier/settings" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <Settings className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Paramètres</span>
            </Link>
            <Link to="/courtier/profil" className="flex flex-col items-center text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-100 transition-opacity -z-10"></div>
              <User className="h-6 w-6 scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Profil</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-[140px] pr-[20px]">
          <div className="bg-white rounded-lg shadow-lg p-8 my-6">
            <h2 className="text-2xl font-semibold mb-8 text-gray-800 border-b pb-4">Modifier mon profil</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Photo de profil */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Photo de profil
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt="Photo de profil"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white shadow-md">
                        <Upload className="h-10 w-10 text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                      disabled={uploadingPhoto}
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`inline-flex items-center px-5 py-2.5 border rounded-md shadow-sm text-sm font-medium transition-all duration-200
                        ${uploadingPhoto 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' 
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-transparent cursor-pointer'}`}
                    >
                      {uploadingPhoto ? 'Upload en cours...' : 'Changer la photo'}
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      Formats acceptés : JPG, PNG, GIF (max. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Présentation */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Présentation
                </label>
                <textarea
                  name="presentation"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={formData.presentation}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre parcours et votre expertise en quelques lignes..."
                />
              </div>

              {/* Informations de base */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 pb-2 border-b">Informations professionnelles</h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Expérience
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      name="anneesExperience"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      value={formData.anneesExperience}
                      onChange={handleInputChange}
                      placeholder="Ex: 0.5 pour 6 mois"
                    />
                    <select
                      name="experienceUnit"
                      value={formData.experienceUnit}
                      onChange={handleInputChange}
                      className="px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                    >
                      <option value="mois">Mois</option>
                      <option value="annees">Années</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 pb-2 border-b">Réseaux sociaux</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      placeholder="https://linkedin.com/in/votre-profil"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      name="facebookUrl"
                      placeholder="https://facebook.com/votre-page"
                      value={formData.facebookUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Spécialités */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 pb-2 border-b">Expertise</h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Spécialités
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                      onChange={(e) => handleAddSpecialty(e.target.value)}
                      value=""
                    >
                      <option value="" disabled>Sélectionner une spécialité</option>
                      {specialtiesOptions.filter(option => !formData.specialties.includes(option)).map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-1.5 rounded-full text-sm bg-blue-50 text-blue-800 border border-blue-100"
                      >
                        {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('specialties', index)}
                          className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formations et Certifications */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 pb-2 border-b">Qualifications</h3>
                {[
                  { title: 'Formations', field: 'formations', state: newFormation, setState: setNewFormation },
                  { title: 'Certifications', field: 'certifications', state: newCertification, setState: setNewCertification }
                ].map(({ title, field, state, setState }) => (
                  <div key={field} className="space-y-4 mb-6 last:mb-0">
                    <label className="block text-sm font-medium text-gray-700">
                      {title}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder={`Ajouter ${title.toLowerCase()}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem(field as keyof typeof formData, state, setState)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        Ajouter
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(formData[field as keyof typeof formData] as string[]).map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-1.5 rounded-full text-sm bg-blue-50 text-blue-800 border border-blue-100"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(field as keyof typeof formData, index)}
                            className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Langues, Modes d'accès et Moyens de paiement */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 pb-2 border-b">Informations pratiques</h3>
                {[
                  { title: 'Langues parlées', field: 'languesParlees', options: languesOptions },
                  { title: 'Modes d\'accès', field: 'modesAcces', options: modesAccesOptions },
                  { title: 'Moyens de paiement', field: 'moyensPaiement', options: moyensPaiementOptions }
                ].map(({ title, field, options }) => (
                  <div key={field} className="space-y-4 mb-6 last:mb-0">
                    <label className="block text-sm font-medium text-gray-700">
                      {title}
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                        onChange={(e) => handleAddFromSelect(field as keyof typeof formData, e.target.value)}
                        value=""
                      >
                        <option value="" disabled>Sélectionner {title.toLowerCase()}</option>
                        {options.filter(option => !(formData[field as keyof typeof formData] as string[]).includes(option)).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(formData[field as keyof typeof formData] as string[]).map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-1.5 rounded-full text-sm bg-blue-50 text-blue-800 border border-blue-100"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(field as keyof typeof formData, index)}
                            className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton de soumission */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-8 py-3 font-medium text-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200
                    ${isSaving 
                      ? 'bg-gray-400 cursor-wait' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'}`}
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerModifProfil; 