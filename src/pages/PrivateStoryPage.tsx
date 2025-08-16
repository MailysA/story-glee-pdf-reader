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
    setLoading(true);
    fetch(`/functions/v1/get-story-by-id?id=${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Histoire non trouvée ou erreur de chargement.");
        return res.json();
      })
      .then((data) => {
        setStory(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError("Histoire non trouvée ou erreur de chargement.");
        setStory(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner /> Chargement de l'histoire...</div>;
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