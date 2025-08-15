import { User } from "@supabase/supabase-js";
import { Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileProps {
  user: User | null;
  isPremium: boolean;
  subscriptionTier: string | null;
}

export function UserProfile({ user, isPremium, subscriptionTier }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setProfile(data);
    };

    fetchProfile();
  }, [user]);

  // Protection contre les objets user null
  if (!user) {
    return (
      <div className="border-b pb-4">
        <div className="text-sm font-medium mb-2">Abonnement</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Mode Invité</div>
              <div className="text-xs text-muted-foreground">Non connecté</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="text-xs text-muted-foreground">{profile?.email || user?.email || "Email non disponible"}</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Plan Gratuit</div>
                <div className="text-xs text-muted-foreground">{profile?.email || user?.email || "Email non disponible"}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}