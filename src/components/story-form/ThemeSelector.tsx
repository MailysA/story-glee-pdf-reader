import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, ChevronDown, ChevronUp, Star } from "lucide-react";

interface ThemeSelectorProps {
  themeCategories: any[];
  searchTheme: string;
  setSearchTheme: (v: string) => void;
  selectedTheme: string;
  setSelectedTheme: (v: string) => void;
  collapsedCategories: Set<string>;
  toggleCategory: (name: string) => void;
  filteredCategories: any[];
  selectQuickTheme: (v: string) => void;
  popularThemes: { value: string; label: string }[];
}

export function ThemeSelector({
  themeCategories,
  searchTheme,
  setSearchTheme,
  selectedTheme,
  setSelectedTheme,
  collapsedCategories,
  toggleCategory,
  filteredCategories,
  selectQuickTheme,
  popularThemes,
}: ThemeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium">Thème de l'histoire *</span>
        {selectedTheme && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            Thème sélectionné
          </Badge>
        )}
      </div>
      {/* Thèmes populaires */}
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
              {category.themes.map((theme: any) => (
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
  );
} 