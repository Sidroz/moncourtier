import React, { useState } from 'react';
import { Calendar, User, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Ajout de Firebase
import { auth } from '../firebase'; // Assure-toi que firebase.ts est configuré

type UserType = 'client' | 'broker';

export default function Login() {
  const [userType, setUserType] = useState<UserType>('client');
  const [email, setEmail] = useState(''); // Ajout pour stocker l’email
  const [password, setPassword] = useState(''); // Ajout pour stocker le mot de passe
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'client') {
      // Connexion Client via Firebase
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/client/dashboard'); // Redirection après connexion réussie
      } catch (err) {
        console.error('Erreur lors de la connexion client :', err);
        alert('Erreur de connexion : ' + (err as Error).message); // Message d’erreur simple
      }
    } else {
      // Logique originale pour Broker (inchangée)
      console.log('Connexion Broker:', { email, password });
      navigate('/broker/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Calendar className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à MonCourtier
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* User Type Selection */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                userType === 'client'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setUserType('client')}
            >
              <User className="h-5 w-5" />
              <span>Client</span>
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                userType === 'broker'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setUserType('broker')}
            >
              <Building2 className="h-5 w-5" />
              <span>Courtier</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email} // Ajout pour lier l’état
                  onChange={(e) => setEmail(e.target.value)} // Ajout pour mettre à jour l’état
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password} // Ajout pour lier l’état
                  onChange={(e) => setPassword(e.target.value)} // Ajout pour mettre à jour l’état
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Se connecter
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Pas encore inscrit ?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}