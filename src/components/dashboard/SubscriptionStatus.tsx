import { UsageLimitCard } from "@/components/UsageLimitCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubscription(true);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        storiesLimit={isPremium ? 30 : 10}
        downloadsUsed={downloadsCount}
        downloadsLimit={3}
        audioGenerationsUsed={0}
        audioGenerationsLimit={isPremium ? 30 : 5}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}