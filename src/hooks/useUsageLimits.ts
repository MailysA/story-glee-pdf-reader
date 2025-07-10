import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

const FREE_STORY_LIMIT = 10;
const PREMIUM_STORY_LIMIT = 30;
const FREE_DOWNLOAD_LIMIT = 3;
const PREMIUM_DOWNLOAD_LIMIT = Infinity; // Illimité pour les premium
const FREE_AUDIO_LIMIT = 5;
const PREMIUM_AUDIO_LIMIT = 30;

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
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  
  const [usage, setUsage] = useState<UsageLimits>({
    storiesCount: 0,
    downloadsCount: 0,
    audioGenerationsCount: 0,
    canCreateStory: true,
    canDownload: true,
    canGenerateAudio: true,
    storiesRemaining: FREE_STORY_LIMIT,
    downloadsRemaining: FREE_DOWNLOAD_LIMIT,
    audioGenerationsRemaining: FREE_AUDIO_LIMIT,
    isLoading: true,
  });

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Définir les limites basées sur le statut premium
      const storyLimit = isPremium ? PREMIUM_STORY_LIMIT : FREE_STORY_LIMIT;
      const downloadLimit = isPremium ? PREMIUM_DOWNLOAD_LIMIT : FREE_DOWNLOAD_LIMIT;
      const audioLimit = isPremium ? PREMIUM_AUDIO_LIMIT : FREE_AUDIO_LIMIT;

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
        canCreateStory: isPremium || actualStoriesCount < storyLimit,
        canDownload: isPremium || downloadsCount < downloadLimit,
        canGenerateAudio: isPremium || audioGenerationsCount < audioLimit,
        storiesRemaining: isPremium ? Infinity : Math.max(0, storyLimit - actualStoriesCount),
        downloadsRemaining: isPremium ? Infinity : Math.max(0, downloadLimit - downloadsCount),
        audioGenerationsRemaining: isPremium ? Infinity : Math.max(0, audioLimit - audioGenerationsCount),
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

      if (!usage.canDownload && !isPremium) {
        toast({
          title: "Limite atteinte",
          description: "Vous avez atteint la limite de téléchargements gratuits (3). Passez au premium pour plus !",
          variant: "destructive",
        });
        return false;
      }

      // Incrémenter le compteur de téléchargements seulement si pas premium
      if (!isPremium) {
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
      }

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

      if (!usage.canGenerateAudio && !isPremium) {
        toast({
          title: "Limite atteinte",
          description: "Vous avez atteint la limite de générations audio gratuites (5). Passez au premium pour plus !",
          variant: "destructive",
        });
        return false;
      }

      // Incrémenter le compteur de générations audio seulement si pas premium
      if (!isPremium) {
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
      }

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
      const limit = isPremium ? PREMIUM_STORY_LIMIT : FREE_STORY_LIMIT;
      toast({
        title: "Limite atteinte",
        description: isPremium 
          ? `Vous avez créé ${limit} histoires ce mois-ci. Votre limite sera remise à zéro le mois prochain !`
          : `Vous avez créé ${limit} histoires gratuites. Passez au premium pour continuer !`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchUsage();
  }, [isPremium]); // Un seul useEffect qui dépend d'isPremium

  return {
    ...usage,
    incrementDownloads,
    incrementAudioGenerations,
    checkStoryLimit,
    refreshUsage: fetchUsage,
  };
};