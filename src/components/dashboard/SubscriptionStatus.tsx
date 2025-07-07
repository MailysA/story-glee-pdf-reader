import { UsageLimitCard } from "@/components/UsageLimitCard";

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
  return (
    <div>
      <div className="text-sm font-medium mb-2">Votre consommation</div>
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