import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { SubscriptionPlan, subscriptionPlans, SubscriptionFeatures, BrokerSubscription } from '../types/subscription';
import { db } from '../firebase';

export const getBrokerSubscription = async (brokerId: string): Promise<BrokerSubscription> => {
  try {
    const subscriptionRef = doc(db, 'brokerSubscriptions', brokerId);
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (subscriptionDoc.exists()) {
      const data = subscriptionDoc.data();
      return {
        ...data,
        planId: data.plan,
        plan: data.plan as SubscriptionPlan,
        startDate: data.startDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as BrokerSubscription;
    }

    // Si aucun abonnement n'existe, créer un abonnement gratuit par défaut
    const defaultSubscription: BrokerSubscription = {
      planId: 'free',
      plan: 'free',
      isActive: true,
      features: subscriptionPlans.free,
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      additionalFeatures: {
        appointmentBooking: false
      }
    };

    await setDoc(subscriptionRef, {
      ...defaultSubscription,
      startDate: Timestamp.fromDate(defaultSubscription.startDate),
      createdAt: Timestamp.fromDate(defaultSubscription.createdAt),
      updatedAt: Timestamp.fromDate(defaultSubscription.updatedAt)
    });
    return defaultSubscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
};

export const updateBrokerSubscription = async (
  brokerId: string,
  planId: SubscriptionPlan,
  isActive: boolean
): Promise<void> => {
  try {
    const subscriptionRef = doc(db, 'brokerSubscriptions', brokerId);
    const subscriptionData = {
      planId,
      plan: planId,
      isActive: Boolean(isActive),
      features: subscriptionPlans[planId],
      updatedAt: serverTimestamp()
    };
    await setDoc(subscriptionRef, subscriptionData, { merge: true });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const updateBrokerFeatures = async (
  brokerId: string,
  features: SubscriptionFeatures,
  additionalFeatures?: { appointmentBooking?: boolean }
): Promise<void> => {
  try {
    const subscriptionRef = doc(db, 'brokerSubscriptions', brokerId);
    const updateData = {
      features,
      additionalFeatures,
      updatedAt: serverTimestamp()
    };
    await updateDoc(subscriptionRef, updateData);
  } catch (error) {
    console.error('Error updating features:', error);
    throw error;
  }
};

export const addFeatureToSubscription = async (
  brokerId: string,
  feature: keyof SubscriptionFeatures
): Promise<void> => {
  try {
    const subscription = await getBrokerSubscription(brokerId);
    if (!subscription.features) {
      throw new Error('Subscription features not found');
    }

    const updatedFeatures: SubscriptionFeatures = {
      ...subscription.features,
      [feature]: true
    };

    await updateBrokerFeatures(brokerId, updatedFeatures);
  } catch (error) {
    console.error('Error adding feature:', error);
    throw error;
  }
};

export const hasFeature = (subscription: BrokerSubscription, feature: keyof SubscriptionFeatures): boolean => {
  if (!subscription.features) {
    return false;
  }
  return Boolean(subscription.features[feature]) || 
         (feature === 'appointmentBooking' && subscription.additionalFeatures?.appointmentBooking === true);
}; 