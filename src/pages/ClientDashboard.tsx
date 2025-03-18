import React from 'react';
import { Calendar, Clock, FileText, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  // Mock data for demonstration
  const upcomingAppointments = [
    {
      id: 1,
      broker: "Sophie Martin",
      type: "Assurance Vie",
      date: "2024-03-25",
      time: "14:30",
    },
    {
      id: 2,
      broker: "Thomas Bernard",
      type: "Crédit Immobilier",
      date: "2024-03-28",
      time: "10:00",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <Link to="/" className="text-2xl font-bold text-blue-600">MonCourtier</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">John Doe</span>
              <button className="text-gray-600 hover:text-gray-800">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col space-y-4">
                <button className="flex items-center space-x-2 text-blue-600 font-medium">
                  <Calendar className="h-5 w-5" />
                  <span>Rendez-vous</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <FileText className="h-5 w-5" />
                  <span>Documents</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <User className="h-5 w-5" />
                  <span>Profil</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Prochains rendez-vous</h2>
                <div className="space-y-4">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment.broker}</h3>
                          <p className="text-gray-600">{appointment.type}</p>
                          <div className="flex items-center mt-2 text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{appointment.date}</span>
                            <Clock className="h-4 w-4 ml-4 mr-2" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          Modifier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}