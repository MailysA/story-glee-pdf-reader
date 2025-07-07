import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, CreditCard } from "lucide-react";

interface PaywallProps {
  onPurchase?: (planId: string) => void;
}

export function Paywall({ onPurchase }: PaywallProps) {
  // Logic stub for quota checking
  const checkQuota = (planId: string): boolean => {
    // TODO: Implement actual quota checking logic
    console.log(`Checking quota for plan: ${planId}`);
    return true; // Placeholder
  };

  // Function to handle purchase
  const purchase = (planId: string) => {
    console.log(`Purchasing plan: ${planId}`);
    onPurchase?.(planId);
    // TODO: Integrate with Stripe checkout
  };

  const plans = [
    {
      id: "free",
      title: "Découverte",
      price: "0 €",
      period: "",
      description: "Parfait pour commencer",
      features: [
        "10 histoires par mois",
        "3 téléchargements par mois",
        "5 générations audio par mois",
        "Historique limité"
      ],
      cta: "Commencer gratuitement",
      popular: false,
      ribbon: null,
      legal: "Quotas se réinitialisent chaque mois."
    },
    {
      id: "monthly",
      title: "Premium",
      price: "8,99 €",
      period: "/ mois",
      description: "Essai gratuit de 7 jours",
      features: [
        "30 histoires par mois",
        "Téléchargements PDF & MP3 illimités",
        "30 générations audio par mois",
        "Historique illimité"
      ],
      cta: "Essayer 7 jours gratuits",
      popular: true,
      ribbon: "Populaire",
      legal: "Annulable à tout moment. Les quotas se réinitialisent chaque mois."
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

              <p className="text-xs text-muted-foreground text-center px-2">
                {plan.legal}
              </p>
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