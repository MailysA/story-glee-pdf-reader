import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Cette page gère tous les callbacks d'authentification Supabase
    const handleAuthCallback = async () => {
      try {
        // Récupérer la session depuis l'URL (fragments ou query params)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur callback auth:', error);
          toast({
            title: "Erreur d'authentification",
            description: error.message,
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // Vérifier les paramètres URL pour déterminer le type d'action
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const type = urlParams.get('type') || hashParams.get('type');
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        
        console.log('Auth callback params:', { type, accessToken, hasSession: !!data.session });

        // Si c'est une réinitialisation de mot de passe
        if (type === 'recovery' || type === 'password_recovery') {
          navigate("/reset-password" + window.location.search + window.location.hash);
          return;
        }

        // Si c'est une confirmation d'email
        if (type === 'signup' || type === 'email_confirmation') {
          navigate("/email-confirmation" + window.location.search);
          return;
        }

        // Si on a une session valide, aller au dashboard
        if (data.session) {
          navigate("/dashboard");
          return;
        }

        // Par défaut, retourner à la page d'auth
        navigate("/auth");

      } catch (error) {
        console.error('Erreur lors du callback auth:', error);
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: "var(--gradient-rainbow)"}}>
      <div className="text-center text-white">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Authentification en cours...</p>
      </div>
    </div>
  );
}