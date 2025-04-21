import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Calendar, Settings, LogOut, User, Clock, Building, X, CheckCircle, AlertCircle, Mail, Phone, FileText, Plus, Trash2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { getBrokerAppointments } from '../services/appointmentService';
import { getBrokerSubscription, hasFeature } from '../services/subscriptionService';
import { BrokerSubscription } from '../types/subscription';
import './calendar-custom.css';

// Configuration de moment pour commencer la semaine le lundi
moment.updateLocale('fr', {
  week: {
    dow: 1, // Lundi comme premier jour de la semaine
    doy: 4 // La semaine qui contient le 4 janvier est la première semaine de l'année
  }
});

// Forcer la locale française
moment.locale('fr');
const localizer = momentLocalizer(moment);

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

export default function BrokerCalendar() {
  const [user, loadingAuth, error] = useAuthState(auth);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string; }>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [hasCabinet, setHasCabinet] = useState(false);
  const [subscription, setSubscription] = useState<BrokerSubscription | null>(null);

  useEffect(() => {
    if (!loadingAuth && user) {
      const checkAuthorization = async () => {
        try {
          // Vérifier si l'utilisateur est un courtier
          const userDocRef = doc(db, 'courtiers', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().type === 'courtier') {
            setIsAuthorized(true);
            setUserData({
              firstName: userDoc.data().firstName || '',
              lastName: userDoc.data().lastName || ''
            });
            setHasCabinet(!!userDoc.data().cabinetId);
            
            // Récupérer les rendez-vous du courtier
            const today = new Date();
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);

            const appointments = await getBrokerAppointments(user.uid, today, nextMonth);
            
            // Convertir les rendez-vous en événements pour le calendrier
            const calendarEvents = appointments.map(appointment => ({
              id: appointment.id || '',
              title: appointment.title,
              start: new Date(`${appointment.date}T${appointment.startTime}`),
              end: new Date(`${appointment.date}T${appointment.endTime}`),
              status: appointment.status,
              clientName: appointment.clientName,
              clientEmail: appointment.clientEmail,
              clientPhone: appointment.clientPhone,
              notes: appointment.notes
            }));

            setEvents(calendarEvents);
          }
        } catch (err) {
          console.error("Erreur lors de la vérification de l'autorisation:", err);
        } finally {
          setAuthChecked(true);
          setLoading(false);
        }
      };
      
      checkAuthorization();
    }
  }, [user, loadingAuth]);

  useEffect(() => {
    const loadSubscription = async () => {
      if (user) {
        const brokerSubscription = await getBrokerSubscription(user.uid);
        setSubscription(brokerSubscription);
      }
    };

    loadSubscription();
  }, [user]);

  // Personnalisation de l'affichage des événements
  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#3174ad';
    let textColor = 'white';
    let border = 'none';
    
    switch (event.status) {
      case 'confirmed':
        backgroundColor = '#dcfce7';
        textColor = '#166534';
        border = '1px solid #16a34a';
        break;
      case 'pending':
        backgroundColor = '#fef9c3';
        textColor = '#854d0e';
        border = '1px solid #ca8a04';
        break;
      case 'cancelled':
        backgroundColor = '#fee2e2';
        textColor = '#991b1b';
        border = '1px solid #dc2626';
        break;
    }
    
    return {
      style: {
        backgroundColor,
        color: textColor,
        border,
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '0.875rem',
        fontWeight: '500',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2px'
      }
    };
  };

  // Composant personnalisé pour l'affichage des événements
  const EventComponent = ({ event }: { event: any }) => (
    <div className="flex items-center h-full">
      <div className="font-medium">{event.clientName}</div>
    </div>
  );

  // Composant personnalisé pour la gouttière de temps
  const TimeGutterHeader = ({ time }: any) => (
    <div className="flex items-center justify-center h-full">
      {moment(time).format('HH:mm')}
    </div>
  );

  // Composant pour wrapper les slots de temps
  const TimeSlotWrapper = ({ children }: any) => (
    <div className="flex items-center h-full">
      {children}
    </div>
  );

  // Gestionnaire de clic sur un événement
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
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

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="w-full pt-4 flex">
        {/* Sidebar */}
        <div className="w-24 fixed left-0 top-1/2 transform -translate-y-1/2 h-[600px] py-6 ml-[20px] bg-[#244257]/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center shadow-xl transition-all duration-300 hover:shadow-2xl animate-fadeIn">
          <div className="flex flex-col items-center space-y-6 animate-slideIn">
            <Link to="/courtier/calendrier" className="flex flex-col items-center text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-100 transition-opacity -z-10"></div>
              <Calendar className="h-6 w-6 scale-110 transition-transform" />
              <span className="text-xs mt-2 font-medium">Agenda</span>
            </Link>
            <Link to="/courtier/clients" className="flex flex-col items-center text-white/70 hover:text-white group transition-all duration-300 relative w-24">
              <div className="absolute inset-0 bg-white/10 rounded-xl w-full h-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
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
              <Calendar className="h-6 w-6 group-hover:scale-110 transition-transform" />
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
        <div className="flex-1 ml-[140px] mt-[50px] mr-[20px]">
          <div className="bg-white rounded-lg shadow p-4 my-6">
            <h2 className="text-xl font-semibold mb-3">Calendrier des rendez-vous</h2>
            
            <div className="h-[calc(100vh-200px)]">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="week"
                tooltipAccessor={null}
                eventPropGetter={eventStyleGetter}
                components={{
                  event: EventComponent,
                  timeGutterHeader: TimeGutterHeader,
                  timeSlotWrapper: TimeSlotWrapper
                }}
                onSelectEvent={handleEventClick}
                formats={{
                  timeGutterFormat: (date: Date) => moment(date).format('HH:mm'),
                  dayFormat: (date: Date) => moment(date).format('D'),
                  weekdayFormat: (date: Date) => moment(date).format('ddd'),
                  dayHeaderFormat: (date: Date) => `${moment(date).format('D')} ${moment(date).format('ddd')}`,
                  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => 
                    `${moment(start).format('DD/MM')} — ${moment(end).format('DD/MM')}`,
                  monthHeaderFormat: (date: Date) => moment(date).format('MMMM YYYY'),
                  agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) => 
                    `${moment(start).format('DD MMMM')} — ${moment(end).format('DD MMMM YYYY')}`,
                  agendaDateFormat: (date: Date) => moment(date).format('ddd DD MMMM'),
                  agendaTimeFormat: (date: Date) => moment(date).format('HH:mm'),
                  agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
                    `${moment(start).format('HH:mm')} — ${moment(end).format('HH:mm')}`,
                  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
                    `${moment(start).format('HH:mm')} — ${moment(end).format('HH:mm')}`,
                  eventTimeRangeStartFormat: ({ start }: { start: Date }) => 
                    moment(start).format('HH:mm'),
                  eventTimeRangeEndFormat: ({ end }: { end: Date }) => 
                    moment(end).format('HH:mm'),
                }}
                messages={{
                  today: "Aujourd'hui",
                  previous: "Précédent",
                  next: "Suivant",
                  month: "Mois",
                  week: "Semaine",
                  day: "Jour",
                  agenda: "Agenda",
                  date: "Date",
                  time: "Heure",
                  event: "Événement",
                  noEventsInRange: "Aucun rendez-vous sur cette période",
                  allDay: "Journée",
                  work_week: "Semaine de travail",
                  yesterday: "Hier",
                  tomorrow: "Demain",
                  showMore: total => `+ ${total} événement(s)`,
                }}
                culture="fr"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour les détails du rendez-vous */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {selectedEvent.status === 'confirmed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : selectedEvent.status === 'pending' ? (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    selectedEvent.status === 'confirmed' ? 'text-green-600' :
                    selectedEvent.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedEvent.status === 'confirmed' ? 'Confirmé' :
                     selectedEvent.status === 'pending' ? 'En attente' :
                     'Annulé'}
                  </span>
                </div>

                {/* Client Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Informations client</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">{selectedEvent.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${selectedEvent.clientEmail}`} className="hover:text-blue-600 transition-colors">
                      {selectedEvent.clientEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${selectedEvent.clientPhone}`} className="hover:text-blue-600 transition-colors">
                      {selectedEvent.clientPhone}
                    </a>
                  </div>
                </div>

                {/* Date et Heure */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Date et heure</h4>
                  <div className="space-y-2 text-gray-600">
                    <div>
                      <span className="font-medium">Date : </span>
                      {moment(selectedEvent.start).format('dddd D MMMM YYYY')}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedEvent.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {subscription && !hasFeature(subscription, 'appointmentBooking') && (
        <>
          <div className="fixed z-25" style={{ 
            top: '95px',
            left: '140px', 
            right: '20px', 
            bottom: '20px',
            height: 'calc(100vh - 134px)'
          }}>
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[0.5px]"></div>
          </div>
          <div className="fixed z-40 flex items-center justify-center" style={{ 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)' 
          }}>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3">
                <Lock className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Fonctionnalité verrouillée</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Pour activer la prise de rendez-vous, passez à un abonnement Starter ou Pro
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Link 
                  to="/abonnement"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir les plans
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
