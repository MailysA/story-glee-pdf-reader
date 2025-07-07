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
    isPremium: true, // Par défaut premium pour le développement
    subscriptionTier: 'Premium',
    subscriptionEnd: null,
    loading: false
  });

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }

      // Pour l'instant, considérer tous les utilisateurs comme premium
      // Dans un vrai projet, vous ajouteriez une vraie logique d'abonnement
      setSubscription({
        isPremium: true,
        subscriptionTier: 'Premium',
        subscriptionEnd: null,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      setSubscription({
        isPremium: true,
        subscriptionTier: 'Premium',
        subscriptionEnd: null,
        loading: false
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    ...subscription,
    refreshSubscription: checkSubscription
  };
};