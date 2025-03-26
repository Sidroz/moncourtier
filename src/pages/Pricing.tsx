import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, ArrowRight, Shield, Star } from 'lucide-react';

const Pricing = () => {
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
                <Link to="/" className={`font-medium transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-blue-950' : 'text-white/90 hover:text-white'}`}>
                  Accueil
                </Link>
                <Link to="/login" className={`font-medium transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-blue-950' : 'text-white/90 hover:text-white'}`}>
                  Connexion
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 relative overflow-hidden pt-32 pb-24">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-[drift_30s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
                <Shield className="h-5 w-5 text-blue-300" />
                <span className="text-white/90 text-sm font-medium">Nos offres</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Un abonnement adapté à vos besoins
              </h1>
              <p className="text-xl text-blue-100/90 max-w-3xl mx-auto mb-12">
                Choisissez l'offre qui correspond le mieux à vos objectifs de développement et profitez de fonctionnalités premium pour optimiser votre activité
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Offre Gratuite */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Gratuit</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-4">
                    0€ <span className="text-lg text-gray-500 font-normal">/mois</span>
                  </div>
                  <p className="text-gray-600">Pour découvrir la plateforme</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Création de profil professionnel</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Visibilité sur Courtizy</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Page de profil personnalisable</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Support communautaire</span>
                  </li>
                </ul>

                <button className="w-full bg-white text-blue-600 border-2 border-blue-600 rounded-xl py-4 font-semibold hover:bg-blue-50 transition-colors duration-300">
                  S'inscrire gratuitement
                </button>
              </div>

              {/* Offre Starter */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-4">
                    29€ <span className="text-lg text-gray-500 font-normal">/mois</span>
                  </div>
                  <p className="text-gray-600">Pour bien démarrer</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Prise de RDV en ligne 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Rappels automatiques par email</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Agenda en ligne personnalisable</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Support par email</span>
                  </li>
                </ul>

                <button className="w-full bg-white text-blue-600 border-2 border-blue-600 rounded-xl py-4 font-semibold hover:bg-blue-50 transition-colors duration-300">
                  Choisir cette offre
                </button>
              </div>

              {/* Offre Pro */}
              <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl shadow-lg p-8 border border-blue-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommandé
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
                  <div className="text-4xl font-bold text-white mb-4">
                    79€ <span className="text-lg text-blue-200 font-normal">/mois</span>
                  </div>
                  <p className="text-blue-200">Pour les professionnels exigeants</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100">Toutes les fonctionnalités Starter</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100">Synchronisation Google Calendar & Outlook</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100">Paiement en ligne des consultations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100">Visioconférence intégrée</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100">Support prioritaire</span>
                  </li>
                </ul>

                <button className="w-full bg-white text-blue-950 rounded-xl py-4 font-semibold hover:bg-blue-50 transition-colors duration-300">
                  Choisir cette offre
                </button>
              </div>

              {/* Offre Enterprise */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Cabinet</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-4">
                    Sur mesure
                  </div>
                  <p className="text-gray-600">Pour les grandes équipes</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Toutes les fonctionnalités Pro</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Multi-utilisateurs illimités</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">API & intégrations personnalisées</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Account Manager dédié</span>
                  </li>
                </ul>

                <button className="w-full bg-white text-blue-600 border-2 border-blue-600 rounded-xl py-4 font-semibold hover:bg-blue-50 transition-colors duration-300">
                  Nous contacter
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Comparaison détaillée des fonctionnalités</h2>
              <p className="text-xl text-gray-600">Découvrez en détail ce que chaque offre inclut</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-gray-200">
                    <th className="py-4 px-6 text-left text-gray-500 font-medium">Fonctionnalités</th>
                    <th className="py-4 px-6 text-center text-gray-900 font-bold">Gratuit</th>
                    <th className="py-4 px-6 text-center text-gray-900 font-bold">Starter</th>
                    <th className="py-4 px-6 text-center text-blue-600 font-bold">Pro</th>
                    <th className="py-4 px-6 text-center text-gray-900 font-bold">Cabinet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 px-6 text-gray-900">Création de profil</td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-900">Visibilité sur Courtizy</td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-900">Prise de RDV en ligne</td>
                    <td className="py-4 px-6 text-center text-gray-600 text-sm">En option</td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-900">Rappels automatiques</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-900">Synchronisation calendriers</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-900">Paiement en ligne</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-900">Visioconférence</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-900">Support client</td>
                    <td className="py-4 px-6 text-center">Email</td>
                    <td className="py-4 px-6 text-center">Email</td>
                    <td className="py-4 px-6 text-center">Prioritaire</td>
                    <td className="py-4 px-6 text-center">Dédié</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-900">API & Intégrations</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center">Basique</td>
                    <td className="py-4 px-6 text-center">Personnalisé</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
              <p className="text-xl text-gray-600">Tout ce que vous devez savoir sur nos offres</p>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Puis-je changer d'offre à tout moment ?
                </h3>
                <p className="text-gray-600">
                  Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment. Les changements prendront effet à la prochaine période de facturation.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Y a-t-il un engagement de durée ?
                </h3>
                <p className="text-gray-600">
                  Non, nos abonnements sont sans engagement. Vous pouvez résilier à tout moment.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Comment fonctionne la facturation ?
                </h3>
                <p className="text-gray-600">
                  La facturation est mensuelle. Vous recevez une facture au début de chaque période et pouvez la télécharger depuis votre espace client.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-[drift_30s_linear_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">Commencez dès aujourd'hui</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à développer votre activité ?
            </h2>

            <p className="text-xl text-blue-100/90 mb-12">
              Rejoignez les milliers de courtiers qui font confiance à Courtizy Pro
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="px-8 py-4 bg-white text-blue-950 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-50 transition-all duration-300 w-full sm:w-auto">
                Essai gratuit 14 jours
              </button>
              <button className="px-8 py-4 bg-blue-800/30 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-blue-800/40 transition-all duration-300 w-full sm:w-auto">
                Demander une démo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>© {new Date().getFullYear()} Courtizy Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing; 