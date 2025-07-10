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

      // Essayer d'appeler la fonction edge pour vérifier l'abonnement Stripe
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.warn('Edge function check-subscription non disponible:', error.message);
          // Fallback: utiliser les données locales de la base Supabase
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
          return;
        }

        setSubscription({
          isPremium: data?.subscribed || false,
          subscriptionTier: data?.subscription_tier || null,
          subscriptionEnd: data?.subscription_end || null,
          loading: false
        });

        if (showToast && data?.subscribed) {
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Abonnement vérifié",
            description: `Votre plan ${data.subscription_tier} est actif.`,
          });
        }
      } catch (edgeFunctionError) {
        console.warn('Edge function non accessible, mode dégradé activé');
        // Mode dégradé: utiliser seulement les données locales
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