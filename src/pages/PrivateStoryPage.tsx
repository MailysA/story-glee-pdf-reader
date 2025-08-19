import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StoryReader } from "@/components/StoryReader";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function PrivateStoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Utiliser l'URL complète Supabase pour l'edge function
        const response = await fetch(`https://eczbwgkebhckysgrqfdg.supabase.co/functions/v1/get-story-by-id?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Histoire non trouvée ou erreur de chargement.");
        }

        const data = await response.json();
        setStory(data);
      } catch (err) {
        console.error("Erreur de chargement de l'histoire:", err);
        setError("Histoire non trouvée ou erreur de chargement.");
        setStory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Spinner />
        <p className="text-lg text-muted-foreground">Chargement de l'histoire...</p>
        <p className="text-sm text-muted-foreground">Cela peut prendre quelques secondes</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-6">
        <div className="text-red-500 mb-6 text-lg">{error}</div>
        <Button
          variant="default"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="Lecture d'histoire" variant="minimal" />
      
      {/* Bouton de retour */}
      <div className="absolute top-20 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>
      
      <StoryReader story={{
        id: story.id,
        title: story.title,
        content: story.story_content,
        theme: story.theme,
        audio_url: story.audio_url
      }} />
    </div>
  );
} 