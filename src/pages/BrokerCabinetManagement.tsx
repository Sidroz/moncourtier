import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Settings, 
  User, 
  BarChart,
  Building,
  UserPlus,
  Trash2,
  Edit,
  UserMinus,
  ShieldCheck,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { getCabinetByBrokerId, getCourtiersByCabinetId, deleteCabinet, findCourtierByEmail, addCourtierToCabinet } from '../services/cabinetService';
import { Cabinet } from '../types/cabinet';
import { Courtier } from '../types/courtier';

const BrokerCabinetManagement: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [courtiers, setCourtiers] = useState<Courtier[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditCabinetModal, setShowEditCabinetModal] = useState(false);
  const [showDeleteCabinetModal, setShowDeleteCabinetModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // États pour l'ajout de membre
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'manager' | 'associate' | 'employee'>('employee');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [addMemberSuccess, setAddMemberSuccess] = useState(false);

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
            setIsAuthorized(true);
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin');
            
            // Charger les données du cabinet
            loadCabinetData();
          } else {
            navigate('/login');
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de l\'autorisation:', err);
          navigate('/login');
        } finally {
          setPageLoading(false);
        }
      };

      checkAuthorization();
    }
  }, [user, loading, navigate]);

  const loadCabinetData = async () => {
    if (!user) return;
    
    try {
      // Récupérer le cabinet du courtier
      const cabinet = await getCabinetByBrokerId(user.uid);
      setCabinet(cabinet);
      
      if (cabinet) {
        // Récupérer tous les courtiers du cabinet
        const cabinetCourtiers = await getCourtiersByCabinetId(cabinet.id);
        setCourtiers(cabinetCourtiers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du cabinet:', error);
    }
  };

  const handleDeleteCabinet = async () => {
    if (!cabinet || !isAdmin) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await deleteCabinet(cabinet.id);
      setShowDeleteCabinetModal(false);
      // Rediriger vers le tableau de bord après la suppression
      navigate('/courtier');
    } catch (error) {
      console.error('Erreur lors de la suppression du cabinet:', error);
      setDeleteError(error instanceof Error ? error.message : 'Une erreur s\'est produite lors de la suppression du cabinet');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cabinet) return;
    
    setIsAddingMember(true);
    setAddMemberError(null);
    setAddMemberSuccess(false);
    
    try {
      // Trouver le courtier par email
      const courtier = await findCourtierByEmail(memberEmail);
      
      if (!courtier) {
        setAddMemberError('Aucun courtier trouvé avec cette adresse email');
        setIsAddingMember(false);
        return;
      }
      
      // Vérifier si le courtier appartient déjà à un cabinet
      if (courtier.cabinetId) {
        if (courtier.cabinetId === cabinet.id) {
          setAddMemberError('Ce courtier est déjà membre de votre cabinet');
        } else {
          setAddMemberError('Ce courtier appartient déjà à un autre cabinet');
        }
        setIsAddingMember(false);
        return;
      }
      
      // Ajouter le courtier au cabinet
      await addCourtierToCabinet(cabinet.id, courtier.id, memberRole);
      
      // Rafraîchir la liste des courtiers
      const updatedCourtiers = await getCourtiersByCabinetId(cabinet.id);
      setCourtiers(updatedCourtiers);
      
      // Réinitialiser le formulaire
      setMemberEmail('');
      setMemberRole('employee');
      setAddMemberSuccess(true);
      
      // Fermer la modale après un court délai
      setTimeout(() => {
        if (addMemberSuccess) {
          setShowAddMemberModal(false);
          setAddMemberSuccess(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      setAddMemberError(error instanceof Error ? error.message : 'Une erreur s\'est produite lors de l\'ajout du membre');
    } finally {
      setIsAddingMember(false);
    }
  };

  if (loading || pageLoading) {
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
          <p className="mb-4">Vous n'êtes pas autorisé à accéder à cette page.</p>
          <Link to="/login" className="text-blue-600 hover:underline">Retourner à la page de connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-20 flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div className="w-24 fixed left-0 top-1/2 transform -translate-y-1/2 h-[600px] py-6 ml-[20px] bg-[#244257]/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center shadow-xl transition-shadow duration-300 hover:shadow-2xl animate-fadeIn">
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
          <Link to="/courtier/cabinet" className="flex flex-col items-center text-white group transition-all duration-300 relative w-24">
            <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-100 transition-opacity -z-10"></div>
            <Building className="h-6 w-6 scale-110 transition-transform" />
            <span className="text-xs mt-2 font-medium">Cabinet</span>
          </Link>
          <Link to="/courtier/stats" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
            <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            <BarChart className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs mt-2 font-medium">Statistiques</span>
          </Link>
          <Link to="/courtier/settings" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
            <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
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

      {/* Contenu principal avec animations et transitions */}
      <div className="flex-1 ml-[140px] mr-[20px] pb-10">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#244257] to-blue-500 bg-clip-text text-transparent">
            {cabinet ? `Gestion du Cabinet: ${cabinet.name}` : 'Aucun cabinet'}
          </h1>
          
          {isAdmin && cabinet && (
            <div className="flex gap-2">
              <button 
                onClick={() => setShowEditCabinetModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#244257] text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Edit className="w-4 h-4" />
                Modifier le cabinet
              </button>
            </div>
          )}
        </div>
        
        {!cabinet ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center transform transition-all duration-300 hover:shadow-xl">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cabinet associé</h3>
            <p className="text-gray-500 mb-6">Vous n'êtes pas encore associé à un cabinet.</p>
            {isAdmin ? (
              <button 
                onClick={() => navigate('/courtier/create-cabinet')}
                className="inline-flex items-center justify-center px-4 py-2 bg-[#244257] text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Building className="h-5 w-5 mr-2" />
                Créer un cabinet
              </button>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Seuls les courtiers avec un rôle d'administrateur peuvent créer un cabinet.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* Informations du cabinet avec effet de carte moderne */}
            <div className="bg-white rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 text-[#244257]">Informations du cabinet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 mb-1">Nom</p>
                  <p className="font-medium">{cabinet.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Adresse</p>
                  <p className="font-medium">{cabinet.address}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Téléphone</p>
                  <p className="font-medium">{cabinet.phone || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{cabinet.email || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Site web</p>
                  <p className="font-medium">
                    {cabinet.website ? (
                      <a href={cabinet.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {cabinet.website}
                      </a>
                    ) : 'Non spécifié'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Liste des membres avec tableau moderne */}
            <div className="bg-white rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#244257]">Membres du cabinet</h2>
                {isAdmin && (
                  <button 
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#244257] text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajouter un membre
                  </button>
                )}
              </div>
              
              {courtiers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun membre dans ce cabinet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Téléphone
                        </th>
                        {isAdmin && (
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courtiers.map((courtier) => (
                        <tr key={courtier.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                {courtier.photoUrl ? (
                                  <img className="h-10 w-10 rounded-full" src={courtier.photoUrl} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-6 w-6 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {courtier.firstName} {courtier.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              courtier.role === 'admin' 
                                ? 'bg-green-100 text-green-800' 
                                : courtier.role === 'manager' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {courtier.role === 'admin' 
                                ? 'Administrateur' 
                                : courtier.role === 'manager' 
                                ? 'Gestionnaire' 
                                : courtier.role === 'associate' 
                                ? 'Associé' 
                                : 'Employé'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {courtier.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {courtier.phone || '-'}
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                {courtier.id !== user?.uid && (
                                  <>
                                    <button 
                                      className="text-indigo-600 hover:text-indigo-900"
                                      title="Changer le rôle"
                                    >
                                      <ShieldCheck className="h-4 w-4" />
                                    </button>
                                    <button 
                                      className="text-red-600 hover:text-red-900"
                                      title="Retirer du cabinet"
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Actions dangereuses avec effet de carte d'alerte */}
            {isAdmin && (
              <div className="bg-white rounded-xl shadow-sm p-8 border-l-4 border-red-500 transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl font-semibold mb-6 text-[#244257]">Actions dangereuses</h2>
                <button 
                  onClick={() => setShowDeleteCabinetModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer le cabinet
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Cette action est irréversible et supprimera toutes les données associées au cabinet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modales avec animations */}
      {showDeleteCabinetModal && cabinet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 animate-slideIn">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
              <button 
                onClick={() => setShowDeleteCabinetModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Êtes-vous sûr de vouloir supprimer ce cabinet ?</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      La suppression du cabinet <span className="font-medium text-gray-900">{cabinet.name}</span> est irréversible.
                      Cette action supprimera toutes les associations entre les courtiers et ce cabinet.
                    </p>
                  </div>
                  {deleteError && (
                    <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm">
                      {deleteError}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={() => setShowDeleteCabinetModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                  onClick={handleDeleteCabinet}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer définitivement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showAddMemberModal && cabinet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 animate-slideIn">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un membre</h3>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6">
              <div className="mb-4">
                <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email du courtier
                </label>
                <input
                  type="email"
                  id="memberEmail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@exemple.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Le courtier doit déjà avoir un compte sur la plateforme.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle dans le cabinet
                </label>
                <select
                  id="memberRole"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as 'manager' | 'associate' | 'employee')}
                  required
                >
                  <option value="manager">Gestionnaire</option>
                  <option value="associate">Associé</option>
                  <option value="employee">Employé</option>
                </select>
              </div>
              
              {addMemberError && (
                <div className="mb-4 p-2 bg-red-50 text-red-700 rounded text-sm">
                  {addMemberError}
                </div>
              )}
              
              {addMemberSuccess && (
                <div className="mb-4 p-2 bg-green-50 text-green-700 rounded text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Membre ajouté avec succès!
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={() => setShowAddMemberModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  disabled={isAddingMember}
                >
                  {isAddingMember ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ajouter le membre
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerCabinetManagement; 