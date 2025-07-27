import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mail, CheckCircle, XCircle, Sparkles, Heart, RefreshCw } from "lucide-react";

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    if (token && type) {
      handleEmailVerification();
    }
  }, [token, type]);

  const handleEmailVerification = async () => {
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token!,
        type: 'email' as any,
      });

      if (error) throw error;

      setVerified(true);
      toast({
        title: "✨ Email confirmé avec succès !",
        description: "Votre compte est maintenant activé. Redirection en cours...",
      });

      // Rediriger vers le dashboard après 3 secondes
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setError(error.message);
      toast({
        title: "Erreur de vérification",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const resendEmail = async () => {
    if (!email) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast({
        title: "Email renvoyé !",
        description: "Vérifiez votre boîte de réception.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: "var(--gradient-rainbow)"}}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-white">Histoires magiques</h1>
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white/90 text-lg">Confirmation de votre compte</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              {verified ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : error ? (
                <XCircle className="w-6 h-6 text-red-500" />
              ) : verifying ? (
                <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <Mail className="w-6 h-6 text-primary" />
              )}
              {verified 
                ? "Compte confirmé !" 
                : error 
                ? "Erreur de confirmation" 
                : verifying 
                ? "Vérification en cours..." 
                : "Vérifiez votre email"
              }
            </CardTitle>
            
            {!token && !verified && !error && (
              <CardDescription className="text-center space-y-2">
                <p className="text-base">
                  Nous avons envoyé un email de confirmation à :
                </p>
                <p className="font-semibold text-primary text-lg">
                  {email || "votre adresse email"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur le lien dans l'email pour activer votre compte
                </p>
              </CardDescription>
            )}

            {verified && (
              <CardDescription className="text-center space-y-2">
                <p className="text-base text-green-600">
                  🎉 Votre compte est maintenant activé !
                </p>
                <p className="text-sm">
                  Vous allez être redirigé vers votre tableau de bord...
                </p>
              </CardDescription>
            )}

            {error && (
              <CardDescription className="text-center space-y-2">
                <p className="text-base text-red-600">
                  Le lien de confirmation est invalide ou a expiré.
                </p>
                <p className="text-sm">
                  Vous pouvez demander un nouveau lien de confirmation.
                </p>
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {!verified && !verifying && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">
                        Conseils pour trouver l'email :
                      </p>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Vérifiez votre dossier spam/courrier indésirable</li>
                        <li>• Cherchez "MagicTales" ou "noreply"</li>
                        <li>• L'email peut prendre quelques minutes à arriver</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {email && (
                  <Button 
                    onClick={resendEmail} 
                    variant="outline" 
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renvoyer l'email de confirmation
                  </Button>
                )}

                <Button 
                  onClick={() => navigate("/auth")} 
                  variant="secondary" 
                  className="w-full"
                >
                  Retour à la connexion
                </Button>
              </>
            )}

            {verified && (
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
              >
                Accéder à mon tableau de bord
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}