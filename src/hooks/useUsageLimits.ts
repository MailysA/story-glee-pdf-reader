import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STORY_LIMIT = 10;
const DOWNLOAD_LIMIT = 3;

interface UsageLimits {
  storiesCount: number;
  downloadsCount: number;
  canCreateStory: boolean;
  canDownload: boolean;
  storiesRemaining: number;
  downloadsRemaining: number;
  isLoading: boolean;
}

export const useUsageLimits = () => {
  const [usage, setUsage] = useState<UsageLimits>({
    storiesCount: 0,
    downloadsCount: 0,
    canCreateStory: true,
    canDownload: true,
    storiesRemaining: STORY_LIMIT,
    downloadsRemaining: DOWNLOAD_LIMIT,
    isLoading: true,
  });
  const { toast } = useToast();

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Compter les histoires créées
      const { count: storiesCount } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Récupérer les téléchargements
      const { data: usageData } = await supabase
        .from("user_usage")
        .select("downloads_count")
        .eq("user_id", user.id)
        .single();

      const downloadsCount = usageData?.downloads_count || 0;
      const actualStoriesCount = storiesCount || 0;

      setUsage({
        storiesCount: actualStoriesCount,
        downloadsCount,
        canCreateStory: actualStoriesCount < STORY_LIMIT,
        canDownload: downloadsCount < DOWNLOAD_LIMIT,
        storiesRemaining: Math.max(0, STORY_LIMIT - actualStoriesCount),
        downloadsRemaining: Math.max(0, DOWNLOAD_LIMIT - downloadsCount),
        isLoading: false,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des limites:", error);
      setUsage(prev => ({ ...prev, isLoading: false }));
    }
  };

  const incrementDownloads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      if (!usage.canDownload) {
        toast({
          title: "Limite atteinte",
          description: "Vous avez atteint la limite de téléchargements gratuits (3). Passez au premium pour plus !",
          variant: "destructive",
        });
        return false;
      }

      // Incrémenter le compteur de téléchargements
      const { error } = await supabase
        .from("user_usage")
        .upsert({
          user_id: user.id,
          downloads_count: usage.downloadsCount + 1,
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      // Rafraîchir les données
      await fetchUsage();
      return true;
    } catch (error) {
      console.error("Erreur lors de l'incrémentation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les téléchargements",
        variant: "destructive",
      });
      return false;
    }
  };

  const checkStoryLimit = () => {
    if (!usage.canCreateStory) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez créé 10 histoires gratuites. Passez au premium pour continuer !",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  return {
    ...usage,
    incrementDownloads,
    checkStoryLimit,
    refreshUsage: fetchUsage,
  };
};