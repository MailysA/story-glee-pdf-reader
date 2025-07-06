import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Download, Play, Pause, Trash2, Calendar, User, Heart, Filter } from "lucide-react";
import { StoryReader } from "./StoryReader";
import { useFavorites } from "@/hooks/useFavorites";

interface Story {
  id: string;
  title: string;
  theme: string;
  child_name: string;
  child_age: number;
  story_content: string;
  illustration_url?: string;
  audio_url?: string;
  created_at: string;
}

export function StoryLibrary() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedChild, setSelectedChild] = useState<string>("tous");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Récupérer la liste unique des enfants
  const uniqueChildren = Array.from(new Set(stories.map(story => story.child_name)));

  // Filtrer les histoires selon les critères
  const filteredStories = stories.filter(story => {
    const matchesChild = selectedChild === "tous" || story.child_name === selectedChild;
    const matchesFavorites = !showFavoritesOnly || isFavorite(story.id, story.child_name);
    return matchesChild && matchesFavorites;
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setStories(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les histoires.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;

      setStories(stories.filter(story => story.id !== storyId));
      setSelectedStory(null);
      
      toast({
        title: "Histoire supprimée",
        description: "L'histoire a été supprimée avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'histoire.",
        variant: "destructive",
      });
    }
  };

  const downloadStory = (story: Story) => {
    const content = `${story.title}\n\n${story.story_content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedStory) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedStory(null)}
            className="flex items-center gap-2"
          >
            ← Retour à la bibliothèque
          </Button>
          <h2 className="text-2xl font-bold">{selectedStory.title}</h2>
        </div>
        <StoryReader story={{
          id: selectedStory.id,
          title: selectedStory.title,
          content: selectedStory.story_content,
          illustration_url: selectedStory.illustration_url,
          audio_url: selectedStory.audio_url
        }} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
        <p className="text-muted-foreground">Chargement de vos histoires...</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucune histoire créée</h3>
        <p className="text-muted-foreground">
          Créez votre première histoire magique pour commencer votre bibliothèque!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtres:</span>
        </div>
        
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sélectionner un enfant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les enfants</SelectItem>
            {uniqueChildren.map((child) => (
              <SelectItem key={child} value={child}>
                {child}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="flex items-center gap-2"
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
          {showFavoritesOnly ? "Tous" : "Favoris"}
        </Button>

        <Badge variant="secondary" className="ml-auto">
          {filteredStories.length} histoire{filteredStories.length > 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStories.map((story) => (
          <Card
            key={story.id}
            className="transition-all hover:shadow-lg hover:bg-muted/50"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    {story.child_name}, {story.child_age} ans
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFavorite(story.id, story.child_name)) {
                      removeFavorite(story.id, story.child_name);
                    } else {
                      addFavorite(story.id, story.child_name);
                    }
                  }}
                  className="p-2 h-8 w-8"
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      isFavorite(story.id, story.child_name) 
                        ? "fill-red-500 text-red-500" 
                        : "text-muted-foreground hover:text-red-500"
                    }`} 
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span className="capitalize bg-primary/10 px-2 py-1 rounded-full">
                  {story.theme}
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(story.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStory(story);
                  }}
                  className="flex items-center gap-2 flex-1"
                >
                  <BookOpen className="w-4 h-4" />
                  Lire
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadStory(story);
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {showFavoritesOnly ? "Aucun favori trouvé" : "Aucune histoire trouvée"}
          </h3>
          <p className="text-muted-foreground">
            {showFavoritesOnly 
              ? "Ajoutez des histoires à vos favoris en cliquant sur le cœur ♥" 
              : "Modifiez vos filtres pour voir plus d'histoires."
            }
          </p>
        </div>
      )}
    </div>
  );
}