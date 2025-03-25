import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, Settings, LogOut, Users, BarChart, Building, Plus, Trash2, User, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  TimeSlot, 
  DayAvailability, 
  WeeklyAvailability, 
  defaultWeeklyAvailability, 
  getBrokerAvailability, 
  updateBrokerAvailability,
  getCabinetBrokersAvailability,
  updateBrokerAvailabilityByAdmin
} from '../services/availabilityService';
import { getCabinetByBrokerId } from '../services/cabinetService';

const defaultTimeSlot: TimeSlot = { start: "08:00", end: "17:00" };

// Traduction des jours de la semaine
const dayTranslations = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche"
};

// Ordre des jours de la semaine pour l'affichage
const orderedDays: (keyof WeeklyAvailability)[] = [
  "monday", 
  "tuesday", 
  "wednesday", 
  "thursday", 
  "friday", 
  "saturday", 
  "sunday"
];

export default function BrokerAvailability() {
  const [user, loadingAuth, error] = useAuthState(auth);
  const [availability, setAvailability] = useState<WeeklyAvailability>(defaultWeeklyAvailability);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string; role?: string; cabinetId?: string; }>({});
  
  // États pour la gestion des équipes
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [hasCabinet, setHasCabinet] = useState(false);
  const [cabinet, setCabinet] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<{ 
    brokerId: string; 
    firstName: string; 
    lastName: string; 
    role: string;
    availability: WeeklyAvailability;
  }[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showTeamAvailabilities, setShowTeamAvailabilities] = useState(false);

  useEffect(() => {
    if (!loadingAuth && user) {
      const checkAuthorization = async () => {
        try {
          const userDocRef = doc(db, 'courtiers', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().type === 'courtier') {
            setIsAuthorized(true);
            const userDataFromDB = userDoc.data();
            setUserData({
              firstName: userDataFromDB.firstName || '',
              lastName: userDataFromDB.lastName || '',
              role: userDataFromDB.role || '',
              cabinetId: userDataFromDB.cabinetId
            });
            
            setIsAdmin(userDataFromDB.role === 'admin');
            setIsManager(userDataFromDB.role === 'admin' || userDataFromDB.role === 'manager');
            setHasCabinet(!!userDataFromDB.cabinetId);
            
            // Récupérer les disponibilités de l'utilisateur
            const userAvailability = await getBrokerAvailability(user.uid);
            setAvailability(userAvailability);
            
            // Si l'utilisateur est admin ou manager et a un cabinet, récupérer le cabinet et l'équipe
            if ((userDataFromDB.role === 'admin' || userDataFromDB.role === 'manager') && userDataFromDB.cabinetId) {
              const cabinetData = await getCabinetByBrokerId(user.uid);
              setCabinet(cabinetData);
              
              // Récupérer les membres de l'équipe et leurs disponibilités
              const teamData = await getCabinetBrokersAvailability(user.uid);
              setTeamMembers(teamData);
            }
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de l\'autorisation:', err);
        } finally {
          setAuthChecked(true);
          setLoading(false);
        }
      };
      checkAuthorization();
    }
  }, [user, loadingAuth]);
  
  // Gestion des disponibilités de l'utilisateur courant
  const handleDayToggle = (day: keyof WeeklyAvailability) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  const handleAddTimeSlot = (day: keyof WeeklyAvailability) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, { ...defaultTimeSlot }]
      }
    }));
  };

  const handleRemoveTimeSlot = (day: keyof WeeklyAvailability, index: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index)
      }
    }));
  };

  const handleTimeChange = (
    day: keyof WeeklyAvailability,
    index: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const saveAvailability = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      // Si on modifie les disponibilités d'un membre de l'équipe
      if (selectedMember && selectedMember !== user.uid) {
        await updateBrokerAvailabilityByAdmin(user.uid, selectedMember, availability);
        
        // Mettre à jour la liste des membres
        setTeamMembers(prev => 
          prev.map(member => 
            member.brokerId === selectedMember 
              ? { ...member, availability } 
              : member
          )
        );
      } else {
        // Sinon, on modifie ses propres disponibilités
        await updateBrokerAvailability(user.uid, availability);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des disponibilités:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Sélectionner un membre de l'équipe pour voir/modifier ses disponibilités
  const handleSelectMember = (memberId: string) => {
    const member = teamMembers.find(m => m.brokerId === memberId);
    if (member) {
      setSelectedMember(memberId);
      setAvailability(member.availability);
    }
  };
  
  // Revenir à ses propres disponibilités
  const handleBackToOwnAvailability = () => {
    if (user) {
      const userAvailability = teamMembers.find(m => m.brokerId === user.uid);
      if (userAvailability) {
        setAvailability(userAvailability.availability);
      }
      setSelectedMember(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirection vers la page d'accueil sera gérée par les hooks d'authentification
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
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
              <Link to="/" className="text-2xl font-bold text-blue-600">MonCourtier</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{userData.firstName} {userData.lastName}</span>
              <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
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
            <Link to="/courtier/disponibilites" className="flex flex-col items-center text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-100 transition-opacity -z-10"></div>
              <Clock className="h-6 w-6 scale-110 transition-transform" />
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

        {/* Main Content */}
        <div className="flex-1 ml-[140px] mr-[20px]">
          <div className="bg-white rounded-lg shadow p-4 my-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">
                {selectedMember && selectedMember !== user?.uid 
                  ? `Modifier les disponibilités de ${teamMembers.find(m => m.brokerId === selectedMember)?.firstName} ${teamMembers.find(m => m.brokerId === selectedMember)?.lastName}`
                  : "Gérer mes disponibilités"}
              </h2>
              {selectedMember && selectedMember !== user?.uid && (
                <button 
                  onClick={handleBackToOwnAvailability}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Revenir à mes disponibilités
                </button>
              )}
            </div>
            
            {/* Section des disponibilités de l'équipe (admins et managers seulement) */}
            {isManager && hasCabinet && (
              <div className="mb-6 border-b pb-4">
                <button 
                  onClick={() => setShowTeamAvailabilities(!showTeamAvailabilities)}
                  className="flex items-center justify-between w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <span className="font-medium">Disponibilités de l'équipe</span>
                  {showTeamAvailabilities ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                
                {showTeamAvailabilities && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {teamMembers.map(member => (
                      <div 
                        key={member.brokerId} 
                        className={`p-3 rounded-md cursor-pointer transition-all ${
                          selectedMember === member.brokerId 
                            ? 'bg-blue-100 border-2 border-blue-300' 
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => handleSelectMember(member.brokerId)}
                      >
                        <div className="font-medium">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-gray-600">
                          {member.role === 'admin' 
                            ? 'Administrateur' 
                            : member.role === 'manager' 
                            ? 'Gestionnaire' 
                            : member.role === 'associate' 
                            ? 'Associé' 
                            : 'Employé'}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(member.availability)
                            .filter(([_, dayData]) => dayData.enabled)
                            .map(([day]) => dayTranslations[day as keyof typeof dayTranslations])
                            .join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <p className="text-gray-600 mb-4">
              Définissez vos horaires de disponibilité pour chaque jour de la semaine. 
              Ces créneaux seront proposés à vos clients lors de la prise de rendez-vous.
            </p>
            
            <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {orderedDays.map((day) => {
                const dayData = availability[day];
                return (
                <div key={day} className="border-b border-gray-200 py-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={dayData.enabled}
                        onChange={() => handleDayToggle(day)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 font-medium w-24">{dayTranslations[day as keyof typeof dayTranslations]}</span>
                    </label>
                  </div>
                  
                  {dayData.enabled && (
                    <div className="ml-7">
                      {dayData.timeSlots.map((slot: TimeSlot, index: number) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleTimeChange(day, index, 'start', e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span>à</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleTimeChange(day, index, 'end', e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <button
                            onClick={() => handleRemoveTimeSlot(day, index)}
                            className="text-red-500 hover:text-red-700"
                            disabled={dayData.timeSlots.length === 1}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => handleAddTimeSlot(day)}
                        className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        <span>Ajouter un créneau</span>
                      </button>
                    </div>
                  )}
                </div>
              )})}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={saveAvailability}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les disponibilités'}
              </button>
            </div>
            
            {saveSuccess && (
              <div className="mt-4 p-2 bg-green-100 text-green-800 rounded-md">
                {selectedMember && selectedMember !== user?.uid 
                  ? `Les disponibilités de ${teamMembers.find(m => m.brokerId === selectedMember)?.firstName} ${teamMembers.find(m => m.brokerId === selectedMember)?.lastName} ont été enregistrées avec succès.`
                  : "Vos disponibilités ont été enregistrées avec succès."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
