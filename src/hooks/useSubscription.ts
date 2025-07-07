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

      // Vérifier si l'utilisateur a un statut premium dans localStorage (simulation)
      const isPremiumLocal = localStorage.getItem(`premium_${user.id}`) === 'true';
      
      setSubscription({
        isPremium: isPremiumLocal,
        subscriptionTier: isPremiumLocal ? 'Premium' : null,
        subscriptionEnd: isPremiumLocal ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null, // 30 jours
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

  const activatePremium = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`premium_${user.id}`, 'true');
      await checkSubscription();
    }
  };

  const deactivatePremium = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.removeItem(`premium_${user.id}`);
      await checkSubscription();
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    ...subscription,
    refreshSubscription: checkSubscription,
    activatePremium,
    deactivatePremium
  };
};