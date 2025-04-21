export type SubscriptionPlan = 'free' | 'starter' | 'pro';

export interface SubscriptionFeatures {
  appointmentBooking: boolean;
  clientManagement: boolean;
  calendarSync: boolean;
  analytics: boolean;
  customDomain: boolean;
  teamMembers: number;
  storage: number; // en MB
}

export const subscriptionPlans: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    appointmentBooking: false, // Option payante
    clientManagement: true,
    calendarSync: false,
    analytics: false,
    customDomain: false,
    teamMembers: 1,
    storage: 100
  },
  starter: {
    appointmentBooking: true,
    clientManagement: true,
    calendarSync: true,
    analytics: true,
    customDomain: false,
    teamMembers: 3,
    storage: 1000
  },
  pro: {
    appointmentBooking: true,
    clientManagement: true,
    calendarSync: true,
    analytics: true,
    customDomain: true,
    teamMembers: 10,
    storage: 5000
  }
};

export interface BrokerSubscription {
  plan: SubscriptionPlan;
  features: SubscriptionFeatures;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  additionalFeatures?: {
    appointmentBooking?: boolean;
  };
  planId: string;
  createdAt: Date;
  updatedAt: Date;
} 