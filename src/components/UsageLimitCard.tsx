import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, Sparkles, Download, BookOpen } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface UsageLimitCardProps {
  storiesUsed: number;
  storiesLimit: number;
  downloadsUsed: number;
  downloadsLimit: number;
  audioGenerationsUsed: number;
  audioGenerationsLimit: number;
  onUpgrade?: () => void;
}

export const UsageLimitCard = ({
  storiesUsed,
  storiesLimit,
  downloadsUsed,
  downloadsLimit,
  audioGenerationsUsed,
  audioGenerationsLimit,
  onUpgrade,
}: UsageLimitCardProps) => {
  const { isPremium, subscriptionTier } = useSubscription();

  // Définir les limites selon l'abonnement
  const getSubscriptionLimits = () => {
    if (!isPremium) {
      return { stories: 1, downloads: 1, audioGenerations: 1 }; // Modèle freemium: 1 de chaque
    }
    
    switch (subscriptionTier) {
      case 'Premium':
        return { stories: 30, downloads: -1, audioGenerations: 30 }; // Téléchargements illimités en premium
      case 'Premium+':
        return { stories: 500, downloads: -1, audioGenerations: 500 };
      case 'Enterprise':
        return { stories: -1, downloads: -1, audioGenerations: -1 }; // Illimité
      default:
        return { stories: 1, downloads: 1, audioGenerations: 1 };
    }
  };

  const limits = getSubscriptionLimits();
  const actualStoriesLimit = limits.stories === -1 ? storiesLimit : Math.min(storiesLimit, limits.stories);
  const actualDownloadsLimit = limits.downloads === -1 ? downloadsLimit : Math.min(downloadsLimit, limits.downloads);
  const actualAudioLimit = limits.audioGenerations === -1 ? audioGenerationsLimit : Math.min(audioGenerationsLimit, limits.audioGenerations);
  const actualStoriesPercentage = limits.stories === -1 ? 0 : (storiesUsed / actualStoriesLimit) * 100;
  const actualDownloadsPercentage = limits.downloads === -1 ? 0 : (downloadsUsed / actualDownloadsLimit) * 100;
  const actualAudioPercentage = limits.audioGenerations === -1 ? 0 : (audioGenerationsUsed / actualAudioLimit) * 100;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 w-full max-w-full">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Votre utilisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {/* Histoires */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="truncate">Histoires magiques</span>
            </div>
            <span className="font-medium text-xs sm:text-sm shrink-0">
              {limits.stories === -1 ? 'Illimité' : `${storiesUsed}/${actualStoriesLimit}`}
            </span>
          </div>
          <Progress value={actualStoriesPercentage} className="h-1.5 sm:h-2" />
          {limits.stories === -1 ? (
            <p className="text-xs text-muted-foreground">
              Histoires illimitées ✨
            </p>
          ) : storiesUsed >= actualStoriesLimit ? (
            <p className="text-xs text-destructive">Limite atteinte !</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {actualStoriesLimit - storiesUsed} histoires restantes
            </p>
          )}
        </div>

        {/* Téléchargements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="truncate">Téléchargements</span>
              {!isPremium && (
                <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full shrink-0">
                  Premium
                </span>
              )}
            </div>
            <span className="font-medium text-xs sm:text-sm shrink-0 ml-2">
              {limits.downloads === -1 ? 'Illimité' : `${downloadsUsed}/${actualDownloadsLimit}`}
            </span>
          </div>
          <Progress value={actualDownloadsPercentage} className="h-1.5 sm:h-2" />
          {limits.downloads === -1 ? (
            <p className="text-xs text-muted-foreground">
              Téléchargements illimités ✨
            </p>
          ) : downloadsUsed >= actualDownloadsLimit ? (
            <p className="text-xs text-destructive">Limite atteinte !</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {actualDownloadsLimit - downloadsUsed} téléchargements restants
            </p>
          )}
        </div>

        {/* Générations Audio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="truncate">Génération audio</span>
              {!isPremium && (
                <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full shrink-0">
                  Premium
                </span>
              )}
            </div>
            <span className="font-medium text-xs sm:text-sm shrink-0 ml-2">
              {limits.audioGenerations === -1 ? 'Illimité' : `${audioGenerationsUsed}/${actualAudioLimit}`}
            </span>
          </div>
          <Progress value={actualAudioPercentage} className="h-1.5 sm:h-2" />
          {limits.audioGenerations === -1 ? (
            <p className="text-xs text-muted-foreground">
              Audio illimité ✨
            </p>
          ) : audioGenerationsUsed >= actualAudioLimit ? (
            <p className="text-xs text-destructive">Limite atteinte !</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {actualAudioLimit - audioGenerationsUsed} générations restantes
            </p>
          )}
        </div>

        {/* Bouton Premium responsive */}
        {!isPremium && (
          <div className="pt-2 border-t">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-primary to-primary-glow text-sm sm:text-base py-2 sm:py-2.5"
              size="sm"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Débloquer Premium
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2 leading-relaxed">
              Histoires illimitées • Téléchargements illimités • Audio premium
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};