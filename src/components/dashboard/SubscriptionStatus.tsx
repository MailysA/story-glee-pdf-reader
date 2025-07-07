import { UsageLimitCard } from "@/components/UsageLimitCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useState } from "react";

interface SubscriptionStatusProps {
  storiesCount: number;
  downloadsCount: number;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function SubscriptionStatus({ 
  storiesCount, 
  downloadsCount, 
  isPremium, 
  onUpgrade 
}: SubscriptionStatusProps) {
  const { refreshSubscription } = useSubscription();
  const { 
    audioGenerationsCount,
    storiesRemaining,
    downloadsRemaining,
    audioGenerationsRemaining,
    refreshUsage
  } = useUsageLimits();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubscription(true);
      await refreshUsage();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculer les limites basées sur le statut premium
  const getActualLimits = () => {
    if (!isPremium) {
      return { stories: 10, downloads: 3, audioGenerations: 5 };
    }
    return { stories: 30, downloads: Infinity, audioGenerations: 30 };
  };

  const limits = getActualLimits();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Votre consommation</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <UsageLimitCard
        storiesUsed={storiesCount}
        storiesLimit={limits.stories}
        downloadsUsed={downloadsCount}
        downloadsLimit={limits.downloads}
        audioGenerationsUsed={audioGenerationsCount}
        audioGenerationsLimit={limits.audioGenerations}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}