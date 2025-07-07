import { User } from "@supabase/supabase-js";
import { Crown } from "lucide-react";

interface UserProfileProps {
  user: User;
  isPremium: boolean;
  subscriptionTier: string | null;
}

export function UserProfile({ user, isPremium, subscriptionTier }: UserProfileProps) {
  return (
    <div className="border-b pb-4">
      <div className="text-sm font-medium mb-2">Abonnement</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {isPremium ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium">Plan {subscriptionTier}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Plan Gratuit</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}