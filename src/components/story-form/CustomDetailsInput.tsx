import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Crown } from "lucide-react";

interface CustomDetailsInputProps {
  customDetails: string;
  setCustomDetails: (v: string) => void;
  isPremium: boolean;
  toast: any;
}

export function CustomDetailsInput({ customDetails, setCustomDetails, isPremium, toast }: CustomDetailsInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="customDetails" className="text-base font-medium flex items-center gap-2">
        Détails personnalisés (optionnel)
        {!isPremium && (
          <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full font-bold flex items-center gap-1">
            <Crown className="w-3 h-3" />
            PREMIUM
          </span>
        )}
      </Label>
      <Textarea
        id="customDetails"
        value={customDetails}
        onChange={(e) => isPremium ? setCustomDetails(e.target.value) : null}
        placeholder={isPremium ? "Ajoutez des détails spéciaux : animaux préférés, couleurs, passe-temps..." : "Fonctionnalité réservée aux abonnés Premium"}
        className={`min-h-[100px] resize-none ${!isPremium ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
        disabled={!isPremium}
      />
      {!isPremium && (
        <div className="text-xs text-muted-foreground">
          <span>Personnalisez vos histoires avec des détails uniques. </span>
          <button
            type="button"
            onClick={() => {
              toast({
                title: "Fonctionnalité Premium",
                description: "Passez à un abonnement Premium pour débloquer cette fonctionnalité.",
              });
            }}
            className="text-primary hover:underline font-medium"
          >
            Passer à Premium
          </button>
        </div>
      )}
    </div>
  );
} 