import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, ArrowRight, Users, BarChart, Calendar as CalendarIcon, Clock, UserPlus, Settings, Shield, Building2 } from 'lucide-react';

const ForBrokers = () => {
  // Vérifier si nous sommes sur le sous-domaine pro
  const [isPro, setIsPro] = useState(false);
  
  useEffect(() => {
    const hostname = window.location.hostname;
    setIsPro(hostname === 'pro.localhost' || hostname === 'pro.moncourtier.fr');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24">
      {/* Header spécifique au domaine pro */}
      {isPro && (
        <header className="bg-white fixed shadow-md w-4/5 z-50 rounded-xl left-1/2 -translate-x-1/2 mt-4 border border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Calendar className="h-9 w-9 text-blue-950" />
                <span className="text-2xl font-extrabold text-blue-950 tracking-tight">MonCourtier Pro</span>
              </div>
              <div className="flex items-center space-x-10">
                <Link 
                  to="/login"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-950 font-medium transition-colors duration-200"
                >
                  <span>Connexion</span>
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBmaWxsPSIjMTcyNTU0IiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iNzAyLjUiIGN5PSIzNzQuNSIgcj0iMTc4LjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iNTI1IiBjeT0iNDk3IiByPSIxMTkiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iOTAyLjUiIGN5PSIyNTcuNSIgcj0iODMuNSIvPjxjaXJjbGUgc3Ryb2tlPSIjMUEzMjY4IiBzdHJva2Utd2lkdGg9IjIiIGN4PSI3MDYuNSIgY3k9IjMxNC41IiByPSIzMS41Ii8+PGNpcmNsZSBzdHJva2U9IiMxQTMyNjgiIHN0cm9rZS13aWR0aD0iMiIgY3g9IjYwMi41IiBjeT0iNDY1LjUiIHI9IjQxLjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iODY3IiBjeT0iMzQzIiByPSIzMSIvPjwvZz48L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:flex justify-between items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                {isPro ? "Bienvenue sur l'espace" : "Développez votre activité avec"} <span className="text-blue-200">MonCourtier{isPro ? " Pro" : ""}</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Rejoignez notre plateforme innovante et connectez-vous avec des clients qualifiés à la recherche de vos services. Augmentez votre visibilité et gérez efficacement votre agenda.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a 
                  href="#contact-form"
                  className="py-4 px-8 bg-white text-blue-950 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  Nous contacter
                  <ArrowRight className="h-5 w-5 ml-2" />
                </a>
                <a 
                  href="#benefits"
                  className="py-4 px-8 border border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  Découvrir les avantages
                </a>
              </div>
            </div>
            <div className="lg:w-2/5">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Courtier professionnel" 
                className="rounded-2xl shadow-2xl object-cover h-[450px] w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-8 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-blue-950 mb-2">5000+</div>
              <p className="text-gray-600">Clients actifs sur la plateforme</p>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-blue-950 mb-2">3800+</div>
              <p className="text-gray-600">Rendez-vous pris chaque mois</p>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-blue-950 mb-2">92%</div>
              <p className="text-gray-600">Taux de satisfaction des courtiers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="benefits" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            Pourquoi rejoindre notre réseau ?
          </h2>
          <p className="text-center text-gray-600 text-xl mb-16 max-w-3xl mx-auto">
            Des outils professionnels conçus pour optimiser votre activité et développer votre clientèle
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
                <Users className="h-10 w-10 text-blue-950" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Clients qualifiés</h3>
              <p className="text-gray-600">
                Connectez-vous avec des clients ciblés, à la recherche précise de vos services, pour un taux de conversion optimal.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
                <CalendarIcon className="h-10 w-10 text-blue-950" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Gestion d'agenda</h3>
              <p className="text-gray-600">
                Profitez d'un outil de calendrier intégré pour gérer efficacement vos rendez-vous et vos disponibilités.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
                <BarChart className="h-10 w-10 text-blue-950" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Statistiques détaillées</h3>
              <p className="text-gray-600">
                Accédez à des analyses complètes de vos performances et suivez l'évolution de votre activité.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
                <UserPlus className="h-10 w-10 text-blue-950" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Gestion de clientèle</h3>
              <p className="text-gray-600">
                Centralisez toutes les informations de vos clients et suivez l'historique de vos échanges.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
                <Settings className="h-10 w-10 text-blue-950" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Personnalisation</h3>
              <p className="text-gray-600">
                Créez un profil attrayant et personnalisez vos services pour attirer plus de clients.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl inline-block mb-6">
                <Shield className="h-10 w-10 text-blue-950" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Visibilité accrue</h3>
              <p className="text-gray-600">
                Améliorez votre présence en ligne et développez votre notoriété grâce à notre plateforme.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works for Brokers */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            Comment rejoindre notre réseau ?
          </h2>
          <p className="text-center text-gray-600 text-xl mb-16 max-w-3xl mx-auto">
            Un processus simple pour intégrer notre plateforme et développer votre activité
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-100 -z-10 transform -translate-y-1/2"></div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-100 relative z-10">
              <div className="w-16 h-16 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Contact</h3>
              <p className="text-gray-600">Contactez notre équipe via le formulaire ci-dessous</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-100 relative z-10">
              <div className="w-16 h-16 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Échange</h3>
              <p className="text-gray-600">Notre équipe étudiera votre profil et vous recontactera</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-100 relative z-10">
              <div className="w-16 h-16 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Inscription</h3>
              <p className="text-gray-600">Recevez votre lien d'inscription personnalisé par email</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-100 relative z-10">
              <div className="w-16 h-16 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">4</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Activation</h3>
              <p className="text-gray-600">Créez votre compte et configurez votre profil pro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            Ce que disent nos courtiers
          </h2>
          <p className="text-center text-gray-600 text-xl mb-16 max-w-3xl mx-auto">
            Découvrez les témoignages de professionnels qui utilisent MonCourtier
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Thomas D." 
                  className="w-14 h-14 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900">Thomas D.</h4>
                  <p className="text-blue-600">Courtier en Assurance</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Grâce à MonCourtier, j'ai pu développer significativement ma clientèle en seulement quelques mois. L'interface est intuitive et me permet de gagner un temps précieux dans la gestion de mes rendez-vous."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="Sophie M." 
                  className="w-14 h-14 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900">Sophie M.</h4>
                  <p className="text-blue-600">Courtière Immobilier</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "La plateforme me permet d'être connectée avec des clients véritablement intéressés par mes services. La qualité des leads est remarquable et le système de gestion d'agenda est un vrai plus !"
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/62.jpg" 
                  alt="Laurent F." 
                  className="w-14 h-14 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900">Laurent F.</h4>
                  <p className="text-blue-600">Courtier en Crédit</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Je recommande vivement MonCourtier à tous mes collègues. L'outil est complet, les statistiques m'aident à optimiser mon activité et le support client est toujours réactif."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            Questions fréquentes
          </h2>
          <p className="text-center text-gray-600 text-xl mb-16 max-w-3xl mx-auto">
            Tout ce que vous devez savoir pour démarrer
          </p>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Comment rejoindre la plateforme MonCourtier ?
              </h3>
              <p className="text-gray-600">
                Pour garantir la qualité de notre réseau, nous procédons à une sélection des courtiers. Contactez-nous via le formulaire ci-dessous, notre équipe étudiera votre profil et vous enverra un lien d'inscription personnalisé si votre candidature est retenue.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Combien coûte l'inscription sur MonCourtier ?
              </h3>
              <p className="text-gray-600">
                L'inscription de base est gratuite. Nous proposons également des forfaits premium avec des fonctionnalités avancées pour optimiser votre visibilité et votre gestion client.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Comment sont filtrés les clients ?
              </h3>
              <p className="text-gray-600">
                Notre plateforme utilise un algorithme intelligent qui met en relation les clients avec les courtiers selon leurs besoins spécifiques, leur localisation et leur disponibilité.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Puis-je gérer plusieurs types de services ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez proposer plusieurs types de services dans votre domaine d'expertise et personnaliser votre profil en conséquence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div id="contact-form" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            Vous souhaitez nous rejoindre ?
          </h2>
          <p className="text-center text-gray-600 text-xl mb-12 max-w-3xl mx-auto">
            Remplissez le formulaire ci-dessous et notre équipe vous contactera rapidement
          </p>
          
          <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-100">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">Prénom</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Nom</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email professionnel</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="votre@email-pro.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-gray-700 font-medium mb-2">Entreprise</label>
                <input 
                  type="text" 
                  id="company" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  placeholder="Nom de votre entreprise"
                />
              </div>
              
              <div>
                <label htmlFor="specialty" className="block text-gray-700 font-medium mb-2">Spécialité</label>
                <select 
                  id="specialty" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-950 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%236B7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                >
                  <option value="">Sélectionnez votre spécialité</option>
                  <option value="assurance">Courtier en Assurance</option>
                  <option value="realestate">Courtier Immobilier</option>
                  <option value="credit">Courtier en Crédit</option>
                  <option value="retirement">Courtier en Retraite</option>
                  <option value="tax">Courtier en Fiscalité</option>
                  <option value="recruitment">Courtier en Recrutement</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  placeholder="Parlez-nous de votre activité et de vos attentes"
                ></textarea>
              </div>
              
              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  id="rgpd" 
                  className="mt-1 h-4 w-4 border-gray-300 rounded text-blue-950 focus:ring-blue-950"
                />
                <label htmlFor="rgpd" className="ml-2 block text-sm text-gray-600">
                  J'accepte que mes données soient traitées conformément à la politique de confidentialité de MonCourtier
                </label>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-950 to-indigo-950 text-white py-4 rounded-xl hover:from-blue-900 hover:to-indigo-900 transition-colors font-medium shadow-md"
              >
                Envoyer ma demande
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBmaWxsPSIjMTcyNTU0IiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iNzAyLjUiIGN5PSIzNzQuNSIgcj0iMTc4LjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iNTI1IiBjeT0iNDk3IiByPSIxMTkiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iOTAyLjUiIGN5PSIyNTcuNSIgcj0iODMuNSIvPjxjaXJjbGUgc3Ryb2tlPSIjMUEzMjY4IiBzdHJva2Utd2lkdGg9IjIiIGN4PSI3MDYuNSIgY3k9IjMxNC41IiByPSIzMS41Ii8+PGNpcmNsZSBzdHJva2U9IiMxQTMyNjgiIHN0cm9rZS13aWR0aD0iMiIgY3g9IjYwMi41IiBjeT0iNDY1LjUiIHI9IjQxLjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iODY3IiBjeT0iMzQzIiByPSIzMSIvPjwvZz48L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Rejoignez notre communauté de courtiers professionnels et connectez-vous avec des clients qualifiés dès aujourd'hui.
          </p>
          <a 
            href="#contact-form"
            className="py-4 px-10 bg-white text-blue-950 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            Nous contacter
            <ArrowRight className="h-5 w-5 ml-2" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <Calendar className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold">MonCourtier{isPro ? " Pro" : ""}</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} MonCourtier. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForBrokers; 