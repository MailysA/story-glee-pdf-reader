import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { StoryGenerationAnimation } from "./StoryGenerationAnimation";
import { Sparkles, Wand2, Heart, Star, Image, Crown, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { AuthSheet } from "@/components/AuthSheet";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const narrativeTones = [
  { value: "doux", label: "🌸 Doux", description: "Histoires tendres et rassurantes" },
  { value: "aventure", label: "⚔️ Aventure", description: "Récits palpitants et pleins d'action" },
  { value: "mysterieux", label: "🔍 Mystérieux", description: "Énigmes et découvertes intrigantes" },
  { value: "drole", label: "😄 Drôle", description: "Histoires pleines d'humour et de rires" },
  { value: "educatif", label: "📚 Éducatif", description: "Apprentissage ludique et instructif" },
  { value: "poetique", label: "🌙 Poétique", description: "Langage imagé et rêveur" },
  { value: "heroique", label: "🦸‍♂️ Héroïque", description: "Courage et bravoure" },
];

export function StoryCreationForm() {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [narrativeTone, setNarrativeTone] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTheme, setSearchTheme] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [toneSectionCollapsed, setToneSectionCollapsed] = useState(true);
  const { checkStoryLimit, refreshUsage } = useUsageLimits();
  const { isPremium, refreshSubscription, subscriptionTier } = useSubscription();
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [pendingStory, setPendingStory] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [themeCategories, setThemeCategories] = useState<any[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [themesLoading, setThemesLoading] = useState(true);

  // Charger dynamiquement les catégories/thèmes depuis Supabase
  useEffect(() => {
    setThemesLoading(true);
    fetch('/functions/v1/get-theme-categories')
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des thèmes");
        return res.json();
      })
      .then((data) => {
        setThemeCategories(data || []);
        setThemesLoading(false);
      })
      .catch(() => {
        setThemeCategories([]);
        setThemesLoading(false);
      });
  }, []);

  // Filtrage des thèmes basé sur la recherche
  const filteredCategories = useMemo(() => {
    if (!searchTheme.trim()) return themeCategories;
    
    return themeCategories
      .map(category => ({
        ...category,
        themes: (category.themes || []).filter(theme =>
          theme.label.toLowerCase().includes(searchTheme.toLowerCase()) ||
          theme.description.toLowerCase().includes(searchTheme.toLowerCase())
        )
      }))
      .filter(category => category.themes.length > 0);
  }, [searchTheme, themeCategories]);

  // Fonction pour plier/déplier les catégories
  const toggleCategory = (categoryName: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryName)) {
      newCollapsed.delete(categoryName);
    } else {
      newCollapsed.add(categoryName);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Fonction de raccourci pour sélectionner des thèmes populaires
  const selectQuickTheme = (themeValue: string) => {
    setSelectedTheme(themeValue);
    setSearchTheme(""); // Clear search when a theme is selected
  };

  // Thèmes populaires pour accès rapide
  const popularThemes = [
    { value: "conte-de-fees", label: "✨ Conte de Fées" },
    { value: "aventure", label: "🗺️ Aventure" },
    { value: "pirate", label: "🏴‍☠️ Pirates" },
    { value: "princesse", label: "👑 Princesse" },
    { value: "dinosaures", label: "🦕 Dinosaures" },
    { value: "ocean", label: "🌊 Océan" }
  ];

  // Tons narratifs populaires pour accès rapide
  const popularTones = [
    { value: "doux", label: "🌸 Doux" },
    { value: "aventure", label: "⚔️ Aventure" },
    { value: "drole", label: "😄 Drôle" },
    { value: "educatif", label: "📚 Éducatif" },
    { value: "mysterieux", label: "🔍 Mystérieux" },
    { value: "heroique", label: "🦸‍♂️ Héroïque" }
  ];

  // Mode hors ligne - permettre l'utilisation sans authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        setAuthLoading(false);
        
        // Ne plus afficher de toast d'erreur - mode hors ligne autorisé
      } catch (error) {
        console.log('Mode hors ligne - authentification non disponible');
        setIsAuthenticated(false);
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Remove the refresh subscription on mount to prevent infinite loops
  // The subscription status is already managed by the useSubscription hook

  // Auto-génération après login si pendingStory existe
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('autocreate') === '1') {
      const pending = sessionStorage.getItem('pendingStory');
      if (pending) {
        try {
          const data = JSON.parse(pending);
          setChildName(data.childName || "");
          setChildAge(data.childAge || "");
          setSelectedTheme(data.selectedTheme || "");
          setNarrativeTone(data.narrativeTone || "");
          setCustomDetails(data.customDetails || "");
          // Déclencher la génération automatiquement
          setTimeout(() => {
            const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
            handleSubmit(fakeEvent);
            sessionStorage.removeItem('pendingStory');
          }, 300);
        } catch {}
      }
    }
  }, [location.search]);

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

    // Si l'utilisateur n'est pas connecté, rediriger vers /auth
    if (!isAuthenticated) {
      // Sauvegarder le contexte du formulaire
      sessionStorage.setItem('pendingStory', JSON.stringify({
        childName,
        childAge,
        selectedTheme,
        narrativeTone,
        customDetails
      }));
      navigate("/auth");
      return;
    }

    // Vérifier les limites seulement si connecté
    if (!checkStoryLimit()) {
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      // Générer l'illustration si besoin (optionnel)
      let illustrationUrl = null;
      if (storyData.illustration_url) {
        illustrationUrl = storyData.illustration_url;
      }
      // Générer l'audio et uploader (optionnel, ou laisser la page de lecture le faire)
      // Enregistrer l'histoire en base (toujours, même en mode invité)
      const storyId = uuidv4();
      const { error: insertError } = await supabase
        .from("stories")
        .insert({
          id: storyId,
          user_id: user.id,
          title: storyData.title || `L'aventure de ${childName}`,
          theme: selectedTheme,
          child_name: childName,
          child_age: parseInt(childAge),
          story_content: storyData.story,
          illustration_url: illustrationUrl,
          audio_url: null, // sera généré à la lecture si besoin
          is_public: false,
          created_at: new Date().toISOString(),
        });
      if (insertError) throw insertError;
      await refreshUsage();
      toast({
        title: "Histoire créée!",
        description: "Votre histoire magique a été générée et sauvegardée.",
      });
      // Reset form
      setChildName("");
      setChildAge("");
      setSelectedTheme("");
      setNarrativeTone("");
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

  // Callback après connexion réussie
  const handleAuthSuccess = () => {
    setShowAuthSheet(false);
    if (pendingStory) {
      // Relancer la génération avec le contexte sauvegardé
      setTimeout(() => {
        // Remettre les valeurs dans le formulaire si besoin
        setChildName(pendingStory.childName);
        setChildAge(pendingStory.childAge);
        setSelectedTheme(pendingStory.selectedTheme);
        setNarrativeTone(pendingStory.narrativeTone);
        setCustomDetails(pendingStory.customDetails);
        // Appeler handleSubmit à nouveau
        handleSubmit(new Event('submit') as any);
        setPendingStory(null);
      }, 100);
    }
  };

  // Callback accès invité
  const handleGuestAccess = () => {
    setShowAuthSheet(false);
    navigate("/dashboard");
  };

  // Affichage pendant le chargement de l'authentification
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Affichage pendant le chargement des thèmes
  if (themesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des thèmes...</p>
        </div>
      </div>
    );
  }

  // Mode hors ligne autorisé - ne plus bloquer l'accès

  return (
    <>
      {/* Indicateur de mode de connexion */}
      <div className="flex justify-center">
        <Badge 
          variant={isAuthenticated ? "default" : "outline"} 
          className={`flex items-center gap-2 ${isAuthenticated ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200"}`}
        >
          <div className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-orange-500"}`} />
          {isAuthenticated ? "Mode connecté" : "Mode hors ligne"}
        </Badge>
      </div>

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
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Thème de l'histoire *</Label>
          {selectedTheme && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Thème sélectionné
            </Badge>
          )}
        </div>

        {/* Thèmes populaires - Accès rapide */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="text-lg">⭐</span>
            Thèmes populaires
          </div>
          <div className="flex flex-wrap gap-2">
            {popularThemes.map((theme) => (
              <Button
                key={theme.value}
                type="button"
                variant={selectedTheme === theme.value ? "default" : "outline"}
                size="sm"
                onClick={() => selectQuickTheme(theme.value)}
                className="h-8 text-xs"
              >
                {theme.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un thème (ex: pirate, fée, dinosaure...)"
              value={searchTheme}
              onChange={(e) => setSearchTheme(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTheme && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchTheme("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          {searchTheme && (
            <p className="text-xs text-muted-foreground">
              {filteredCategories.reduce((total, cat) => total + cat.themes.length, 0)} thème(s) trouvé(s)
            </p>
          )}
        </div>
        
        {/* Catégories de thèmes */}
        {filteredCategories.map((category) => (
          <div key={category.name} className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
              onClick={() => toggleCategory(category.name)}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="text-lg">{category.icon}</span>
                {category.name}
                <Badge variant="outline" className="text-xs">
                  {category.themes.length}
                </Badge>
              </div>
              {collapsedCategories.has(category.name) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            
            {!collapsedCategories.has(category.name) && (
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
            )}
          </div>
        ))}

        {filteredCategories.length === 0 && searchTheme && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun thème trouvé pour "{searchTheme}"</p>
            <Button
              type="button"
              variant="link"
              onClick={() => setSearchTheme("")}
              className="mt-2"
            >
              Effacer la recherche
            </Button>
          </div>
        )}
      </div>

      {/* Narrative Tone Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Ton narratif (optionnel)</Label>
          {narrativeTone && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Ton sélectionné
            </Badge>
          )}
        </div>

        {/* Tous les tons narratifs en format compact */}
        <div className="space-y-3">
          <div 
            className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
            onClick={() => setToneSectionCollapsed(!toneSectionCollapsed)}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-lg">🎭</span>
              Tons narratifs
              <Badge variant="outline" className="text-xs">
                {narrativeTones.length}
              </Badge>
            </div>
            {toneSectionCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          
          {!toneSectionCollapsed && (
            <div className="flex flex-wrap gap-2">
              {narrativeTones.map((tone) => (
                <Button
                  key={tone.value}
                  type="button"
                  variant={narrativeTone === tone.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNarrativeTone(narrativeTone === tone.value ? "" : tone.value)}
                  className="h-8 text-xs"
                >
                  {tone.label}
                </Button>
              ))}
            </div>
          )}
        </div>
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

    {/* Animation de génération d'histoire */}
    <StoryGenerationAnimation 
      childName={childName}
      theme={selectedTheme}
      isVisible={loading}
    />
    {/* Drawer d'authentification */}
    {/* <AuthSheet
      open={showAuthSheet}
      onOpenChange={setShowAuthSheet}
      onAuthSuccess={handleAuthSuccess}
    /> */}
    </>
  );
}
