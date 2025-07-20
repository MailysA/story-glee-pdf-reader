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
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
            <h1 className="text-6xl font-bold text-white">Histoires magiques</h1>
            <Heart className="w-12 h-12 text-red-300 animate-bounce" />
          </div>
          <p className="text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Créez des histoires personnalisées et magiques pour vos enfants avec l'intelligence artificielle
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="bg-white text-foreground hover:bg-white/90 px-12 py-6 text-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all"
          >
            <Wand2 className="w-8 h-8 mr-3" />
            Créer mon histoire
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
