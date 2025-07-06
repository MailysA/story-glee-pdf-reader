import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Wand2, Heart, Star, Image } from "lucide-react";

const themes = [
  { value: "aventure", label: "🗺️ Aventure", description: "Exploration et découvertes", video: "/videos/book.mp4" },
  { value: "magie", label: "✨ Magie", description: "Monde fantastique et sortilèges", video: "/videos/magic-house.mp4" },
  { value: "animaux", label: "🐾 Animaux", description: "Amis à quatre pattes", video: "/videos/book.mp4" },
  { value: "espace", label: "🚀 Espace", description: "Voyage intergalactique", video: "/videos/book.mp4" },
  { value: "ocean", label: "🌊 Océan", description: "Mystères sous-marins", video: "/videos/ocean.mp4" },
  { value: "foret", label: "🌲 Forêt", description: "Créatures magiques des bois", video: "/videos/book.mp4" },
  { value: "princesse", label: "👑 Princesse", description: "Château et royauté", video: "/videos/moyen-age.mp4" },
  { value: "dinosaures", label: "🦕 Dinosaures", description: "Préhistoire et géants", video: "/videos/book.mp4" },
];

export function StoryCreationForm() {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!childName || !childAge || !selectedTheme) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Generate AI story
      const { data: storyData, error: storyError } = await supabase.functions.invoke('generate-story', {
        body: {
          childName,
          childAge: parseInt(childAge),
          theme: selectedTheme,
          customDetails
        }
      });

      if (storyError) throw storyError;
      if (!storyData?.story) throw new Error("Erreur lors de la génération de l'histoire");

      // Generate illustration
      let illustrationUrl = null;
      try {
        console.log("Génération de l'illustration...");
        const { data: illustrationData, error: illustrationError } = await supabase.functions.invoke('generate-illustration', {
          body: {
            theme: selectedTheme,
            childName,
            storyTitle: storyData.title || `L'aventure de ${childName}`
          }
        });

        if (illustrationError) {
          console.error("Erreur illustration:", illustrationError);
        } else if (illustrationData?.imageUrl) {
          illustrationUrl = illustrationData.imageUrl;
          console.log("Illustration générée:", illustrationUrl);
        }
      } catch (illustrationError) {
        console.error("Erreur lors de la génération de l'illustration:", illustrationError);
        // Continue sans illustration, pas bloquant
      }

      // Save story to database
      const { error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          title: storyData.title || `L'aventure de ${childName}`,
          theme: selectedTheme,
          child_name: childName,
          child_age: parseInt(childAge),
          story_content: storyData.story,
          illustration_url: illustrationUrl,
        });

      if (error) throw error;

      toast({
        title: "Histoire créée!",
        description: illustrationUrl 
          ? "Votre histoire magique avec illustration a été générée et sauvegardée."
          : "Votre histoire magique a été générée et sauvegardée.",
        action: illustrationUrl ? (
          <div className="flex items-center gap-1 text-xs">
            <Image className="w-3 h-3" />
            Avec illustration
          </div>
        ) : undefined,
      });

      // Reset form
      setChildName("");
      setChildAge("");
      setSelectedTheme("");
      setCustomDetails("");

    } catch (error: any) {
      console.error("Erreur complète:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Child Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="childName" className="text-base font-medium">
            Prénom de l'enfant *
          </Label>
          <Input
            id="childName"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Emma, Lucas, Chloé..."
            className="text-base"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="childAge" className="text-base font-medium">
            Âge de l'enfant *
          </Label>
          <Select value={childAge} onValueChange={setChildAge} required>
            <SelectTrigger>
              <SelectValue placeholder="Choisir l'âge" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 3).map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age} ans
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Thème de l'histoire *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <Card
              key={theme.value}
              className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden ${
                selectedTheme === theme.value
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedTheme(theme.value)}
            >
              <CardContent className="p-0">
                {theme.video ? (
                  <div className="relative">
                    <video 
                      className="w-full h-32 object-cover"
                      autoPlay 
                      loop 
                      muted
                      playsInline
                    >
                      <source src={theme.video} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl mb-1">{theme.label.split(" ")[0]}</div>
                        <div className="font-medium text-sm">{theme.label.split(" ").slice(1).join(" ")}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{theme.label.split(" ")[0]}</div>
                      <div className="font-medium text-sm">{theme.label.split(" ").slice(1).join(" ")}</div>
                    </div>
                  </div>
                )}
                <div className="p-3 text-center">
                  <div className="text-xs text-muted-foreground">
                    {theme.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Details */}
      <div className="space-y-2">
        <Label htmlFor="customDetails" className="text-base font-medium">
          Détails personnalisés (optionnel)
        </Label>
        <Textarea
          id="customDetails"
          value={customDetails}
          onChange={(e) => setCustomDetails(e.target.value)}
          placeholder="Ajoutez des détails spéciaux : animaux préférés, couleurs, passe-temps..."
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Créer l'Histoire Magique
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
