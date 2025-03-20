import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { getBrokerAppointments } from '../services/appointmentService';

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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthChecked(true);
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Vérifier si l'utilisateur est un courtier
        const courtierRef = doc(db, 'courtiers', user.uid);
        const courtierSnap = await getDoc(courtierRef);

        if (!courtierSnap.exists()) {
          console.error("L'utilisateur n'est pas un courtier");
          navigate('/login');
          return;
        }

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
      } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Personnalisation de l'affichage des événements
  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#3174ad';
    
    // Couleurs différentes selon le statut
    if (event.status === 'confirmed') {
      backgroundColor = '#28a745'; // vert pour confirmé
    } else if (event.status === 'pending') {
      backgroundColor = '#ffc107'; // jaune pour en attente
    } else if (event.status === 'cancelled') {
      backgroundColor = '#dc3545'; // rouge pour annulé
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Affichage des détails d'un événement au survol
  const eventTooltipAccessor = (event: Event) => {
    return `
      Client: ${event.clientName}
      Email: ${event.clientEmail}
      Téléphone: ${event.clientPhone}
      Statut: ${event.status}
      ${event.notes ? `Notes: ${event.notes}` : ''}
    `;
  };

  // Si l'authentification est en cours de vérification, afficher un loader
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Calendrier des rendez-vous</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-150px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4 h-[calc(100vh-150px)]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="week"
            tooltipAccessor={eventTooltipAccessor}
            eventPropGetter={eventStyleGetter}
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
            }}
          />
        </div>
      )}
    </div>
  );
}
