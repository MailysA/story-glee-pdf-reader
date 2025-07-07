import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  onUnsubscribe: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">MagicTales</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={activeTab === "create" ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange("create")}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer
              </Button>
              <Button
                variant={activeTab === "library" ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange("library")}
                className="flex items-center gap-2"
              >
                <Library className="w-4 h-4" />
                Bibliothèque
              </Button>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
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
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}