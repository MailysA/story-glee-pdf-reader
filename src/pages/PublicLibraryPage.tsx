import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Home, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";

export default function PublicLibrary() {
  const navigate = useNavigate();
  const [publicStories, setPublicStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const downloadStory = (story: any) => {
    const element = document.createElement("a");
    const file = new Blob([story.story_content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${story.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    const fetchPublicStories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-public-stories');
        
        if (error) {
          console.error('Erreur edge function:', error);
          throw new Error("Erreur lors du chargement des histoires publiques.");
        }
        
        console.log('Données reçues:', data);
        setPublicStories(data || []);
        setError(null);
      } catch (err) {
        console.error('Erreur fetch:', err);
        setError("Erreur lors du chargement des histoires publiques.");
        setPublicStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicStories();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner /> Chargement des histoires...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold text-foreground">Bibliothèque Publique</h1>
            <Star className="w-12 h-12 text-yellow-500 animate-bounce" />
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Découvrez notre collection d'histoires magiques disponibles sans connexion. 
            Ces aventures extraordinaires sont sélectionnées parmi nos créations les plus captivantes !
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("/")} variant="outline" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Accueil
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Créer mon histoire
            </Button>
          </div>
        </div>
        {/* Notice */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            🌟 Histoires disponibles hors connexion - Aucune inscription requise
          </Badge>
        </div>
        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicStories.map((story) => (
            <Card key={story.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold mb-2">
                      {story.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Une aventure pour {story.child_name}, {story.child_age} ans
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {story.theme}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Story Preview */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {story.story_content.substring(0, 150)}...
                  </p>
                  {/* Story Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {/* Durée estimée */}
                      {Math.ceil((story.story_content?.length || 0) / 1000)} min de lecture
                    </div>
                    <div className="flex items-center gap-1">
                      {story.child_age} ans
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={() => navigate(`/library/${story.id}`)} className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Lire l'histoire
                    </Button>
                    <Button 
                      onClick={() => downloadStory(story)}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Envie de créer votre propre histoire ?</CardTitle>
              <CardDescription className="text-lg">Personnalisez une aventure unique pour votre enfant avec nos outils magiques !</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/dashboard")} size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow px-8 py-4 text-lg">
                <BookOpen className="w-6 h-6 mr-3" />
                Créer une histoire personnalisée
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}