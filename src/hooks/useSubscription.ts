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

  const checkSubscription = async (showToast = false) => {
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

      // Temporarily skip edge function and use local data only to prevent infinite loop
      console.log('Checking subscription using local data only (edge function disabled)');
      
      const { data: subscriberData } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setSubscription({
        isPremium: subscriberData?.subscribed || false,
        subscriptionTier: subscriberData?.subscription_tier || null,
        subscriptionEnd: subscriberData?.subscription_end || null,
        loading: false
      });

      if (showToast && subscriberData?.subscribed) {
        const { toast } = await import("@/hooks/use-toast");
        toast({
          title: "Abonnement vérifié",
          description: `Votre plan ${subscriberData.subscription_tier} est actif.`,
        });
      }
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
        const { toast } = await import("@/hooks/use-toast");
        toast({
          title: "Erreur de paiement",
          description: error.message || "Impossible de créer la session de paiement",
          variant: "destructive",
        });
        return null;
      }

      return data?.url;
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le service de paiement",
        variant: "destructive",
      });
      return null;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Ouverture du portail...",
        description: "Redirection vers la gestion de votre abonnement",
      });

      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Erreur portail client Stripe:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'ouvrir le portail de gestion",
          variant: "destructive",
        });
        return null;
      }

      return data?.url;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du portail:', error);
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le service de gestion",
        variant: "destructive",
      });
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