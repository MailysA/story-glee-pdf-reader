import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STORY_LIMIT = 10;
const DOWNLOAD_LIMIT = 3;
const AUDIO_LIMIT = 5;

interface UsageLimits {
  storiesCount: number;
  downloadsCount: number;
  audioGenerationsCount: number;
  canCreateStory: boolean;
  canDownload: boolean;
  canGenerateAudio: boolean;
  storiesRemaining: number;
  downloadsRemaining: number;
  audioGenerationsRemaining: number;
  isLoading: boolean;
}

export const useUsageLimits = () => {
  const [usage, setUsage] = useState<UsageLimits>({
    storiesCount: 0,
    downloadsCount: 0,
    audioGenerationsCount: 0,
    canCreateStory: true,
    canDownload: true,
    canGenerateAudio: true,
    storiesRemaining: STORY_LIMIT,
    downloadsRemaining: DOWNLOAD_LIMIT,
    audioGenerationsRemaining: AUDIO_LIMIT,
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

      // Récupérer les téléchargements et générations audio
      const { data: usageData } = await supabase
        .from("user_usage")
        .select("downloads_count, audio_generations_count")
        .eq("user_id", user.id)
        .single();

      const downloadsCount = usageData?.downloads_count || 0;
      const audioGenerationsCount = usageData?.audio_generations_count || 0;
      const actualStoriesCount = storiesCount || 0;

      setUsage({
        storiesCount: actualStoriesCount,
        downloadsCount,
        audioGenerationsCount,
        canCreateStory: actualStoriesCount < STORY_LIMIT,
        canDownload: downloadsCount < DOWNLOAD_LIMIT,
        canGenerateAudio: audioGenerationsCount < AUDIO_LIMIT,
        storiesRemaining: Math.max(0, STORY_LIMIT - actualStoriesCount),
        downloadsRemaining: Math.max(0, DOWNLOAD_LIMIT - downloadsCount),
        audioGenerationsRemaining: Math.max(0, AUDIO_LIMIT - audioGenerationsCount),
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

  const incrementAudioGenerations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      if (!usage.canGenerateAudio) {
        toast({
          title: "Limite atteinte",
          description: "Vous avez atteint la limite de générations audio gratuites (5). Passez au premium pour plus !",
          variant: "destructive",
        });
        return false;
      }

      // Incrémenter le compteur de générations audio
      const { error } = await supabase
        .from("user_usage")
        .upsert({
          user_id: user.id,
          audio_generations_count: usage.audioGenerationsCount + 1,
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      // Rafraîchir les données
      await fetchUsage();
      return true;
    } catch (error) {
      console.error("Erreur lors de l'incrémentation audio:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les générations audio",
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
    incrementAudioGenerations,
    checkStoryLimit,
    refreshUsage: fetchUsage,
  };
};