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

      // Appeler la fonction edge pour vérifier l'abonnement Stripe
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Erreur lors de la vérification Stripe:', error);
        if (showToast) {
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Erreur de vérification",
            description: "Impossible de vérifier votre abonnement. Veuillez réessayer.",
            variant: "destructive",
          });
        }
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

      if (showToast && data?.subscribed) {
        const { toast } = await import("@/hooks/use-toast");
        toast({
          title: "Abonnement vérifié",
          description: `Votre plan ${data.subscription_tier} est actif.`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      if (showToast) {
        const { toast } = await import("@/hooks/use-toast");
        toast({
          title: "Erreur réseau",
          description: "Impossible de contacter nos serveurs. Vérifiez votre connexion.",
          variant: "destructive",
        });
      }
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