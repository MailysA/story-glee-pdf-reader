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

      // Vérifier si l'utilisateur a un profil premium dans la base de données
      // Pour l'instant, mode gratuit par défaut
      setSubscription({
        isPremium: false,
        subscriptionTier: null,
        subscriptionEnd: null,
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

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    ...subscription,
    refreshSubscription: checkSubscription
  };
};