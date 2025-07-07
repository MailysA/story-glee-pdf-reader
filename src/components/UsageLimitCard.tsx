import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, Sparkles, Download, BookOpen } from "lucide-react";

interface UsageLimitCardProps {
  storiesUsed: number;
  storiesLimit: number;
  downloadsUsed: number;
  downloadsLimit: number;
  onUpgrade?: () => void;
}

export const UsageLimitCard = ({
  storiesUsed,
  storiesLimit,
  downloadsUsed,
  downloadsLimit,
  onUpgrade,
}: UsageLimitCardProps) => {
  const storiesPercentage = (storiesUsed / storiesLimit) * 100;
  const downloadsPercentage = (downloadsUsed / downloadsLimit) * 100;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="w-5 h-5 text-primary" />
          Votre utilisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Histoires */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Histoires magiques</span>
            </div>
            <span className="font-medium">
              {storiesUsed}/{storiesLimit}
            </span>
          </div>
          <Progress value={storiesPercentage} className="h-2" />
          {storiesUsed >= storiesLimit ? (
            <p className="text-xs text-destructive">Limite atteinte !</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {storiesLimit - storiesUsed} histoires restantes
            </p>
          )}
        </div>

        {/* Téléchargements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              <span>Téléchargements</span>
            </div>
            <span className="font-medium">
              {downloadsUsed}/{downloadsLimit}
            </span>
          </div>
          <Progress value={downloadsPercentage} className="h-2" />
          {downloadsUsed >= downloadsLimit ? (
            <p className="text-xs text-destructive">Limite atteinte !</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {downloadsLimit - downloadsUsed} téléchargements restants
            </p>
          )}
        </div>

        {/* Bouton Premium */}
        {(storiesUsed >= storiesLimit || downloadsUsed >= downloadsLimit) && (
          <div className="pt-2 border-t">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-primary to-primary-glow"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Passer au Premium
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Histoires illimitées • Téléchargements illimités • Audio premium
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};