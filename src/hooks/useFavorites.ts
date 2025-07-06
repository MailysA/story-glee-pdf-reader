import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoryFavorite {
  id: string;
  story_id: string;
  child_name: string;
  created_at: string;
}

export const useFavorites = (childName?: string) => {
  const [favorites, setFavorites] = useState<StoryFavorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('story_favorites')
        .select('*');

      if (childName) {
        query = query.eq('child_name', childName);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Erreur récupération favoris:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les favoris",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (storyId: string, childName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('story_favorites')
        .insert({
          user_id: user.id,
          story_id: storyId,
          child_name: childName,
        });

      if (error) throw error;
      
      await fetchFavorites();
      toast({
        title: "Ajouté aux favoris",
        description: `Histoire ajoutée aux favoris de ${childName}`,
      });
    } catch (error) {
      console.error('Erreur ajout favori:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris",
        variant: "destructive",
      });
    }
  };

  const removeFavorite = async (storyId: string, childName: string) => {
    try {
      const { error } = await supabase
        .from('story_favorites')
        .delete()
        .eq('story_id', storyId)
        .eq('child_name', childName);

      if (error) throw error;
      
      await fetchFavorites();
      toast({
        title: "Retiré des favoris",
        description: `Histoire retirée des favoris de ${childName}`,
      });
    } catch (error) {
      console.error('Erreur suppression favori:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (storyId: string, childName: string) => {
    return favorites.some(
      fav => fav.story_id === storyId && fav.child_name === childName
    );
  };

  useEffect(() => {
    fetchFavorites();
  }, [childName]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
};