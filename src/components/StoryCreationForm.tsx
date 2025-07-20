import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { Sparkles, Wand2, Heart, Star, Image, Crown } from "lucide-react";

const narrativeTones = [
  { value: "doux", label: "🌸 Doux", description: "Histoires tendres et rassurantes" },
  { value: "aventure", label: "⚔️ Aventure", description: "Récits palpitants et pleins d'action" },
  { value: "mysterieux", label: "🔍 Mystérieux", description: "Énigmes et découvertes intrigantes" },
  { value: "drole", label: "😄 Drôle", description: "Histoires pleines d'humour et de rires" },
  { value: "educatif", label: "📚 Éducatif", description: "Apprentissage ludique et instructif" },
  { value: "poetique", label: "🌙 Poétique", description: "Langage imagé et rêveur" },
  { value: "heroique", label: "🦸‍♂️ Héroïque", description: "Courage et bravoure" },
];

const themeCategories = [
  {
    name: "Contes & Légendes",
    icon: "👑",
    themes: [
      { value: "conte-de-fees", label: "✨ Conte de Fées", description: "Magie et merveilles", video: "/videos/farytail.mp4" },
      { value: "princesse", label: "👑 Princesse", description: "Château et royauté", video: "/videos/princess.mp4" },
      { value: "sorciere", label: "🧙‍♀️ Sorcière", description: "Potions et sortilèges", video: "/videos/witch.mp4" },
      { value: "fantome", label: "👻 Fantôme", description: "Mystères et frissons", video: "/videos/ghost.mp4" },
    ]
  },
  {
    name: "Aventures & Exploration",
    icon: "🗺️",
    themes: [
      { value: "aventure", label: "🗺️ Grande Aventure", description: "Exploration et découvertes", video: "/videos/adventure1.mp4" },
      { value: "aventure-jungle", label: "🌿 Aventure Jungle", description: "Expédition tropicale", video: "/videos/adventure2.mp4" },
      { value: "pirate", label: "🏴‍☠️ Pirates", description: "Trésors et océans", video: "/videos/pirate.mp4" },
      { value: "alien", label: "👽 Extraterrestres", description: "Rencontres cosmiques", video: "/videos/alien.mp4" },
    ]
  },
  {
    name: "Nature & Environnement",
    icon: "🌱",
    themes: [
      { value: "foret", label: "🌲 Forêt", description: "Créatures des bois", video: "/videos/forest1.mp4" },
      { value: "foret-enchantee", label: "🧚‍♀️ Forêt Enchantée", description: "Magie forestière", video: "/videos/magic-forest.mp4" },
      { value: "ocean", label: "🌊 Océan", description: "Mystères sous-marins", video: "/videos/ocean.mp4" },
      { value: "banquise", label: "🐧 Banquise", description: "Aventures polaires", video: "/videos/banquise.mp4" },
      { value: "environnement", label: "🌍 Environnement", description: "Protection de la nature", video: "/videos/environment.mp4" },
    ]
  },
  {
    name: "Histoire & Époques",
    icon: "🏛️",
    themes: [
      { value: "egypte", label: "🏺 Égypte Antique", description: "Pharaons et pyramides", video: "/videos/egypte.mp4" },
      { value: "moyen-age", label: "🏰 Moyen Âge", description: "Chevaliers et châteaux", video: "/videos/moyen-age.mp4" },
      { value: "renaissance", label: "🎨 Renaissance", description: "Art et inventions", video: "/videos/renaissance.mp4" },
      { value: "revolution", label: "⚔️ Révolution", description: "Grands changements", video: "/videos/revolution.mp4" },
    ]
  },
  {
    name: "Sciences & Découvertes",
    icon: "🔬",
    themes: [
      { value: "dinosaures", label: "🦕 Dinosaures", description: "Préhistoire et géants", video: "/videos/dinosaures.mp4" },
      { value: "robots", label: "🤖 Robots", description: "Technologie du futur", video: "/videos/robots.mp4" },
      { value: "industriel", label: "🏭 Industrie", description: "Machines et innovations", video: "/videos/industriel.mp4" },
    ]
  },
  {
    name: "Apprentissage",
    icon: "📚",
    themes: [
      { value: "alphabet", label: "🔤 Alphabet", description: "Lettres et mots", video: "/videos/alphabet.mp4" },
      { value: "nombres", label: "🔢 Nombres", description: "Mathématiques amusantes", video: "/videos/numbers.mp4" },
      { value: "logique", label: "🧩 Logique", description: "Énigmes et réflexion", video: "/videos/logic.mp4" },
      { value: "emotions", label: "❤️ Émotions", description: "Sentiments et empathie", video: "/videos/emotions.mp4" },
    ]
  },
  {
    name: "Valeurs & Société",
    icon: "🤝",
    themes: [
      { value: "respect", label: "🤝 Respect", description: "Vivre ensemble", video: "/videos/respect.mp4" },
      { value: "bonnes-manieres", label: "🎩 Bonnes Manières", description: "Politesse et savoir-vivre", video: "/videos/goodmaners.mp4" },
      { value: "recyclage", label: "♻️ Recyclage", description: "Prendre soin de la planète", video: "/videos/recycling.mp4" },
    ]
  },
  {
    name: "Divertissement",
    icon: "🎪",
    themes: [
      { value: "cirque", label: "🎪 Cirque", description: "Spectacle et acrobaties", video: "/videos/circus.mp4" },
      { value: "bonbons", label: "🍭 Bonbons", description: "Sucreries magiques", video: "/videos/candys.mp4" },
      { value: "maison-magique", label: "🏠 Maison Magique", description: "Mystères domestiques", video: "/videos/magic-house.mp4" },
    ]
  }
];

export function StoryCreationForm() {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [narrativeTone, setNarrativeTone] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const { checkStoryLimit, refreshUsage } = useUsageLimits();
  const { isPremium, refreshSubscription, subscriptionTier } = useSubscription();

  // Remove the refresh subscription on mount to prevent infinite loops
  // The subscription status is already managed by the useSubscription hook

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

    // Vérifier les limites avant de créer
    if (!checkStoryLimit()) {
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
          narrativeTone,
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
      setNarrativeTone("");
      setCustomDetails("");

      // Refresh usage data
      await refreshUsage();

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
      <div className="space-y-6">
        <Label className="text-base font-medium">Thème de l'histoire *</Label>
        
        {themeCategories.map((category) => (
          <div key={category.name} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-lg">{category.icon}</span>
              {category.name}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.themes.map((theme) => (
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
        ))}
      </div>

      {/* Narrative Tone Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Ton narratif (optionnel)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {narrativeTones.map((tone) => (
            <Card
              key={tone.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                narrativeTone === tone.value
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/30"
              }`}
              onClick={() => setNarrativeTone(narrativeTone === tone.value ? "" : tone.value)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-lg mb-2">{tone.label.split(" ")[0]}</div>
                <div className="font-medium text-sm mb-1">
                  {tone.label.split(" ").slice(1).join(" ")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tone.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Sélectionnez un ton pour personnaliser le style de narration de l'histoire.
        </p>
      </div>

      {/* Custom Details */}
      <div className="space-y-2">
        <Label htmlFor="customDetails" className="text-base font-medium flex items-center gap-2">
          Détails personnalisés (optionnel)
          {!isPremium && (
            <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" />
              PREMIUM
            </span>
          )}
        </Label>
        <Textarea
          id="customDetails"
          value={customDetails}
          onChange={(e) => isPremium ? setCustomDetails(e.target.value) : null}
          placeholder={isPremium ? "Ajoutez des détails spéciaux : animaux préférés, couleurs, passe-temps..." : "Fonctionnalité réservée aux abonnés Premium"}
          className={`min-h-[100px] resize-none ${!isPremium ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
          disabled={!isPremium}
        />
        {!isPremium && (
          <div className="text-xs text-muted-foreground">
            <span>Personnalisez vos histoires avec des détails uniques. </span>
            <button
              type="button"
              onClick={() => {
                toast({
                  title: "Fonctionnalité Premium",
                  description: "Passez à un abonnement Premium pour débloquer cette fonctionnalité.",
                });
              }}
              className="text-primary hover:underline font-medium"
            >
              Passer à Premium
            </button>
          </div>
        )}
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
