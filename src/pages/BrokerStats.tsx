import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Calendar, Clock, FileText, Settings, LogOut, Users, BarChart as ChartBar, User, Mail, Phone, Plus, ArrowUp, ArrowDown, Info, Filter, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Interface pour les statistiques
interface Stats {
  clientsTotal: number;
  appointmentsTotal: number;
  appointmentsCompleted: number;
  appointmentsCanceled: number;
  conversionRate: number;
  monthlyAppointments: { name: string; count: number }[];
  clientCategories: { name: string; value: number }[];
  appointmentTypes: { name: string; value: number }[];
  weeklyActivity: { day: string; appointments: number; tasks: number }[];
  weeklyComparison: { name: string; thisWeek: number; lastWeek: number }[];
}

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function BrokerStats() {
  const [user, loading, error] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string; }>({});
  const [stats, setStats] = useState<Stats>({
    clientsTotal: 0,
    appointmentsTotal: 0,
    appointmentsCompleted: 0,
    appointmentsCanceled: 0,
    conversionRate: 0,
    monthlyAppointments: [],
    clientCategories: [],
    appointmentTypes: [],
    weeklyActivity: [],
    weeklyComparison: []
  });
  const [periodFilter, setPeriodFilter] = useState<'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [hasCabinet, setHasCabinet] = useState(false);

  // Vérifier l'autorisation de l'utilisateur
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
              lastName: userDoc.data().lastName || ''
            });
            setHasCabinet(!!userDoc.data().cabinetId);
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

  // Récupérer les statistiques du courtier
  useEffect(() => {
    if (!user || !isAuthorized) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Récupérer les clients du courtier
        const clientsRef = collection(db, 'users');
        const clientsQuery = query(
          clientsRef,
          where('brokerId', '==', user.uid)
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsTotal = clientsSnapshot.size;

        // Préparer les données pour les catégories de clients (données simulées)
        const clientCategories = [
          { name: 'Particuliers', value: Math.floor(clientsTotal * 0.65) },
          { name: 'Professionnels', value: Math.floor(clientsTotal * 0.25) },
          { name: 'Entreprises', value: Math.floor(clientsTotal * 0.1) }
        ];

        // Récupérer les rendez-vous du courtier des 12 derniers mois
        const today = new Date();
        const twelveMonthsAgo = subMonths(today, 12);
        
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(
          appointmentsRef,
          where('brokerId', '==', user.uid),
          where('date', '>=', format(twelveMonthsAgo, 'yyyy-MM-dd')),
          orderBy('date', 'asc')
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointments = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Compter les rendez-vous terminés et annulés
        const appointmentsTotal = appointments.length;
        const appointmentsCompleted = appointments.filter(a => (a as any).status === 'completed').length;
        const appointmentsCanceled = appointments.filter(a => (a as any).status === 'canceled').length;
        
        // Calculer le taux de conversion (simulé)
        const conversionRate = appointmentsTotal > 0
          ? Math.round((appointmentsCompleted / appointmentsTotal) * 100) 
          : 0;

        // Créer des données mensuelles pour les 12 derniers mois
        const months = eachMonthOfInterval({
          start: twelveMonthsAgo,
          end: today
        });
        
        const monthlyData = months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const monthName = format(month, 'MMM', { locale: fr });
          const count = appointments.filter(a => {
            const appointmentDate = parse((a as any).date, 'yyyy-MM-dd', new Date());
            return appointmentDate >= monthStart && appointmentDate <= monthEnd;
          }).length;
          
          return { name: monthName, count };
        });

        // Types de rendez-vous (simulés)
        const appointmentTypes = [
          { name: 'Premier contact', value: Math.floor(appointmentsTotal * 0.4) },
          { name: 'Suivi', value: Math.floor(appointmentsTotal * 0.3) },
          { name: 'Signature', value: Math.floor(appointmentsTotal * 0.2) },
          { name: 'Autre', value: Math.floor(appointmentsTotal * 0.1) }
        ];

        // Activité hebdomadaire (simulée)
        const weeklyActivity = [
          { day: 'Lun', appointments: 4, tasks: 7 },
          { day: 'Mar', appointments: 6, tasks: 5 },
          { day: 'Mer', appointments: 5, tasks: 8 },
          { day: 'Jeu', appointments: 7, tasks: 6 },
          { day: 'Ven', appointments: 8, tasks: 4 },
          { day: 'Sam', appointments: 3, tasks: 2 },
          { day: 'Dim', appointments: 0, tasks: 0 }
        ];

        // Comparaison cette semaine vs semaine dernière (simulée)
        const weeklyComparison = [
          { name: 'Rendez-vous', thisWeek: 15, lastWeek: 12 },
          { name: 'Nouveaux clients', thisWeek: 8, lastWeek: 6 },
          { name: 'Tâches', thisWeek: 24, lastWeek: 20 }
        ];

        // Mettre à jour les stats
        setStats({
          clientsTotal,
          appointmentsTotal,
          appointmentsCompleted,
          appointmentsCanceled,
          conversionRate,
          monthlyAppointments: monthlyData,
          clientCategories,
          appointmentTypes,
          weeklyActivity,
          weeklyComparison
        });
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, isAuthorized, periodFilter]);

  // Fonction pour formatter les données du tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium text-gray-700">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Composant pour afficher un état de chargement
  const LoadingState = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

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
            <Link to="/courtier/stats" className="flex flex-col items-center text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-100 transition-opacity -z-10"></div>
              <ChartBar className="h-6 w-6 scale-110 transition-transform" />
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

        {/* Main content */}
        <div className="w-full ml-24">
          {/* Main Content */}
          <div className="flex-1 ml-[140px] pr-[20px]">
            {/* Header with Title and Period Filter */}
            <div className="bg-white rounded-lg shadow p-6 my-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Statistiques & Analyses</h1>
                  <p className="text-gray-600 mt-1">Analysez vos performances et suivez vos indicateurs-clés</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPeriodFilter('month')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      periodFilter === 'month' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Mois
                  </button>
                  <button 
                    onClick={() => setPeriodFilter('quarter')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      periodFilter === 'quarter' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Trimestre
                  </button>
                  <button 
                    onClick={() => setPeriodFilter('year')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      periodFilter === 'year' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Année
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Total Clients Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Clients</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.clientsTotal}</h3>
                  </div>
                  <div className="bg-blue-100 h-12 w-12 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>+12%</span>
                  </div>
                  <span className="text-gray-500 ml-2">vs période précédente</span>
                </div>
              </div>

              {/* Total Appointments Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Rendez-vous</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.appointmentsTotal}</h3>
                  </div>
                  <div className="bg-purple-100 h-12 w-12 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>+8%</span>
                  </div>
                  <span className="text-gray-500 ml-2">vs période précédente</span>
                </div>
              </div>

              {/* Conversion Rate Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Taux de conversion</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.conversionRate}%</h3>
                  </div>
                  <div className="bg-green-100 h-12 w-12 rounded-lg flex items-center justify-center">
                    <ChartBar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="text-red-600 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span>-2%</span>
                  </div>
                  <span className="text-gray-500 ml-2">vs période précédente</span>
                </div>
              </div>

              {/* Canceled Appointments Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">RDV annulés</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.appointmentsCanceled}</h3>
                  </div>
                  <div className="bg-red-100 h-12 w-12 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="text-red-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>+3%</span>
                  </div>
                  <span className="text-gray-500 ml-2">vs période précédente</span>
                </div>
              </div>
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Monthly Evolution Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Évolution mensuelle</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={stats.monthlyAppointments}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        name="Rendez-vous" 
                        stroke="#0088FE" 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Weekly Activity Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Activité hebdomadaire</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={stats.weeklyActivity}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Bar 
                        dataKey="appointments" 
                        name="Rendez-vous" 
                        fill="#0088FE" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="tasks" 
                        name="Tâches" 
                        fill="#00C49F" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pie Charts and Comparison Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Client Categories Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-6">Catégories de clients</h3>
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.clientCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.clientCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Appointment Types Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-6">Types de rendez-vous</h3>
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.appointmentTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.appointmentTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Weekly Comparison */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <h3 className="text-lg font-semibold">Comparaison hebdomadaire</h3>
                  <div className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                    <Info className="h-4 w-4" />
                  </div>
                </div>
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <div className="space-y-4 mt-4">
                    {stats.weeklyComparison.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">{item.name}</span>
                          <span className="font-semibold">{item.thisWeek}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-2 bg-gray-200 flex-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.thisWeek > item.lastWeek ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${(item.thisWeek / Math.max(item.thisWeek, item.lastWeek)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2 min-w-16 text-right">
                            {item.thisWeek > item.lastWeek ? (
                              <span className="text-green-600 text-sm flex items-center">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                {Math.round(((item.thisWeek - item.lastWeek) / item.lastWeek) * 100)}%
                              </span>
                            ) : (
                              <span className="text-red-600 text-sm flex items-center">
                                <ArrowDown className="h-3 w-3 mr-1" />
                                {Math.round(((item.lastWeek - item.thisWeek) / item.lastWeek) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Semaine précédente: {item.lastWeek}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information or Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Astuce du jour</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Analysez vos statistiques pour identifier les tendances et opportunités d'amélioration.
                      N'hésitez pas à consulter les données historiques pour une vision plus complète de votre activité.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 