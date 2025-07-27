import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

interface PaywallProps {
  onPurchase?: (planId: string) => void;
}

export function Paywall({ onPurchase }: PaywallProps) {
  const { createCheckoutSession } = useSubscription();

  // Function to handle purchase
  const purchase = async (planId: string) => {
    if (planId === "free") {
      toast.success("Vous utilisez déjà le plan gratuit !");
      return;
    }

    if (planId === "monthly") {
      try {
        toast.loading("Redirection vers Stripe...");
        const checkoutUrl = await createCheckoutSession();
        
        if (checkoutUrl) {
          // Ouvrir Stripe checkout dans un nouvel onglet
          window.open(checkoutUrl, '_blank');
          toast.dismiss();
          toast.success("Session de paiement créée avec succès !");
        } else {
          toast.error("Erreur lors de la création de la session de paiement");
        }
      } catch (error) {
        toast.error("Erreur lors de la redirection vers Stripe");
        console.error('Erreur checkout:', error);
      }
    }
    
    onPurchase?.(planId);
  };

  const plans = [
    {
      id: "free",
      title: "Découverte",
      price: "0 €",
      period: "",
      description: "Parfait pour commencer",
      features: [
        "1 histoire générée",
        "1 audio",
        "1 illustration",
        "Historique limité"
      ],
      cta: "Commencer gratuitement",
      popular: false,
      ribbon: null,
      legal: "Limité à 1 histoire, 1 audio, 1 illustration."
    },
    {
      id: "monthly",
      title: "Premium",
      price: "2,99 €",
      period: "/ histoire",
      description: "",
      features: [
        "une histoire écrite de 30 pages",
        "une histoire audio ajustable",
        "une illustrations de couverture",
        "Historiques et favoris"
      ],
      cta: "Acheter mon histoire",
      popular: true,
      ribbon: "Populaire",
      legal: ""
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Choisissez votre plan
        </h1>
        <p className="text-xl text-muted-foreground">
          Créez des histoires magiques pour vos enfants
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
              plan.popular ? "ring-2 ring-primary scale-105" : ""
            }`}
          >
            {plan.ribbon && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge 
                  variant={plan.ribbon === "Populaire" ? "default" : "secondary"}
                  className="px-3 py-1 font-medium"
                >
                  {plan.ribbon}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                {plan.id === "free" && <Zap className="w-8 h-8 text-muted-foreground" />}
                {plan.id === "monthly" && <Crown className="w-8 h-8 text-primary" />}
              </div>
              <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <CardDescription className="text-sm font-medium text-primary">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => purchase(plan.id)}
                className={`w-full ${
                  plan.id === "free"
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Tous les paiements sont sécurisés. Garantie satisfait ou remboursé 30 jours.
        </p>
      </div>
    </div>
  );
}