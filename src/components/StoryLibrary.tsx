import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Download, Play, Pause, Trash2, Calendar, User } from "lucide-react";

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
      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => (
          <Card
            key={story.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedStory?.id === story.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => setSelectedStory(story)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                {story.child_name}, {story.child_age} ans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="capitalize bg-primary/10 px-2 py-1 rounded-full">
                  {story.theme}
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(story.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Story Detail */}
      {selectedStory && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedStory.title}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Histoire pour {selectedStory.child_name}, {selectedStory.child_age} ans
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadStory(selectedStory)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteStory(selectedStory.id)}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="bg-muted/30 p-6 rounded-lg">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {selectedStory.story_content}
                </p>
              </div>
            </div>
            
            {selectedStory.illustration_url && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Illustration</h4>
                <img
                  src={selectedStory.illustration_url}
                  alt="Illustration de l'histoire"
                  className="rounded-lg max-w-full h-auto"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}