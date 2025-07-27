import { DashboardTabs } from "./DashboardTabs";
import { DashboardTabsMobile } from "./DashboardTabsMobile";
import { DashboardSettingsButton } from "./DashboardSettingsButton";
import { Plus, Library, Settings } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "./UserProfile";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { AccountManagement } from "./AccountManagement";

interface DashboardHeaderProps {
  activeTab: "create" | "library";
  onTabChange: (tab: "create" | "library") => void;
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

export function DashboardHeader({
  activeTab,
  onTabChange,
  user,
  isPremium,
  subscriptionTier,
  storiesCount,
  downloadsCount,
  onUpgrade,
  onUnsubscribe,
  onSignOut,
  onDeleteAccount,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-b shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Histoires magiques</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <DashboardTabs activeTab={activeTab} onTabChange={onTabChange} />
            <DashboardTabsMobile activeTab={activeTab} onTabChange={onTabChange} />
            <DashboardSettingsButton
              user={user}
              isPremium={isPremium}
              subscriptionTier={subscriptionTier}
              storiesCount={storiesCount}
              downloadsCount={downloadsCount}
              onUpgrade={onUpgrade}
              onUnsubscribe={onUnsubscribe}
              onSignOut={onSignOut}
              onDeleteAccount={onDeleteAccount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}