import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, ArrowRight, Users, BarChart, Calendar as CalendarIcon, Clock, UserPlus, Settings, Shield, Building2, Star, Phone } from 'lucide-react';

const ForBrokers = () => {
  // Vérifier si nous sommes sur le sous-domaine pro
  const [isPro, setIsPro] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const hostname = window.location.hostname;
    setIsPro(hostname === 'pro.localhost' || hostname === 'pro.courtizy.fr');

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans">
      {/* Header fixe avec effet de scroll */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`rounded-xl p-2 transition-all duration-300 ${isScrolled ? 'bg-blue-50' : 'bg-white/10 backdrop-blur-sm'}`}>
                <Calendar className={`h-8 w-8 transition-colors duration-300 ${isScrolled ? 'text-blue-950' : 'text-white'}`} />
              </div>
              <span className={`text-2xl font-extrabold tracking-tight transition-colors duration-300 ${isScrolled ? 'text-blue-950' : 'text-white'}`}>
                Courtizy Pro
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#benefits" className={`font-medium transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-blue-950' : 'text-white/90 hover:text-white'}`}>
                  Fonctionnalités
                </a>
                <Link to="/pricing" className={`font-medium transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-blue-950' : 'text-white/90 hover:text-white'}`}>
                  Offres
                </Link>
                <a href="#contact-form" className={`font-medium transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-blue-950' : 'text-white/90 hover:text-white'}`}>
                  Contact
                </a>
              </nav>
              
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login"
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'bg-blue-950 text-white hover:bg-blue-900' 
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                  }`}
                >
                  Connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 relative overflow-hidden pt-32 pb-24">
          {/* Motif de fond animé */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-[drift_30s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Badge Pro */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">La référence des courtiers professionnels</span>
              </div>
            </div>

            <div className="lg:flex items-center gap-12">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  <span className="block mb-2">Développez votre</span>
                  <span className="bg-gradient-to-r from-blue-200 to-blue-400 text-transparent bg-clip-text">activité de courtage</span>
                </h1>
                
                <p className="text-xl text-blue-100/90 mb-8 leading-relaxed">
                  Rejoignez la plateforme qui connecte les courtiers professionnels avec des clients qualifiés. Optimisez votre temps et augmentez vos résultats grâce à nos outils innovants.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button className="px-8 py-4 bg-white text-blue-950 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center group">
                    Demander une démo
                    <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-8 py-4 bg-blue-800/30 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/10 hover:bg-blue-800/40 transition-all duration-300 flex items-center justify-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Nous contacter
                  </button>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-bold text-white mb-1">5000+</div>
                    <p className="text-blue-200/80 text-sm">Courtiers actifs</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-bold text-white mb-1">92%</div>
                    <p className="text-blue-200/80 text-sm">Taux de satisfaction</p>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 relative">
                {/* Effet de brillance */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-30 blur-2xl animate-pulse"></div>
                
                {/* Image principale */}
                <div className="relative bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-2 shadow-2xl">
                  <img 
                    src="/dashboard-preview.jpg" 
                    alt="Dashboard Courtizy Pro" 
                    className="rounded-xl shadow-lg w-full"
                  />
                  
                  {/* Badge flottant */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full shadow-lg text-sm font-medium">
                    Nouveau dashboard 2024
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-950 px-4 py-2 rounded-full border border-white/20 mb-6">
                <Shield className="h-5 w-5 text-blue-300" />
                <span className="text-white text-sm font-medium">Solutions professionnelles</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Des outils conçus pour votre réussite
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Optimisez votre temps et maximisez vos résultats grâce à notre suite d'outils spécialement développée pour les courtiers professionnels
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Clients qualifiés</h3>
                <p className="text-gray-600 mb-6">
                  Accédez à une base de clients motivés et qualifiés. Notre algorithme de matching intelligent optimise vos conversions.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Matching intelligent</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Profils vérifiés</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Notifications en temps réel</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform">
                  <CalendarIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Agenda intelligent</h3>
                <p className="text-gray-600 mb-6">
                  Gérez vos rendez-vous efficacement avec notre outil de calendrier avancé, synchronisé avec vos agendas existants.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Synchronisation multi-calendriers</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Rappels automatiques</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Gestion des disponibilités</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform">
                  <BarChart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Analytics Pro</h3>
                <p className="text-gray-600 mb-6">
                  Suivez vos performances avec des tableaux de bord personnalisables et des rapports automatisés.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Tableaux de bord personnalisés</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Rapports automatisés</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                    <span>Insights business</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-950 px-4 py-2 rounded-full mb-6">
                <Clock className="h-5 w-5 text-blue-300" />
                <span className="text-white text-sm font-medium">Processus simplifié</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Comment rejoindre Courtizy Pro ?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Un parcours simple et rapide pour intégrer notre plateforme et développer votre activité
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Ligne de connexion */}
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transform -translate-y-1/2 rounded-full"></div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full transform hover:-translate-y-1">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">1</div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Premier contact</h3>
                    <p className="text-gray-600">
                      Remplissez le formulaire pour nous présenter votre activité
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full transform hover:-translate-y-1">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">2</div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Échange personnalisé</h3>
                    <p className="text-gray-600">
                      Un expert vous contacte pour comprendre vos besoins spécifiques
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full transform hover:-translate-y-1">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">3</div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Configuration</h3>
                    <p className="text-gray-600">
                      Votre espace pro est configuré selon vos besoins
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full transform hover:-translate-y-1">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-800 to-indigo-900 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">4</div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">C'est parti !</h3>
                    <p className="text-gray-600">
                      Commencez à recevoir vos premiers clients qualifiés
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-[drift_30s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">Témoignages vérifiés</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Ce que disent nos courtiers
              </h2>
              <p className="text-xl text-blue-100/90 max-w-3xl mx-auto">
                Découvrez les retours d'expérience des professionnels qui utilisent Courtizy Pro au quotidien
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Thomas D." 
                    className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors"
                  />
                  <div className="ml-4">
                    <h4 className="text-white font-bold text-lg">Thomas D.</h4>
                    <p className="text-blue-300">Courtier en Assurance</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-blue-100/80 italic relative">
                  <span className="text-5xl font-serif absolute -top-4 -left-2 text-white/10">"</span>
                  <p className="relative z-10">
                    Grâce à Courtizy Pro, j'ai pu développer significativement ma clientèle en seulement quelques mois. L'interface est intuitive et me permet de gagner un temps précieux dans la gestion de mes rendez-vous.
                  </p>
                </blockquote>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <img 
                    src="https://randomuser.me/api/portraits/women/44.jpg" 
                    alt="Sophie M." 
                    className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors"
                  />
                  <div className="ml-4">
                    <h4 className="text-white font-bold text-lg">Sophie M.</h4>
                    <p className="text-blue-300">Courtière Immobilier</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-blue-100/80 italic relative">
                  <span className="text-5xl font-serif absolute -top-4 -left-2 text-white/10">"</span>
                  <p className="relative z-10">
                    La plateforme me permet d'être connectée avec des clients véritablement intéressés par mes services. La qualité des leads est remarquable et le système de gestion d'agenda est un vrai plus !
                  </p>
                </blockquote>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <img 
                    src="https://randomuser.me/api/portraits/men/62.jpg" 
                    alt="Laurent F." 
                    className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors"
                  />
                  <div className="ml-4">
                    <h4 className="text-white font-bold text-lg">Laurent F.</h4>
                    <p className="text-blue-300">Courtier en Crédit</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-blue-100/80 italic relative">
                  <span className="text-5xl font-serif absolute -top-4 -left-2 text-white/10">"</span>
                  <p className="relative z-10">
                    Je recommande vivement Courtizy Pro à tous mes collègues. L'outil est complet, les statistiques m'aident à optimiser mon activité et le support client est toujours réactif.
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-950 px-4 py-2 rounded-full mb-6">
                <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white text-sm font-medium">Questions fréquentes</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Tout ce que vous devez savoir
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Les réponses aux questions les plus fréquentes sur Courtizy Pro
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Comment rejoindre la plateforme Courtizy Pro ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pour garantir la qualité de notre réseau, nous procédons à une sélection des courtiers. Contactez-nous via le formulaire ci-dessous, notre équipe étudiera votre profil et vous enverra un lien d'inscription personnalisé si votre candidature est retenue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Combien coûte l'inscription sur Courtizy Pro ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      L'inscription de base est gratuite. Nous proposons également des forfaits premium avec des fonctionnalités avancées pour optimiser votre visibilité et votre gestion client.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Comment sont filtrés les clients ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Notre plateforme utilise un algorithme intelligent qui met en relation les clients avec les courtiers selon leurs besoins spécifiques, leur localisation et leur disponibilité.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Puis-je gérer plusieurs types de services ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Oui, vous pouvez proposer plusieurs types de services dans votre domaine d'expertise et personnaliser votre profil en conséquence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="py-24 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-[drift_30s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
                <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-white/90 text-sm font-medium">Contactez-nous</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Prêt à développer votre activité ?
              </h2>
              <p className="text-xl text-blue-100/90 max-w-3xl mx-auto">
                Remplissez le formulaire ci-dessous et notre équipe vous contactera sous 24h pour discuter de votre projet
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-10 rounded-2xl border border-white/10">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="firstName" className="block text-white/90 font-medium mb-2">Prénom</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-white/90 font-medium mb-2">Nom</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="email" className="block text-white/90 font-medium mb-2">Email professionnel</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder="votre@email-pro.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-white/90 font-medium mb-2">Téléphone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder="Votre numéro de téléphone"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-white/90 font-medium mb-2">Entreprise</label>
                  <input 
                    type="text" 
                    id="company" 
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                <div>
                  <label htmlFor="specialty" className="block text-white/90 font-medium mb-2">Spécialité</label>
                  <select 
                    id="specialty" 
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%23ffffff%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="" className="bg-blue-900">Sélectionnez votre spécialité</option>
                    <option value="assurance" className="bg-blue-900">Courtier en Assurance</option>
                    <option value="realestate" className="bg-blue-900">Courtier Immobilier</option>
                    <option value="credit" className="bg-blue-900">Courtier en Crédit</option>
                    <option value="retirement" className="bg-blue-900">Courtier en Retraite</option>
                    <option value="tax" className="bg-blue-900">Courtier en Fiscalité</option>
                    <option value="recruitment" className="bg-blue-900">Courtier en Recrutement</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white/90 font-medium mb-2">Message</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                    placeholder="Parlez-nous de votre activité et de vos attentes"
                  ></textarea>
                </div>

                <div className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    id="rgpd" 
                    className="mt-1 h-4 w-4 border-white/20 rounded text-blue-500 focus:ring-blue-500 bg-white/10"
                  />
                  <label htmlFor="rgpd" className="text-white/70 text-sm">
                    J'accepte que mes données soient traitées conformément à la <a href="#" className="text-blue-300 hover:text-blue-200 underline">politique de confidentialité</a> de Courtizy Pro
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg flex items-center justify-center group"
                >
                  <span>Envoyer ma demande</span>
                  <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-white/70 text-sm">
                  Un expert vous recontactera sous 24h pour échanger sur votre demande
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Section CTA modernisée */}
        <div className="py-24 bg-gradient-to-br from-blue-900 to-blue-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center space-x-2 bg-blue-800/40 text-blue-200 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                <Star className="h-5 w-5" />
                <span className="text-sm font-medium">Rejoignez les meilleurs courtiers</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Prêt à transformer votre activité de courtage ?
              </h2>
              
              <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
                Rejoignez notre communauté de courtiers professionnels et accédez à des outils innovants pour développer votre business
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <a 
                  href="#contact-form"
                  className="px-8 py-4 bg-white text-blue-950 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-50 transition-all duration-300 w-full sm:w-auto flex items-center justify-center group"
                >
                  Demander une démo
                  <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="tel:0123456789"
                  className="px-8 py-4 bg-blue-800/40 text-white rounded-xl font-semibold text-lg hover:bg-blue-800/60 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto flex items-center justify-center"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Nous appeler
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer modernisé */}
      <footer className="bg-gray-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Courtizy Pro</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-md">
                La plateforme de référence qui connecte les courtiers professionnels avec des clients qualifiés. Développez votre activité avec des outils innovants.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-6">Liens rapides</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Accueil</a>
                </li>
                <li>
                  <a href="#benefits" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a>
                </li>
                <li>
                  <a href="#contact-form" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                </li>
                <li>
                  <a href="/login" className="text-gray-400 hover:text-white transition-colors">Connexion</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-400">
                  <Phone className="h-5 w-5 mr-3" />
                  <span>01 23 45 67 89</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>contact@courtizy.fr</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <Building2 className="h-5 w-5 mr-3" />
                  <span>Paris, France</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} Courtizy. Tous droits réservés.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Mentions légales</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Politique de confidentialité</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">CGU</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForBrokers; 
