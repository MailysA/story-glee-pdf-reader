import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { BookOpen, Sparkles, Star } from "lucide-react";
import { StoryCreationForm } from "@/components/StoryCreationForm";
import { StoryLibrary } from "@/components/StoryLibrary";
import { Paywall } from "@/components/Paywall";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "library">("create");
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();
  const { storiesCount, downloadsCount, refreshUsage } = useUsageLimits();
  const { isPremium, subscriptionTier, openCustomerPortal, refreshSubscription } = useSubscription();

  useEffect(() => {
    // Check for successful payment from URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Attendre un peu puis rafraîchir l'abonnement et les données d'usage
      setTimeout(async () => {
        await refreshSubscription();
        await refreshUsage();
        
        // Animation de félicitations avec poussière d'étoiles
        toast({
          title: "🎉 Bienvenue en Premium !",
          description: "Vos nouvelles fonctionnalités sont maintenant actives !",
        });
        
        // Déclencher l'animation de poussière d'étoiles
        const stardust = document.createElement('div');
        stardust.className = 'stardust-celebration';
        document.body.appendChild(stardust);
        setTimeout(() => document.body.removeChild(stardust), 3000);
      }, 2000);
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Remove redirect for offline mode - allow access without authentication
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Remove redirect for offline mode - allow access without authentication
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [navigate]);

  const handleUnsubscribe = useCallback(async () => {
    try {
      const portalUrl = await openCustomerPortal();
      
      if (portalUrl) {
        // Ouvrir le portail client Stripe dans un nouvel onglet
        window.open(portalUrl, '_blank');
        toast({
          title: "Redirection vers Stripe",
          description: "Gérez votre abonnement dans le portail client Stripe.",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ouvrir le portail de gestion d'abonnement.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au portail de gestion d'abonnement.",
        variant: "destructive",
      });
    }
  }, [openCustomerPortal]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      // Delete user data first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user?.id);

      const { error: storiesError } = await supabase
        .from('stories')
        .delete()
        .eq('user_id', user?.id);

      const { error: usageError } = await supabase
        .from('user_usage')
        .delete()
        .eq('user_id', user?.id);

      toast({
        title: "Compte supprimé",
        description: "Votre compte et toutes vos données ont été supprimés.",
      });

      // Sign out the user
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte. Contactez le support.",
        variant: "destructive",
      });
    }
  }, [user?.id, navigate]);

  const handleUpgrade = useCallback(() => {
    setShowPaywall(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground text-xl">Chargement de la magie...</p>
        </div>
      </div>
    );
  }

  // Allow access even without user for offline mode

  return (
    <div className="min-h-screen">
      
      {/* Header */}
      <DashboardHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        isPremium={isPremium}
        subscriptionTier={subscriptionTier}
        storiesCount={storiesCount}
        downloadsCount={downloadsCount}
        onUpgrade={handleUpgrade}
        onUnsubscribe={handleUnsubscribe}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === "create" ? (
            <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center gap-2 justify-center text-2xl">
                  <Star className="w-6 h-6 text-primary" />
                  Créer une Nouvelle Histoire
                </CardTitle>
                <CardDescription className="text-lg">
                  Personnalisez une histoire magique pour votre enfant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StoryCreationForm />
              </CardContent>
            </Card>
          ) : (
            <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center gap-2 justify-center text-2xl">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Ma Bibliothèque d'Histoires
                </CardTitle>
                <CardDescription className="text-lg">
                  Retrouvez toutes vos histoires créées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StoryLibrary />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Paywall Dialog */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Choisir un plan</DialogTitle>
          </DialogHeader>
          <Paywall 
            onPurchase={async (planId) => {
              console.log("Plan sélectionné:", planId);
              
              if (planId === "monthly") {
                // Fermer le paywall (Stripe s'ouvre dans un nouvel onglet)
                setShowPaywall(false);
              } else {
                setShowPaywall(false);
                toast({
                  title: "Plan sélectionné",
                  description: `Vous utilisez déjà le plan gratuit !`,
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}