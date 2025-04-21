import { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Calendar, Clock, FileText, Settings, LogOut, Users, BarChart as ChartBar, Search, Plus, Phone, Mail, MapPin, X, Edit, Trash2, Info, ChevronRight, ChevronLeft, ChevronDown, User, Shield, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBrokerRelations, BrokerClientRelation, deactivateRelation } from '../services/brokerClientRelationService';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import AddClientModal from '../components/AddClientModal';
import EditClientModal from '../components/EditClientModal';
import { getClientById } from '../services/clientService';

export default function BrokerClients() {
  const [user, loading, error] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string; photoURL?: string; }>({});
  const [authChecked, setAuthChecked] = useState(false);
  const [relations, setRelations] = useState<BrokerClientRelation[]>([]);
  const [filteredRelations, setFilteredRelations] = useState<BrokerClientRelation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRelation, setSelectedRelation] = useState<BrokerClientRelation | null>(null);
  const [showRelationDetails, setShowRelationDetails] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [editingRelation, setEditingRelation] = useState<BrokerClientRelation | null>(null);
  const [brokerName, setBrokerName] = useState('');
  const relationsPerPage = 10;
  const clientListRef = useRef<HTMLDivElement>(null);
  const [clientsWithAccount, setClientsWithAccount] = useState<Set<string>>(new Set());
  const [hasCabinet, setHasCabinet] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const checkAuthorization = async () => {
        try {
          const userDocRef = doc(db, 'courtiers', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().type === 'courtier') {
            setIsAuthorized(true);
            setBrokerName(userDoc.data().displayName || '');
            setHasCabinet(!!userDoc.data().cabinetId);
            loadRelations();
            setUserData({
              firstName: userDoc.data().firstName || '',
              lastName: userDoc.data().lastName || '',
              photoURL: userDoc.data().photoURL || '',
            });
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de l\'autorisation:', err);
        } finally {
          setAuthChecked(true);
        }
      };
      checkAuthorization();
    }
  }, [user, loading]);

  const loadRelations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await getBrokerRelations(user.uid, relationsPerPage);
      setRelations(result.relations);
      setFilteredRelations(result.relations);
      setLastVisible(result.lastVisible);
      setHasMore(result.relations.length === relationsPerPage);
      
      // Récupérer tous les emails des clients avec comptes utilisateurs actifs
      const usersRef = collection(db, 'users');
      const clientsQuery = query(
        usersRef,
        where('type', '==', 'client')
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      
      // Créer un ensemble d'emails de clients avec compte
      const clientEmails = new Set<string>();
      clientsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          clientEmails.add(data.email.toLowerCase());
        }
      });
      
      // Vérifier pour chaque relation si l'email du client est dans l'ensemble
      const clientAccountSet = new Set<string>();
      result.relations.forEach(relation => {
        if (relation.email && clientEmails.has(relation.email.toLowerCase())) {
          clientAccountSet.add(relation.clientId);
        }
      });
      
      setClientsWithAccount(clientAccountSet);
    } catch (err) {
      console.error('Erreur lors du chargement des relations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreRelations = async () => {
    if (!user || !lastVisible || !hasMore) return;
    
    try {
      const result = await getBrokerRelations(user.uid, relationsPerPage, lastVisible);
      if (result.relations.length > 0) {
        setRelations(prevRelations => [...prevRelations, ...result.relations]);
        setFilteredRelations(prevRelations => {
          if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            const newFilteredRelations = result.relations.filter(relation => 
              relation.clientName?.toLowerCase().includes(searchTermLower) ||
              relation.notes?.toLowerCase().includes(searchTermLower)
            );
            return [...prevRelations, ...newFilteredRelations];
          }
          return [...prevRelations, ...result.relations];
        });
        setLastVisible(result.lastVisible);
        setHasMore(result.relations.length === relationsPerPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des relations supplémentaires:', err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredRelations(relations);
      return;
    }
    
    const searchTermLower = value.toLowerCase();
    const filtered = relations.filter(relation => 
      relation.clientName?.toLowerCase().includes(searchTermLower) ||
      relation.notes?.toLowerCase().includes(searchTermLower)
    );
    setFilteredRelations(filtered);
  };

  const handleRelationClick = (relation: BrokerClientRelation) => {
    setSelectedRelation(relation);
    setShowRelationDetails(true);
  };

  const closeRelationDetails = () => {
    setShowRelationDetails(false);
    setSelectedRelation(null);
  };

  const handleDeactivateRelation = async (relationId: string) => {
    try {
      await deactivateRelation(relationId);
      // Recharger les relations après la désactivation
      loadRelations();
    } catch (err) {
      console.error('Erreur lors de la désactivation de la relation:', err);
    }
  };

  const handleEditRelation = (relation: BrokerClientRelation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRelation(relation);
    setShowEditClientModal(true);
  };

  if (loading || !authChecked) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error);
    return <div className="min-h-screen flex items-center justify-center">Erreur: {error.message}</div>;
  }

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Accès refusé. Vous n'êtes pas autorisé à voir cette page.</div>;
  }

  // Formatage de la date du dernier rendez-vous
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Aucun';
    
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[95%] mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Link to="/" className="bg-blue-50 p-2 rounded-xl">
                <img src="https://courtizy.fr/logo.png" alt="Logo" style={{ width: '32px', height: '32px', backgroundColor: 'transparent' }} />
              </Link>
              <Link to="/" className="text-2xl font-extrabold text-blue-950 tracking-tight">Courtizy</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{userData.firstName} {userData.lastName}</span>
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
            <Link to="/courtier/clients" className="flex flex-col items-center text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-100 transition-opacity -z-10"></div>
              <Users className="h-6 w-6 scale-110 transition-transform" />
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
            <Link to="/courtier/profil" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Profil</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-[140px] pr-[20px]">
          <div className="my-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Annuaire des clients</h1>
                <p className="text-gray-500">Gérez et suivez vos clients en un coup d'œil</p>
              </div>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                onClick={() => setShowAddClientModal(true)}
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Ajouter un client</span>
              </button>
            </div>

            {/* Search bar */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8 transition-all duration-200 hover:shadow-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un client par nom, email, téléphone..."
                  className="pl-12 w-full h-14 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Client List */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg" ref={clientListRef}>
              <div className="grid grid-cols-12 bg-gray-50/80 px-6 py-4 border-b border-gray-100">
                <div className="col-span-4 font-semibold text-gray-700">Nom</div>
                <div className="col-span-3 font-semibold text-gray-700">Contact</div>
                <div className="col-span-2 font-semibold text-gray-700">Rendez-vous</div>
                <div className="col-span-2 font-semibold text-gray-700">Dernier RDV</div>
                <div className="col-span-1 font-semibold text-gray-700 text-right">Actions</div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredRelations.length === 0 ? (
                <div className="text-center py-32 px-4">
                  <div className="text-gray-400 mb-3">
                    {searchTerm ? (
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    ) : (
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    )}
                  </div>
                  <p className="text-xl font-medium text-gray-500 mb-2">
                    {searchTerm ? "Aucun client ne correspond à votre recherche" : "Aucun client dans votre annuaire"}
                  </p>
                  <p className="text-gray-400">
                    {searchTerm ? "Essayez avec d'autres termes de recherche" : "Commencez par ajouter votre premier client"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredRelations.map((relation, index) => (
                    <div 
                      key={relation.id} 
                      className="grid grid-cols-12 px-6 py-4 hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer group"
                      onClick={() => handleRelationClick(relation)}
                    >
                      <div className="col-span-4 flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-medium">
                            {relation.clientName?.[0]}
                          </div>
                          {clientsWithAccount.has(relation.clientId) && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5" title="Ce client a un compte utilisateur">
                              <Shield className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {relation.clientName}
                            {clientsWithAccount.has(relation.clientId) && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">Compte</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{relation.notes || 'Aucune note'}</div>
                        </div>
                      </div>
                      <div className="col-span-3 flex flex-col justify-center">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm truncate hover:text-blue-600 transition-colors">{relation.email}</span>
                        </div>
                        {relation.phone && (
                          <div className="flex items-center space-x-2 text-gray-600 mt-1">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{relation.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{relation.appointmentCount || 0}</span>
                          <span className="text-gray-500 ml-1">rendez-vous</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <div className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                          {formatDate(relation.lastAppointmentDate)}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-end space-x-2">
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-200"
                          onClick={(e) => handleEditRelation(relation, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivateRelation(relation.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && !isLoading && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={loadMoreRelations}
                    className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow"
                  >
                    <ChevronDown className="h-5 w-5" />
                    <span>Charger plus de clients</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Details Sidebar */}
      {showRelationDetails && selectedRelation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedRelation.clientName}
                  </h2>
                  <p className="text-gray-500">{selectedRelation.notes || 'Aucune note'}</p>
                </div>
                <button
                  onClick={closeRelationDetails}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedRelation.email}</span>
                    </div>
                  </div>
                  
                  {selectedRelation.phone && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Téléphone</div>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedRelation.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedRelation.address && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Adresse</div>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedRelation.address}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Rendez-vous</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedRelation.appointmentCount || 0}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Dernier rendez-vous</div>
                    <div className="text-gray-900">
                      {formatDate(selectedRelation.lastAppointmentDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-b-2xl">
              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Planifier un rendez-vous</span>
                </button>
                <button className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Voir les documents</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      <AddClientModal 
        isOpen={showAddClientModal} 
        onClose={() => setShowAddClientModal(false)} 
        brokerId={user?.uid || ''} 
        brokerName={brokerName}
        onSuccess={loadRelations}
      />

      {/* Edit Client Modal */}
      {editingRelation && (
        <EditClientModal 
          isOpen={showEditClientModal} 
          onClose={() => {
            setShowEditClientModal(false);
            setEditingRelation(null);
          }} 
          brokerId={user?.uid || ''} 
          brokerName={brokerName}
          clientId={editingRelation.clientId}
          relationId={editingRelation.id}
          onSuccess={loadRelations}
        />
      )}
    </div>
  );
} 