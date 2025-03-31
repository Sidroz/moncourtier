import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, ArrowRight, Users, BarChart, Calendar as CalendarIcon, Clock, Shield, Building2, Star, Phone, ChevronRight, Award, Sparkles } from 'lucide-react';

const ForBrokers = () => {
  // Vérifier si nous sommes sur le sous-domaine pro
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans">
      {/* Header fixe avec effet de scroll amélioré */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`rounded-xl p-2 transition-all duration-300 ${isScrolled ? 'bg-blue-50' : 'bg-white/10 backdrop-blur-sm'}`}>
                <Calendar className={`h-8 w-8 transition-colors duration-300 ${isScrolled ? 'text-blue-950' : 'text-white'}`} />
              </div>
              <span className={`text-2xl font-extrabold tracking-tight transition-colors duration-300 ${isScrolled ? 'text-blue-950' : 'text-white'}`}>
                Courtizy<span className="text-blue-500">Pro</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#benefits" className={`font-medium transition-colors duration-300 hover:scale-105 ${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}>
                  Fonctionnalités
                </a>
                <Link to="/pricing" className={`font-medium transition-colors duration-300 hover:scale-105 ${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}>
                  Offres
                </Link>
                <a href="#testimonials" className={`font-medium transition-colors duration-300 hover:scale-105 ${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}>
                  Témoignages
                </a>
                <a href="#contact-form" className={`font-medium transition-colors duration-300 hover:scale-105 ${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}>
                  Contact
                </a>
              </nav>
              
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login"
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-lg hover:shadow-blue-500/20' 
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:shadow-lg hover:shadow-white/10'
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
        {/* Hero Section améliorée */}
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 relative overflow-hidden pt-36 pb-28">
          {/* Motif de fond animé amélioré */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-[drift_30s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3)_0%,transparent_60%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(79,70,229,0.3)_0%,transparent_60%)]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Badge Pro amélioré */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 animate-pulse-slow">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">La référence des courtiers professionnels</span>
              </div>
            </div>

            <div className="lg:flex items-center gap-16">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                  <span className="block mb-2">Développez votre</span>
                  <span className="bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 text-transparent bg-clip-text">activité de courtage</span>
                </h1>
                
                <p className="text-xl text-blue-100/90 mb-10 leading-relaxed">
                  Rejoignez la plateforme qui connecte les courtiers professionnels avec des clients qualifiés. Optimisez votre temps et augmentez vos résultats grâce à nos outils innovants.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 mb-14">
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-semibold text-lg shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center group">
                    Demander une démo
                    <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-8 py-4 bg-blue-800/30 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/10 hover:bg-blue-800/40 hover:border-white/30 transition-all duration-300 flex items-center justify-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Nous contacter
                  </button>
                </div>
              </div>

              <div className="lg:w-1/2 relative">
                {/* Effet de brillance amélioré */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-30 blur-2xl animate-pulse"></div>
                
                {/* Illustration inspirée du BrokerDashboard réel */}
                <div className="relative bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-6 shadow-2xl transform hover:rotate-1 transition-transform duration-500">
                  <div className="rounded-xl shadow-lg w-full h-72 flex flex-col">
                    {/* Header */}
                    <div className="bg-white p-3 rounded-t-xl flex items-center">
                      <div className="flex items-center space-x-2">
                        <div className="text-blue-600 rounded-lg p-1">
                          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                            <div className="w-3 h-3 bg-white"></div>
                          </div>
                        </div>
                        <div className="font-bold text-blue-600">Courtizy</div>
                      </div>
                      <div className="flex-1"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-3 rounded-full bg-gray-200"></div>
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                    
                    {/* Corps du dashboard avec sidebar et contenu */}
                    <div className="flex-1 flex bg-gray-50 rounded-b-xl">
                      {/* Espace à gauche */}
                      <div className="w-1"></div>
                      
                      {/* Container pour le sidebar avec espace en haut et en bas */}
                      <div className="py-1 flex flex-col justify-center">
                        {/* Sidebar avec bords arrondis */}
                        <div className="w-16 bg-[#244257] rounded-xl py-3 flex flex-col items-center space-y-4">
                          <div className="w-8 h-8 bg-white/10 rounded-lg p-1.5">
                            <div className="w-full h-full bg-white/70 rounded-sm"></div>
                          </div>
                          <div className="w-8 h-8 bg-white/10 rounded-lg p-1.5">
                            <div className="w-full h-full bg-white/70 rounded-sm"></div>
                          </div>
                          <div className="w-8 h-8 bg-white/10 rounded-lg p-1.5">
                            <div className="w-full h-full bg-white/70 rounded-sm"></div>
                          </div>
                          <div className="w-8 h-8 bg-white/10 rounded-lg p-1.5">
                            <div className="w-full h-full bg-white/70 rounded-sm"></div>
                          </div>
                          <div className="w-8 h-8 bg-white/10 rounded-lg p-1.5">
                            <div className="w-full h-full bg-white/70 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenu principal */}
                      <div className="flex-1 p-3">
                        {/* Section bienvenue */}
                        <div className="bg-white rounded-lg shadow-sm p-3 mb-3 flex justify-between items-center">
                          <div>
                            <div className="h-4 w-32 bg-gray-800 rounded-full mb-1"></div>
                            <div className="h-2 w-24 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="bg-blue-600 rounded-md h-5 w-12"></div>
                        </div>
                        
                        {/* Quick links */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white rounded-lg shadow-sm p-2 flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full mr-2 flex items-center justify-center">
                              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                            </div>
                            <div className="h-3 w-20 bg-gray-700 rounded-full"></div>
                          </div>
                          <div className="bg-white rounded-lg shadow-sm p-2 flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full mr-2 flex items-center justify-center">
                              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                            </div>
                            <div className="h-3 w-20 bg-gray-700 rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Deux colonnes */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Rendez-vous */}
                          <div className="bg-white rounded-lg shadow-sm p-2">
                            <div className="h-3 w-24 bg-gray-800 rounded-full mb-2"></div>
                            <div className="space-y-2">
                              <div className="border rounded-lg p-2">
                                <div className="h-2 w-16 bg-gray-700 rounded-full mb-1"></div>
                                <div className="h-2 w-12 bg-gray-400 rounded-full mb-1"></div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                                  <div className="h-2 w-8 bg-gray-500 rounded-full"></div>
                                  <div className="ml-2 h-2 w-10 bg-green-200 rounded-full"></div>
                                </div>
                              </div>
                              <div className="border rounded-lg p-2">
                                <div className="h-2 w-16 bg-gray-700 rounded-full mb-1"></div>
                                <div className="h-2 w-12 bg-gray-400 rounded-full mb-1"></div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                                  <div className="h-2 w-8 bg-gray-500 rounded-full"></div>
                                  <div className="ml-2 h-2 w-10 bg-yellow-200 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tâches */}
                          <div className="bg-white rounded-lg shadow-sm p-2">
                            <div className="flex justify-between items-center mb-2">
                              <div className="h-3 w-24 bg-gray-800 rounded-full"></div>
                              <div className="bg-blue-600 rounded-md h-5 w-12"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start p-2 border-l-4 border-red-500 rounded bg-gray-50">
                                <div className="w-3 h-3 border border-gray-400 rounded mr-2 mt-0.5"></div>
                                <div>
                                  <div className="h-2 w-20 bg-gray-700 rounded-full mb-1"></div>
                                  <div className="h-2 w-10 bg-gray-400 rounded-full"></div>
                                </div>
                              </div>
                              <div className="flex items-start p-2 border-l-4 border-yellow-500 rounded bg-gray-50">
                                <div className="w-3 h-3 border border-gray-400 rounded mr-2 mt-0.5"></div>
                                <div>
                                  <div className="h-2 w-20 bg-gray-700 rounded-full mb-1"></div>
                                  <div className="h-2 w-10 bg-gray-400 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Badge flottant amélioré */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2.5 rounded-full shadow-lg text-sm font-medium transform hover:scale-105 transition-transform">
                    Nouveau dashboard 2024
                  </div>

                  {/* Badges flottants supplémentaires */}
                  <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg text-xs font-medium flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Interface Courtier
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section "Rejoignez les premiers courtiers partenaires" */}
        <section className="py-16 bg-[#19295D] relative overflow-hidden -mt-1">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5 animate-[drift_30s_linear_infinite]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Rejoignez les premiers courtiers partenaires</h3>
                <p className="text-blue-200/90 max-w-2xl mx-auto">
                  Faites partie des pionniers qui façonneront l'avenir de Courtizy. En tant que premiers partenaires, vous bénéficierez d'avantages exclusifs et d'un accompagnement personnalisé.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-blue-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Award className="h-8 w-8 text-blue-300" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Programme Pionnier</h4>
                  <p className="text-blue-200/80 text-sm">
                    Tarifs préférentiels et fonctionnalités premium offertes pendant 6 mois
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-blue-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-blue-300" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Support Dédié</h4>
                  <p className="text-blue-200/80 text-sm">
                    Un conseiller personnel pour vous accompagner dans la prise en main de la plateforme
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-blue-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-blue-300" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Co-création</h4>
                  <p className="text-blue-200/80 text-sm">
                    Participez à l'évolution de la plateforme en suggérant des fonctionnalités
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-10">
                <a 
                  href="#contact-form" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:translate-y-[-2px]"
                >
                  Devenir partenaire pionnier
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section améliorée */}
        <section id="benefits" className="py-28 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.1)_0%,transparent_70%)]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-blue-950 px-4 py-2 rounded-full mb-6">
                <Shield className="h-5 w-5 text-blue-300" />
                <span className="text-white text-sm font-medium">Solutions professionnelles</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Des outils <span className="text-blue-600">conçus pour votre réussite</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Optimisez votre temps et maximisez vos résultats grâce à notre suite d'outils spécialement développée pour les courtiers professionnels
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 relative overflow-hidden">
                {/* Élément décoratif */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Clients qualifiés</h3>
                  <p className="text-gray-600 mb-6">
                    Accédez à une base de clients motivés et qualifiés. Notre algorithme de matching intelligent optimise vos conversions.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Matching intelligent</span>
                    </li>
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Profils vérifiés</span>
                    </li>
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Notifications en temps réel</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 relative overflow-hidden">
                {/* Élément décoratif */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                    <CalendarIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Agenda intelligent</h3>
                  <p className="text-gray-600 mb-6">
                    Gérez vos rendez-vous efficacement avec notre outil de calendrier avancé, synchronisé avec vos agendas existants.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Synchronisation multi-calendriers</span>
                    </li>
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Rappels automatiques</span>
                    </li>
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Gestion des disponibilités</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 relative overflow-hidden">
                {/* Élément décoratif */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                    <BarChart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Pro</h3>
                  <p className="text-gray-600 mb-6">
                    Suivez vos performances avec des tableaux de bord personnalisables et des rapports automatisés.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Tableaux de bord personnalisés</span>
                    </li>
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Rapports automatisés</span>
                    </li>
                    <li className="flex items-center text-gray-600">
                      <div className="bg-emerald-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>Insights business</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bannière CTA */}
            <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-10 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)]"></div>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Prêt à développer votre activité ?</h3>
                  <p className="text-blue-100">Rejoignez les milliers de courtiers qui font confiance à Courtizy Pro</p>
                </div>
                <button className="px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50 whitespace-nowrap flex items-center justify-center">
                  Commencer maintenant
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Premier contact</h3>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Échange personnalisé</h3>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Configuration</h3>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-4">C'est parti !</h3>
                    <p className="text-gray-600">
                      Commencez à recevoir vos premiers clients qualifiés
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section améliorée */}
        <section className="py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.1)_0%,transparent_70%)]"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-700 to-blue-900 px-5 py-2.5 rounded-full border border-blue-600 mb-6 shadow-md shadow-blue-500/10">
                <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white text-sm font-medium">Questions fréquentes</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Tout ce que vous <span className="text-blue-600">devez savoir</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Les réponses aux questions les plus fréquentes sur Courtizy Pro
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 overflow-hidden relative">
                {/* Élément décoratif */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
                
                <div className="flex items-start relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Comment rejoindre la plateforme Courtizy Pro ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pour garantir la qualité de notre réseau, nous vérifions simplement que vous êtes bien un courtier enregistré. Inscrivez-vous directement via notre formulaire, et après une rapide vérification de vos informations professionnelles, vous aurez accès à l'ensemble de nos services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 overflow-hidden relative">
                {/* Élément décoratif */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
                
                <div className="flex items-start relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Combien coûte l'inscription sur Courtizy Pro ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      L'inscription de base est gratuite. Nous proposons également des forfaits premium avec des fonctionnalités avancées pour optimiser votre visibilité et votre gestion client. <a href="/pricing" className="text-blue-600 hover:text-blue-800 font-medium">Consultez nos offres</a> pour plus de détails.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 overflow-hidden relative">
                {/* Élément décoratif */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
                
                <div className="flex items-start relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Comment sont filtrés les clients ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Notre plateforme utilise un algorithme intelligent qui met en relation les clients avec les courtiers selon leurs besoins spécifiques, leur localisation et leur disponibilité. Nous vérifions également l'identité des clients pour garantir des leads de qualité.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 overflow-hidden relative">
                {/* Élément décoratif */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
                
                <div className="flex items-start relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Comment sont protégées mes données ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Nous prenons très au sérieux la sécurité de vos données. Toutes les informations sont chiffrées et stockées selon les normes RGPD. Nous ne partageons jamais vos données avec des tiers sans votre consentement explicite.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 overflow-hidden relative">
                {/* Élément décoratif */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
                
                <div className="flex items-start relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl text-white mr-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Puis-je intégrer Courtizy Pro à mes outils existants ?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Absolument ! Courtizy Pro s'intègre parfaitement avec les outils les plus populaires comme Google Calendar, Outlook, et diverses solutions CRM. Notre API permet également des intégrations personnalisées pour les besoins spécifiques.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bannière "Vous avez d'autres questions ?" */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vous avez d'autres questions ?</h3>
              <p className="text-gray-600 mb-8">Notre équipe est disponible pour répondre à toutes vos interrogations</p>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:translate-y-[-2px]">
                Contactez-nous
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-28 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-[drift_30s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3)_0%,transparent_60%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(79,70,229,0.3)_0%,transparent_60%)]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 mb-6">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">Témoignages vérifiés</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Ce que disent <span className="bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 text-transparent bg-clip-text">nos courtiers</span>
              </h2>
              <p className="text-xl text-blue-100/90 max-w-3xl mx-auto">
                Découvrez les retours d'expérience des professionnels qui utilisent Courtizy Pro au quotidien
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Carte de témoignage 1 */}
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-md opacity-70 animate-pulse-slow"></div>
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Thomas D." 
                      className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors relative z-10"
                    />
                  </div>
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
                  <span className="text-6xl font-serif absolute -top-6 -left-2 text-white/10">"</span>
                  <p className="relative z-10 leading-relaxed">
                    Grâce à Courtizy Pro, j'ai pu développer significativement ma clientèle en seulement quelques mois. L'interface est intuitive et me permet de gagner un temps précieux dans la gestion de mes rendez-vous.
                  </p>
                  <span className="text-6xl font-serif absolute bottom-0 right-0 text-white/10 rotate-180">"</span>
                </blockquote>
              </div>

              {/* Carte de témoignage 2 - Mise en avant */}
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/10 transition-all duration-300 group hover:-translate-y-2 shadow-xl shadow-blue-950/20 transform md:scale-105 md:-translate-y-2">
                <div className="absolute top-0 right-0 -mt-3 -mr-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-xs text-blue-950 font-bold px-3 py-1 rounded-full shadow-lg">
                    TOP COURTIER
                  </div>
                </div>
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-md opacity-70 animate-pulse-slow"></div>
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="Sophie M." 
                      className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors relative z-10"
                    />
                  </div>
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
                  <span className="text-6xl font-serif absolute -top-6 -left-2 text-white/10">"</span>
                  <p className="relative z-10 leading-relaxed">
                    La plateforme me permet d'être connectée avec des clients véritablement intéressés par mes services. La qualité des leads est remarquable et le système de gestion d'agenda est un vrai plus !
                  </p>
                  <span className="text-6xl font-serif absolute bottom-0 right-0 text-white/10 rotate-180">"</span>
                </blockquote>
              </div>

              {/* Carte de témoignage 3 */}
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-md opacity-70 animate-pulse-slow"></div>
                    <img 
                      src="https://randomuser.me/api/portraits/men/62.jpg" 
                      alt="Laurent F." 
                      className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors relative z-10"
                    />
                  </div>
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
                  <span className="text-6xl font-serif absolute -top-6 -left-2 text-white/10">"</span>
                  <p className="relative z-10 leading-relaxed">
                    Je recommande vivement Courtizy Pro à tous mes collègues. L'outil est complet, les statistiques m'aident à optimiser mon activité et le support client est toujours réactif.
                  </p>
                  <span className="text-6xl font-serif absolute bottom-0 right-0 text-white/10 rotate-180">"</span>
                </blockquote>
              </div>
            </div>

            {/* Indicateurs de confiance */}
            <div className="mt-20 bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Prêts à faire partie de l'aventure ?</h3>
                <p className="text-blue-200/90 max-w-2xl mx-auto">
                  Contactez-nous dès aujourd'hui pour découvrir comment Courtizy peut transformer votre activité
                </p>
              </div>
              
              <div className="text-center mt-10">
                <a 
                  href="#contact-form" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:translate-y-[-2px]"
                >
                  Contactez-nous
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="py-24 bg-[#3b82f61a] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-[drift_30s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-600 px-4 py-2 rounded-full border border-blue-500 mb-6">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-white text-sm font-medium">Contactez-nous</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Prêt à développer votre activité ?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Remplissez le formulaire ci-dessous et notre équipe vous contactera sous 24h pour discuter de votre demande
              </p>
            </div>

            <div className="bg-white shadow-xl p-10 rounded-2xl border border-blue-100">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">Prénom</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Nom</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email professionnel</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="votre@email-pro.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Téléphone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Votre numéro de téléphone"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-gray-700 font-medium mb-2">Entreprise</label>
                  <input 
                    type="text" 
                    id="company" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                <div>
                  <label htmlFor="specialty" className="block text-gray-700 font-medium mb-2">Spécialité</label>
                  <select 
                    id="specialty" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%23374151%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="" className="bg-gray-50">Sélectionnez votre spécialité</option>
                    <option value="assurance" className="bg-gray-50">Courtier en Assurance</option>
                    <option value="realestate" className="bg-gray-50">Courtier Immobilier</option>
                    <option value="credit" className="bg-gray-50">Courtier en Crédit</option>
                    <option value="retirement" className="bg-gray-50">Courtier en Retraite</option>
                    <option value="tax" className="bg-gray-50">Courtier en Fiscalité</option>
                    <option value="recruitment" className="bg-gray-50">Courtier en Recrutement</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Parlez-nous de votre activité et de vos attentes"
                  ></textarea>
                </div>

                <div className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    id="rgpd" 
                    className="mt-1 h-4 w-4 border-gray-200 rounded text-blue-500 focus:ring-blue-500 bg-gray-50"
                  />
                  <label htmlFor="rgpd" className="text-gray-600 text-sm">
                    J'accepte que mes données soient traitées conformément à la <a href="#" className="text-blue-600 hover:text-blue-700 underline">politique de confidentialité</a> de Courtizy Pro
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg flex items-center justify-center group"
                >
                  <span>Envoyer ma demande</span>
                  <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-gray-600 text-sm">
                  Un expert vous recontactera sous 24h pour discuter de votre demande
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
              
              <h2 className="text-4xl font-bold text-white mb-8">
                Prêt à transformer votre activité de courtage ?
              </h2>
              
              <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
                Rejoignez notre communauté de courtiers professionnels et accédez à des outils innovants pour développer votre business
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <a 
                  href="#contact-form"
                  className="px-8 py-4 bg-white text-blue-950 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50 whitespace-nowrap flex items-center justify-center group"
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
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
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
                  <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Témoignages</a>
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
                &copy; {new Date().getFullYear()} Courtizy. Tous droits réservés.
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
