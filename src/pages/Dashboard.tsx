import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { BookOpen, Sparkles, Heart, Star, LogOut, Plus, Library, Settings, Crown } from "lucide-react";
import { StoryCreationForm } from "@/components/StoryCreationForm";
import { StoryLibrary } from "@/components/StoryLibrary";
import { UsageLimitCard } from "@/components/UsageLimitCard";
import { Paywall } from "@/components/Paywall";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "library">("create");
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();
  const { storiesCount, downloadsCount } = useUsageLimits();
  const { isPremium, subscriptionTier } = useSubscription();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: "var(--gradient-rainbow)"}}>
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Chargement de la magie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{background: "var(--gradient-rainbow)"}}>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">MagicTales</h1>
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={activeTab === "create" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("create")}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Créer
                </Button>
                <Button
                  variant={activeTab === "library" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("library")}
                  className="flex items-center gap-2"
                >
                  <Library className="w-4 h-4" />
                  Bibliothèque
                </Button>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    {/* Premium Status */}
                    <div className="border-b pb-4">
                      <div className="text-sm font-medium mb-2">Abonnement</div>
                      {user && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {isPremium ? (
                              <>
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                                  <Crown className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Plan {subscriptionTier}</div>
                                  <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <Crown className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Plan Gratuit</div>
                                  <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm font-medium">Votre consommation</div>
                    <UsageLimitCard
                      storiesUsed={storiesCount}
                      storiesLimit={10}
                      downloadsUsed={downloadsCount}
                      downloadsLimit={3}
                      onUpgrade={() => setShowPaywall(true)}
                    />
                    <div className="border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

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
            onPurchase={(planId) => {
              console.log("Plan sélectionné:", planId);
              // TODO: Intégrer avec Stripe
              setShowPaywall(false);
              toast({
                title: "Plan sélectionné",
                description: `Vous avez choisi le plan: ${planId}`,
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}