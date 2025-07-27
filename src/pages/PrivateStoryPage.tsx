import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { StoryReader } from "@/components/StoryReader";
import { Spinner } from "@/components/ui/spinner";

export default function PrivateStoryPage() {
  const { id } = useParams();
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
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen">
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