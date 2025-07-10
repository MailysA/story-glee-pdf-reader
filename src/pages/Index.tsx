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
    <div className="min-h-screen" style={{background: "var(--gradient-rainbow)"}}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
            <h1 className="text-6xl font-bold text-white">Histoires magiques</h1>
            <Heart className="w-12 h-12 text-red-300 animate-bounce" />
          </div>
          <p className="text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Créez des histoires personnalisées et magiques pour vos enfants avec l'intelligence artificielle
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-white text-foreground hover:bg-white/90 px-8 py-4 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all"
          >
            <Star className="w-6 h-6 mr-2" />
            Commencer la Magie
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0 hover:shadow-3xl transition-all">
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">Histoires Personnalisées</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
                Chaque histoire est unique et adaptée à l'âge, au prénom et aux goûts de votre enfant
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0 hover:shadow-3xl transition-all">
            <CardHeader className="text-center">
              <Palette className="w-12 h-12 text-secondary mx-auto mb-4" />
              <CardTitle className="text-xl">Illustrations Magiques</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
                Des illustrations générées par IA accompagnent chaque histoire pour une expérience immersive
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0 hover:shadow-3xl transition-all">
            <CardHeader className="text-center">
              <Wand2 className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-xl">Audio & Téléchargement</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
                Écoutez l'histoire avec différentes voix et téléchargez vos créations pour les garder précieusement
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Prêt à créer de la magie?
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Rejoignez des milliers de parents qui créent des souvenirs magiques avec leurs enfants
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Créer ma première histoire
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
