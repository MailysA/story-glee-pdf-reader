import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Heart, Star } from "lucide-react";

interface AuthProps {
  onAuthSuccess?: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check URL params for reset mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'reset') {
      setResetMode(true);
    }

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mode !== 'reset') {
        if (onAuthSuccess) onAuthSuccess();
        // Rediriger selon pendingStory
        if (sessionStorage.getItem('pendingStory')) {
          navigate("/dashboard?autocreate=1");
        } else {
          navigate("/dashboard");
        }
      }
    };
    checkUser();
  }, [navigate, onAuthSuccess]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de la confirmation du mot de passe
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`
        }
      });

      if (error) throw error;

      if (onAuthSuccess) onAuthSuccess();
      // Rediriger selon pendingStory
      if (sessionStorage.getItem('pendingStory')) {
        navigate("/dashboard?autocreate=1");
      } else {
        navigate(`/email-confirmation?email=${encodeURIComponent(email)}`);
      }
      
      toast({
        title: "Compte créé avec succès!",
        description: "Un email de confirmation vous a été envoyé.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (onAuthSuccess) onAuthSuccess();
      // Rediriger selon pendingStory
      if (sessionStorage.getItem('pendingStory')) {
        navigate("/dashboard?autocreate=1");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`
      });

      if (error) throw error;

      toast({
        title: "Email envoyé !",
        description: "Vérifiez votre boîte email pour réinitialiser votre mot de passe.",
      });
      
      setResetMode(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{background: "var(--gradient-rainbow)"}}>
      {/* Bouton retour pour mode invité */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-foreground hover:text-primary z-10"
      >
        ← Retour
      </Button>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">MagicTales</h1>
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-foreground/80 text-lg">Créez des histoires magiques pour vos enfants</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Star className="w-5 h-5 text-primary" />
              Bienvenue
            </CardTitle>
            <CardDescription>
              Connectez-vous pour créer des histoires personnalisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                {!resetMode ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="parent@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setResetMode(true)}
                          className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                        >
                          Mot de passe oublié ?
                        </Button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary-glow" 
                      disabled={loading}
                    >
                      {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="font-medium">Réinitialiser votre mot de passe</h3>
                      <p className="text-sm text-muted-foreground">
                        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                      </p>
                    </div>
                    
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="parent@exemple.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-primary to-primary-glow" 
                          disabled={loading}
                        >
                          {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setResetMode(false);
                            setResetEmail("");
                          }}
                          className="w-full"
                        >
                          Retour à la connexion
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="parent@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Au moins 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Répétez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-secondary to-secondary-glow text-foreground" 
                    disabled={loading}
                  >
                    {loading ? "Création..." : "Créer un compte"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}