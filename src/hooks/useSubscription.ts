import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  isPremium: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isPremium: false, // Commencer en mode gratuit
    subscriptionTier: null,
    subscriptionEnd: null,
    loading: true
  });

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription({
          isPremium: false,
          subscriptionTier: null,
          subscriptionEnd: null,
          loading: false
        });
        return;
      }

      // Appeler la fonction edge pour vérifier l'abonnement Stripe
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Erreur lors de la vérification Stripe:', error);
        setSubscription({
          isPremium: false,
          subscriptionTier: null,
          subscriptionEnd: null,
          loading: false
        });
        return;
      }

      setSubscription({
        isPremium: data?.subscribed || false,
        subscriptionTier: data?.subscription_tier || null,
        subscriptionEnd: data?.subscription_end || null,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      setSubscription({
        isPremium: false,
        subscriptionTier: null,
        subscriptionEnd: null,
        loading: false
      });
    }
  };

  const createCheckoutSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error('Erreur création session Stripe:', error);
        return null;
      }

      return data?.url;
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      return null;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Erreur portail client Stripe:', error);
        return null;
      }

      return data?.url;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du portail:', error);
      return null;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    ...subscription,
    refreshSubscription: checkSubscription,
    createCheckoutSession,
    openCustomerPortal
  };
};