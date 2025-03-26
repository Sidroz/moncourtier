import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, Timestamp, addDoc } from 'firebase/firestore';
import { Calendar, Clock, FileText, Settings, LogOut, Users, BarChart as ChartBar, User, Mail, Phone, Home, Plus, X, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddClientModal from '../components/AddClientModal';

// Interface pour les tâches
interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

// Interface pour le formulaire de tâche
interface TaskFormData {
  titre: string;
  description: string;
  priorite: 'high' | 'medium' | 'low';
  date_echeance?: Date;
}

export default function BrokerDashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string; photoURL?: string; }>({});
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    titre: '',
    description: '',
    priorite: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE d MMMM yyyy", { locale: fr });
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [hasCabinet, setHasCabinet] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && user) {
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
    }
  }, [user, loading]);

  // Charger les rendez-vous du jour
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !isAuthorized) return;
      
      try {
        setLoadingAppointments(true);
        
        // Créer les timestamps pour aujourd'hui (début et fin de journée)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const startDate = format(startOfDay, 'yyyy-MM-dd');
        const endDate = format(endOfDay, 'yyyy-MM-dd');
        
        // Requête pour obtenir les rendez-vous du jour pour ce courtier
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(
          appointmentsRef,
          where('brokerId', '==', user.uid),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'asc')
        );
        
        const querySnapshot = await getDocs(appointmentsQuery);
        const appointments: any[] = [];
        
        // Récupérer les informations pour chaque rendez-vous
        for (const appointmentDoc of querySnapshot.docs) {
          const appointmentData = appointmentDoc.data();
          
          appointments.push({
            id: appointmentDoc.id,
            client: appointmentData.clientName || 'Client',
            type: appointmentData.title || 'Rendez-vous',
            time: appointmentData.startTime || '',
            status: appointmentData.status || 'pending'
          });
        }
        
        setTodayAppointments(appointments);
      } catch (err) {
        console.error('Erreur lors de la récupération des rendez-vous:', err);
      } finally {
        setLoadingAppointments(false);
      }
    };
    
    fetchAppointments();
  }, [user, isAuthorized]);

  // Charger les tâches en attente
  const fetchTasks = async () => {
    if (!user || !isAuthorized) return;
    
    try {
      const tasksRef = collection(db, 'taches');
      const tasksQuery = query(
        tasksRef,
        where('courtier_id', '==', user.uid),
        where('statut', '==', 'en_attente')
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const taskData = doc.data();
        tasks.push({
          id: doc.id,
          title: taskData.titre,
          priority: taskData.priorite || 'medium',
          description: taskData.description
        });
      });
      
      setPendingTasks(tasks);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches:', err);
      // Utiliser des tâches par défaut pour le moment si nécessaire
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, isAuthorized]);

  // Gérer la soumission du formulaire de tâche
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Créer un nouvel objet de tâche
      const newTask = {
        titre: taskFormData.titre,
        description: taskFormData.description,
        priorite: taskFormData.priorite,
        courtier_id: user.uid,
        statut: 'en_attente',
        date_creation: Timestamp.now(),
        ...(taskFormData.date_echeance && { date_echeance: Timestamp.fromDate(taskFormData.date_echeance) })
      };
      
      // Ajouter la tâche à Firestore
      await addDoc(collection(db, 'taches'), newTask);
      
      // Réinitialiser le formulaire et fermer la modale
      setTaskFormData({
        titre: '',
        description: '',
        priorite: 'medium',
      });
      setIsTaskModalOpen(false);
      
      // Recharger les tâches
      fetchTasks();
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la tâche:', err);
      alert('Une erreur est survenue lors de l\'ajout de la tâche.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fonction pour afficher les détails d'une tâche
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  // Recharger les données du client
  const refreshClientData = () => {
    // Vous pouvez ajouter ici une logique pour actualiser la liste des clients si nécessaire
    console.log('Client ajouté avec succès');
  };

  if (loading || !authChecked) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    console.error("Erreur lors de la vérification de l\'authentification:", error);
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
              <Link to="/" className="text-2xl font-bold text-blue-600">Courtizy</Link>
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
            <Link to="/courtier/profil" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Profil</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-[140px] pr-[20px]">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow p-6 my-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Bonjour, {userData.firstName} {userData.lastName} 👋</h1>
                <p className="text-gray-600 mt-1">Nous sommes le {formattedDate}</p>
              </div>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{todayAppointments.length} rendez-vous aujourd'hui</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button 
              onClick={() => setIsAddClientModalOpen(true)}
              className="bg-white rounded-lg shadow p-4 flex items-center hover:bg-blue-50 transition duration-300"
            >
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium">Ajouter un client</span>
            </button>
            <Link to="/courtier/nouveau-rendez-vous" className="bg-white rounded-lg shadow p-4 flex items-center hover:bg-blue-50 transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium">Planifier un rendez-vous</span>
            </Link>
            {(hasCabinet || isAdmin) && (
              <Link to="/courtier/cabinet" className="bg-white rounded-lg shadow p-4 flex items-center hover:bg-blue-50 transition duration-300">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">Gérer mon cabinet</span>
              </Link>
            )}
            <Link to="/courtier/taches" className="bg-white rounded-lg shadow p-4 flex items-center hover:bg-blue-50 transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium">Mes tâches</span>
            </Link>
          </div>

          {/* Two Columns Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Rendez-vous du jour</h2>
                {loadingAppointments ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto text-gray-400 animate-pulse mb-3" />
                    <p>Chargement des rendez-vous...</p>
                  </div>
                ) : todayAppointments.length > 0 ? (
                  <div className="space-y-4 max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
                    {todayAppointments.map(appointment => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{appointment.client}</h3>
                            <p className="text-gray-600">{appointment.type}</p>
                            <div className="flex items-center mt-2 text-gray-500">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{appointment.time}</span>
                              <span className={`ml-4 px-2 py-1 rounded-full text-xs ${
                                appointment.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                              </span>
                            </div>
                          </div>
                          <div className="space-x-2">
                            <button className="text-blue-600 hover:text-blue-700">
                              Détails
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p>Aucun rendez-vous prévu pour aujourd'hui</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Tâches en attente</h2>
                  <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {pendingTasks.length > 0 ? (
                  <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
                    {pendingTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-start p-3 border-l-4 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        style={{ 
                          borderLeftColor: 
                            task.priority === 'high' ? '#EF4444' : 
                            task.priority === 'medium' ? '#F59E0B' : '#10B981' 
                        }}
                        onClick={() => handleTaskClick(task)}
                      >
                        <input 
                          type="checkbox" 
                          className="mt-1 mr-3" 
                          onClick={(e) => e.stopPropagation()} 
                        />
                        <div>
                          <p className="text-gray-800">{task.title}</p>
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            Priorité: {
                              task.priority === 'high' ? 'Haute' : 
                              task.priority === 'medium' ? 'Moyenne' : 'Basse'
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p>Aucune tâche en attente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter une tâche */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Ajouter une nouvelle tâche</h3>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  required
                  value={taskFormData.titre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Titre de la tâche"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={taskFormData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description de la tâche"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  id="priorite"
                  name="priorite"
                  value={taskFormData.priorite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="date_echeance" className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'échéance (optionnelle)
                </label>
                <input
                  type="date"
                  id="date_echeance"
                  name="date_echeance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour afficher les détails d'une tâche */}
      {isTaskDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Détails de la tâche</h3>
              <button 
                onClick={() => setIsTaskDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Titre</h4>
                <p className="text-gray-900 font-medium">{selectedTask.title}</p>
              </div>
              
              {selectedTask.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.description}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Priorité</h4>
                <div className="flex items-center mt-1">
                  <span 
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      selectedTask.priority === 'high' ? 'bg-red-500' : 
                      selectedTask.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  ></span>
                  <span className="text-gray-700">
                    {selectedTask.priority === 'high' ? 'Haute' : 
                     selectedTask.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  onClick={() => setIsTaskDetailModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour ajouter un client */}
      <AddClientModal 
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        brokerId={user?.uid || ''}
        brokerName={`${userData.firstName || ''} ${userData.lastName || ''}`}
        onSuccess={refreshClientData}
      />
    </div>
  );
}