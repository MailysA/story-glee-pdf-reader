import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function CguPageStandalone() {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header mobile responsive */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="sr-only">Retour</span>
              </Button>
              <h1 className="text-lg sm:text-xl font-bold">Conditions d'Utilisation</h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Accueil</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal responsive */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 text-sm sm:text-base">
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">1. SERVICE</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Histoire Magique propose des histoires personnalisées générées par IA pour enfants de 3 à 8 ans.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">2. TARIFICATION</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Prix de l'histoire : 2,99€</p>
                  <p>• Paiement via App Store / Google Play</p>
                  <p>• Pas de remboursement après téléchargement de l'histoire</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">3. DONNÉES COLLECTÉES</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Prénom de l'enfant</p>
                  <p>• Âge et centres d'intérêt</p>
                  <p>• Utilisation : génération d'histoires sur mesure uniquement</p>
                  <p>• Pas de transfert de données à des tiers</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">4. PROPRIÉTÉ INTELLECTUELLE</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Les histoires générées vous appartiennent. Le service utilise l'IA OpenAI.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">5. ÉDITEUR ET MENTIONS LÉGALES</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Éditeur : Mailys Airouche</p>
                  <p>• Statut : Auto-entrepreneur</p>
                  <p>• SIRET : 94319355700015</p>
                  <p>• Adresse : 70 rue dupaty, Bordeaux 33000 FRANCE</p>
                  <p>• Email : mailys.airouche@gmail.com</p>
                  <p>• Hébergement : Apple App Store / Google Play Store</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">6. DONNÉES PERSONNELLES (RGPD)</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Responsable de traitement : Mailys Airouche</p>
                  <p>• Finalités : génération d'histoires personnalisées</p>
                  <p>• Durée de conservation : jusqu'à suppression du compte</p>
                  <p>• Droits : accès, rectification, suppression (contact email)</p>
                  <p>• Pas de transfert de données à des tiers</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">7. RESPONSABILITÉS</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Le contenu est généré automatiquement par IA</p>
                  <p>• Nous ne garantissons pas l'exactitude pédagogique</p>
                  <p>• Supervision parentale recommandée</p>
                  <p>• Pas de remboursement après téléchargement de l'histoire</p>
                </div>
              </div>
            </div>
            
            {/* Boutons d'action responsive */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleGoBack}
                  className="flex-1 sm:flex-none"
                >
                  J'ai lu et j'accepte
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 sm:flex-none"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}