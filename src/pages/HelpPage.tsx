import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineQuestionMarkCircle, HiOutlineChatAlt2, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';

const HelpPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (questionId: string) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(questionId)) {
      newOpenQuestions.delete(questionId);
    } else {
      newOpenQuestions.add(questionId);
    }
    setOpenQuestions(newOpenQuestions);
  };

  const faqData = {
    general: [
      {
        id: 'general-1',
        question: 'Qu\'est-ce que MonCourtier ?',
        answer: 'MonCourtier est une plateforme qui met en relation des clients avec des courtiers immobiliers professionnels. Notre objectif est de simplifier le processus de recherche et de vente immobilière.'
      },
      {
        id: 'general-2',
        question: 'Comment fonctionne la plateforme ?',
        answer: 'Les clients peuvent rechercher des courtiers, prendre rendez-vous et gérer leurs transactions immobilières. Les courtiers peuvent gérer leur profil, leurs rendez-vous et leurs clients.'
      },
      {
        id: 'general-3',
        question: 'Est-ce que l\'utilisation de la plateforme est gratuite ?',
        answer: 'L\'inscription et l\'utilisation de base sont gratuites pour les clients. Les courtiers peuvent choisir parmi différents plans d\'abonnement selon leurs besoins.'
      }
    ],
    clients: [
      {
        id: 'clients-1',
        question: 'Comment prendre rendez-vous avec un courtier ?',
        answer: 'Vous pouvez rechercher un courtier via notre moteur de recherche, consulter son profil et son calendrier de disponibilités, puis réserver un créneau directement en ligne.'
      },
      {
        id: 'clients-2',
        question: 'Puis-je annuler ou modifier un rendez-vous ?',
        answer: 'Oui, vous pouvez modifier ou annuler vos rendez-vous depuis votre tableau de bord client. Veuillez noter que certaines conditions d\'annulation peuvent s\'appliquer selon le courtier.'
      },
      {
        id: 'clients-3',
        question: 'Comment évaluer un courtier ?',
        answer: 'Après chaque rendez-vous, vous recevrez une demande d\'évaluation. Vous pouvez noter le courtier et laisser un commentaire sur votre expérience.'
      }
    ],
    courtiers: [
      {
        id: 'courtiers-1',
        question: 'Comment créer mon profil de courtier ?',
        answer: 'Inscrivez-vous en tant que courtier, complétez votre profil avec vos informations professionnelles, vos spécialités et vos disponibilités. Votre profil sera ensuite vérifié par notre équipe.'
      },
      {
        id: 'courtiers-2',
        question: 'Comment gérer mon calendrier ?',
        answer: 'Vous pouvez configurer vos disponibilités dans votre tableau de bord courtier. Le système vous permet de définir vos horaires de travail et vos jours de congé.'
      },
      {
        id: 'courtiers-3',
        question: 'Comment sont gérées les commissions ?',
        answer: 'Les commissions sont négociées directement entre vous et vos clients. La plateforme ne prend aucune commission sur vos transactions.'
      }
    ],
    technique: [
      {
        id: 'technique-1',
        question: 'Quels navigateurs sont supportés ?',
        answer: 'MonCourtier fonctionne sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge) et est optimisé pour les appareils mobiles.'
      },
      {
        id: 'technique-2',
        question: 'Comment sécuriser mon compte ?',
        answer: 'Nous vous recommandons d\'utiliser un mot de passe fort et d\'activer l\'authentification à deux facteurs. Ne partagez jamais vos identifiants de connexion.'
      },
      {
        id: 'technique-3',
        question: 'Que faire en cas de problème technique ?',
        answer: 'Notre équipe de support est disponible 7j/7. Vous pouvez nous contacter via le chat en ligne ou par email à support@moncourtier.com'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-950 to-indigo-900 py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBmaWxsPSIjMTcyNTU0IiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iNzAyLjUiIGN5PSIzNzQuNSIgcj0iMTc4LjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iNTI1IiBjeT0iNDk3IiByPSIxMTkiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iOTAyLjUiIGN5PSIyNTcuNSIgcj0iODMuNSIvPjxjaXJjbGUgc3Ryb2tlPSIjMUEzMjY4IiBzdHJva2Utd2lkdGg9IjIiIGN4PSI3MDYuNSIgY3k9IjMxNC41IiByPSIzMS41Ii8+PGNpcmNsZSBzdHJva2U9IiMxQTMyNjgiIHN0cm9rZS13aWR0aD0iMiIgY3g9IjYwMi41IiBjeT0iNDY1LjUiIHI9IjQxLjUiLz48Y2lyY2xlIHN0cm9rZT0iIzFBMzI2OCIgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iODY3IiBjeT0iMzQzIiByPSIzMSIvPjwvZz48L3N2Zz4=')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">Centre d'aide</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions et bénéficiez de notre support personnalisé
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <HiOutlineQuestionMarkCircle className="h-6 w-6 text-blue-600 mr-2" />
                Catégories
              </h2>
              <ul className="space-y-2">
                {Object.keys(faqData).map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => setActiveCategory(category)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
                        activeCategory === category
                          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category === 'general' && 'Général'}
                      {category === 'clients' && 'Pour les clients'}
                      {category === 'courtiers' && 'Pour les courtiers'}
                      {category === 'technique' && 'Support technique'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100 border border-gray-100">
              {faqData[activeCategory as keyof typeof faqData].map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <button
                    onClick={() => toggleQuestion(item.id)}
                    className="w-full text-left flex justify-between items-center group"
                  >
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {item.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: openQuestions.has(item.id) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openQuestions.has(item.id) ? 'auto' : 0,
                      opacity: openQuestions.has(item.id) ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-gray-600 leading-relaxed">{item.answer}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <HiOutlineChatAlt2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Chat en direct</h3>
            <p className="text-gray-600 mb-6">Discutez en direct avec notre équipe de support</p>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Démarrer le chat
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <HiOutlineMail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Email</h3>
            <p className="text-gray-600 mb-6">Envoyez-nous un email et nous vous répondrons dans les 24h</p>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Envoyer un email
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <HiOutlinePhone className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Téléphone</h3>
            <p className="text-gray-600 mb-6">Appelez-nous au 01 23 45 67 89</p>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Appeler maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 