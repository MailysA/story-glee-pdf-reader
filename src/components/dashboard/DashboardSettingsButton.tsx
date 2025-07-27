import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "@supabase/supabase-js";
import { Settings } from "lucide-react";
import { AccountManagement } from "./AccountManagement";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { UserProfile } from "./UserProfile";

function LegalSummaryInSettings() {
  return (
    <div className="text-xs text-muted-foreground space-y-2 border-t pt-3 mt-3">
      <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => window.open('/legal', '_blank')}>Mentions légales & Confidentialité</Button>
    </div>
  );
}

interface DashboardSettingsButtonProps {
  user: User;
  isPremium: boolean;
  subscriptionTier: string | null;
  storiesCount: number;
  downloadsCount: number;
  onUpgrade: () => void;
  onUnsubscribe: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export function DashboardSettingsButton({
  user,
  isPremium,
  subscriptionTier,
  storiesCount,
  downloadsCount,
  onUpgrade,
  onUnsubscribe,
  onSignOut,
  onDeleteAccount,
}: DashboardSettingsButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Paramètres</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4">
        <div className="space-y-4">
          <UserProfile 
            user={user} 
            isPremium={isPremium} 
            subscriptionTier={subscriptionTier} 
          />
          <SubscriptionStatus
            storiesCount={storiesCount}
            downloadsCount={downloadsCount}
            isPremium={isPremium}
            onUpgrade={onUpgrade}
          />
          <AccountManagement
            isPremium={isPremium}
            onUnsubscribe={onUnsubscribe}
            onSignOut={onSignOut}
            onDeleteAccount={onDeleteAccount}
          />
          <LegalSummaryInSettings />
        </div>
      </PopoverContent>
    </Popover>
  );
} 