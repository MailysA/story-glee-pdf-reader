import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Heart, Star, BookOpen, Wand2, Palette } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-6xl font-bold text-foreground">Histoires magiques</h1>
            <Heart className="w-12 h-12 text-destructive animate-bounce" />
          </div>
          <p className="text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Créez des histoires personnalisées et magiques pour vos enfants avec l'intelligence artificielle
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow px-12 py-6 text-2xl font-semibold shadow-sweet transition-all duration-300 hover:scale-105"
            >
              <Wand2 className="w-8 h-8 mr-3" />
              Créer mon histoire
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/library")}
              className="px-12 py-6 text-2xl font-semibold transition-all duration-300 hover:scale-105 border-2 hover:bg-primary/10"
            >
              <BookOpen className="w-8 h-8 mr-3" />
              Bibliothèque publique
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
