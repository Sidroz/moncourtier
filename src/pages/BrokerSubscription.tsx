import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle, ArrowRight, Lock, CreditCard, Zap, Users, BarChart, Clock, Shield } from 'lucide-react';
import { getBrokerSubscription, updateBrokerSubscription, addFeatureToSubscription } from '../services/subscriptionService';
import { SubscriptionPlan, subscriptionPlans, BrokerSubscription } from '../types/subscription';

export default function BrokerSubscriptionPage() {
  const [user] = useAuthState(auth);
  const [subscription, setSubscription] = useState<BrokerSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      if (user) {
        const brokerSubscription = await getBrokerSubscription(user.uid);
        setSubscription(brokerSubscription);
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (user) {
      await updateBrokerSubscription(user.uid, plan, true);
      const updatedSubscription = await getBrokerSubscription(user.uid);
      setSubscription(updatedSubscription);
    }
  };

  const handleAddFeature = async (feature: 'appointmentBooking') => {
    if (user) {
      await addFeatureToSubscription(user.uid, feature);
      const updatedSubscription = await getBrokerSubscription(user.uid);
      setSubscription(updatedSubscription);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 mb-6">
            <span className="text-sm font-medium">Choisissez votre plan</span>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Trouvez le plan parfait
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos offres et accédez à des fonctionnalités puissantes pour développer votre activité
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(subscriptionPlans).map(([plan, features], index) => (
            <div 
              key={plan}
              className={`relative rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                subscription?.plan === plan 
                  ? 'ring-4 ring-blue-500 scale-105' 
                  : 'hover:ring-2 hover:ring-blue-300'
              }`}
            >
              {/* Plan Header */}
              <div className={`px-8 py-10 ${
                plan === 'pro' 
                  ? 'bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600' 
                  : plan === 'starter'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500'
                  : 'bg-gradient-to-br from-gray-800 to-gray-700'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold text-white capitalize">{plan}</h3>
                    <p className="mt-3 text-white/90 text-lg">
                      {plan === 'free' ? 'Gratuit' : plan === 'starter' ? '19,99€/mois' : '49,99€/mois'}
                    </p>
                  </div>
                  {subscription?.plan === plan && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                      Votre plan actuel
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white px-8 py-10">
                <ul className="space-y-6">
                  <li className="flex items-start group">
                    <div className="flex-shrink-0">
                      {features.appointmentBooking ? (
                        <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <XCircle className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Prise de rendez-vous</p>
                      <p className="text-sm text-gray-500 mt-1">Gérez vos rendez-vous facilement</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0">
                      {features.calendarSync ? (
                        <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <XCircle className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Synchronisation calendrier</p>
                      <p className="text-sm text-gray-500 mt-1">Connectez votre agenda</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0">
                      {features.analytics ? (
                        <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <XCircle className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Analytics avancés</p>
                      <p className="text-sm text-gray-500 mt-1">Suivez vos performances</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Équipe</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {features.teamMembers} membre{features.teamMembers > 1 ? 's' : ''} d'équipe
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Stockage</p>
                      <p className="text-sm text-gray-500 mt-1">{features.storage} MB de stockage</p>
                    </div>
                  </li>
                </ul>

                {/* CTA Button */}
                <div className="mt-10">
                  {subscription?.plan !== plan && (
                    <button
                      onClick={() => handleUpgrade(plan as SubscriptionPlan)}
                      className={`w-full px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        plan === 'pro' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25' 
                          : plan === 'starter'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
                          : 'bg-gray-800 text-white hover:bg-gray-900 shadow-lg hover:shadow-gray-500/25'
                      }`}
                    >
                      {plan === 'free' ? 'Commencer gratuitement' : `Passer à ${plan}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        {subscription?.plan === 'free' && !subscription.additionalFeatures?.appointmentBooking && (
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
              <div className="px-8 py-10 bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="text-3xl font-bold text-white">Option Prise de Rendez-vous</h3>
                <p className="mt-3 text-white/90 text-lg">
                  Ajoutez la fonctionnalité de prise de rendez-vous à votre abonnement gratuit
                </p>
              </div>
              <div className="px-8 py-10 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">9,99€/mois</p>
                      <p className="text-sm text-gray-500 mt-1">Sans engagement</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFeature('appointmentBooking')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  >
                    Ajouter cette option
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Questions fréquentes</h2>
            <p className="mt-4 text-lg text-gray-600">Tout ce que vous devez savoir sur nos abonnements</p>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-medium text-gray-900">Puis-je changer de plan à tout moment ?</h3>
              <p className="mt-3 text-gray-600">Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prennent effet immédiatement.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-medium text-gray-900">Y a-t-il un engagement ?</h3>
              <p className="mt-3 text-gray-600">Non, tous nos plans sont sans engagement. Vous pouvez résilier à tout moment.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-medium text-gray-900">Comment fonctionne le paiement ?</h3>
              <p className="mt-3 text-gray-600">Le paiement est effectué mensuellement par carte bancaire. Vous recevrez une facture par email à chaque paiement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 