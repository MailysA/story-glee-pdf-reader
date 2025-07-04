import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Wand2, Heart, Star } from "lucide-react";

const themes = [
  { value: "aventure", label: "🗺️ Aventure", description: "Exploration et découvertes" },
  { value: "magie", label: "✨ Magie", description: "Monde fantastique et sortilèges" },
  { value: "animaux", label: "🐾 Animaux", description: "Amis à quatre pattes" },
  { value: "espace", label: "🚀 Espace", description: "Voyage intergalactique" },
  { value: "ocean", label: "🌊 Océan", description: "Mystères sous-marins" },
  { value: "foret", label: "🌲 Forêt", description: "Créatures magiques des bois" },
  { value: "princesse", label: "👑 Princesse", description: "Château et royauté" },
  { value: "dinosaures", label: "🦕 Dinosaures", description: "Préhistoire et géants" },
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

      // For now, we'll create a placeholder story
      // Later we'll implement AI generation
      const storyContent = `Il était une fois ${childName}, un${parseInt(childAge) < 8 ? " petit" : ""} enfant de ${childAge} ans qui vivait une aventure extraordinaire dans le monde de ${selectedTheme}...`;

      const { error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          title: `L'aventure de ${childName}`,
          theme: selectedTheme,
          child_name: childName,
          child_age: parseInt(childAge),
          story_content: storyContent,
        });

      if (error) throw error;

      toast({
        title: "Histoire créée!",
        description: "Votre histoire personnalisée a été créée avec succès.",
      });

      // Reset form
      setChildName("");
      setChildAge("");
      setSelectedTheme("");
      setCustomDetails("");

    } catch (error: any) {
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
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTheme === theme.value
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedTheme(theme.value)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{theme.label.split(" ")[0]}</div>
                <div className="font-medium">{theme.label.split(" ").slice(1).join(" ")}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {theme.description}
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