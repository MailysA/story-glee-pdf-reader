import { useState, useEffect } from "react";
import { Feather, Sparkles, Star, Heart, Book } from "lucide-react";

interface StoryGenerationAnimationProps {
  childName: string;
  theme: string;
  isVisible: boolean;
}

const getThemeEmoji = (theme: string) => {
  const themeEmojiMap: { [key: string]: string } = {
    "conte-de-fees": "✨",
    "princesse": "👑",
    "sorciere": "🧙‍♀️",
    "fantome": "👻",
    "aventure": "🗺️",
    "aventure-jungle": "🌿",
    "pirate": "🏴‍☠️",
    "alien": "👽",
    "foret": "🌲",
    "foret-enchantee": "🧚‍♀️",
    "ocean": "🌊",
    "banquise": "🐧",
    "environnement": "🌍",
    "egypte": "🏺",
    "moyen-age": "🏰",
    "renaissance": "🎨",
    "revolution": "⚔️",
    "dinosaures": "🦕",
    "robots": "🤖",
    "industriel": "🏭",
    "alphabet": "🔤",
    "nombres": "🔢",
    "logique": "🧩",
    "emotions": "❤️",
    "respect": "🤝",
    "bonnes-manieres": "🎩",
    "recyclage": "♻️",
    "cirque": "🎪",
    "bonbons": "🍭",
    "maison-magique": "🏠"
  };
  return themeEmojiMap[theme] || "📚";
};

const getThemeLabel = (theme: string) => {
  const themeLabelMap: { [key: string]: string } = {
    "conte-de-fees": "conte de fées",
    "princesse": "aventure de princesse",
    "sorciere": "histoire de sorcière",
    "fantome": "mystère fantomatique",
    "aventure": "grande aventure",
    "aventure-jungle": "expédition dans la jungle",
    "pirate": "chasse au trésor",
    "alien": "rencontre extraterrestre",
    "foret": "aventure forestière",
    "foret-enchantee": "voyage en forêt enchantée",
    "ocean": "exploration sous-marine",
    "banquise": "aventure polaire",
    "environnement": "mission écologique",
    "egypte": "voyage en Égypte antique",
    "moyen-age": "quête médiévale",
    "renaissance": "découverte artistique",
    "revolution": "épopée révolutionnaire",
    "dinosaures": "rencontre avec les dinosaures",
    "robots": "aventure robotique",
    "industriel": "découverte industrielle",
    "alphabet": "apprentissage des lettres",
    "nombres": "aventure mathématique",
    "logique": "énigme à résoudre",
    "emotions": "voyage émotionnel",
    "respect": "leçon de respect",
    "bonnes-manieres": "cours de politesse",
    "recyclage": "mission de recyclage",
    "cirque": "spectacle de cirque",
    "bonbons": "aventure sucrée",
    "maison-magique": "mystère domestique"
  };
  return themeLabelMap[theme] || "histoire magique";
};

export const StoryGenerationAnimation = ({ childName, theme, isVisible }: StoryGenerationAnimationProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showWriting, setShowWriting] = useState(false);
  const [writtenText, setWrittenText] = useState("");

  const themeEmoji = getThemeEmoji(theme);
  const themeLabel = getThemeLabel(theme);

  const teasingMessages = [
    `${childName} se prépare pour ${themeLabel} ${themeEmoji}`,
    `L'intelligence artificielle imagine l'aventure de ${childName}...`,
    `${themeEmoji} Création d'un monde magique pour ${childName}`,
    `Les personnages prennent vie dans l'histoire de ${childName}`,
    `${childName} va bientôt découvrir ${themeLabel} ${themeEmoji}`,
    `Dernières touches magiques à l'histoire de ${childName}...`
  ];

  useEffect(() => {
    if (!isVisible) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % teasingMessages.length);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, [isVisible, teasingMessages.length]);

  useEffect(() => {
    if (!isVisible) return;

    let timeoutId: NodeJS.Timeout;
    
    const typeMessage = () => {
      setShowWriting(true);
      setWrittenText("");
      const currentMessage = teasingMessages[currentMessageIndex];
      
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < currentMessage.length) {
          setWrittenText(currentMessage.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          timeoutId = setTimeout(() => {
            setShowWriting(false);
          }, 1500);
        }
      }, 80);
    };

    typeMessage();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentMessageIndex, isVisible, teasingMessages]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        {/* Titre principal */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-4xl font-bold text-foreground">
              Création de votre histoire magique
            </h2>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground">
            Laissez la magie opérer...
          </p>
        </div>

        {/* Animation du livre et de la plume */}
        <div className="relative">
          {/* Livre ouvert */}
          <div className="relative mx-auto w-80 h-60 perspective-1000">
            <div className="book-container">
              {/* Page gauche */}
              <div className="book-page book-page-left bg-white border-r-2 border-muted">
                <div className="p-6 text-sm text-muted-foreground leading-relaxed">
                  <div className="space-y-2">
                    <div className="h-2 bg-primary/20 rounded animate-pulse"></div>
                    <div className="h-2 bg-primary/15 rounded animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                    <div className="h-2 bg-primary/10 rounded animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-2 bg-primary/20 rounded animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                    <div className="h-2 bg-primary/15 rounded animate-pulse w-3/4" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
              
              {/* Page droite avec le texte qui s'écrit */}
              <div className="book-page book-page-right bg-white">
                <div className="p-6 text-sm text-foreground leading-relaxed">
                  <div className="min-h-[120px] flex items-center justify-center">
                    {showWriting && (
                      <p className="text-center font-medium text-lg">
                        {writtenText}
                        <span className="animate-pulse">|</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Plume magique */}
            <div className="absolute -top-4 right-12 writing-feather">
              <Feather className="w-8 h-8 text-primary transform rotate-45 animate-bounce" />
              <div className="feather-trail absolute top-6 left-4">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* Particules magiques */}
            <div className="absolute inset-0 pointer-events-none">
              <Star className="absolute top-4 left-8 w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: "0s" }} />
              <Heart className="absolute top-12 right-4 w-3 h-3 text-pink-400 animate-pulse" style={{ animationDelay: "1s" }} />
              <Sparkles className="absolute bottom-8 left-12 w-5 h-5 text-purple-400 animate-pulse" style={{ animationDelay: "2s" }} />
              <Star className="absolute bottom-4 right-8 w-3 h-3 text-blue-400 animate-pulse" style={{ animationDelay: "1.5s" }} />
            </div>
          </div>
        </div>

        {/* Barre de progression animée */}
        <div className="space-y-4">
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary-glow animate-pulse progress-bar"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            ✨ L'IA tisse votre histoire personnalisée...
          </p>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .book-container {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: bookFloat 4s ease-in-out infinite;
        }
        
        .book-page {
          position: absolute;
          width: 50%;
          height: 100%;
          border: 2px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .book-page-left {
          left: 0;
          transform: rotateY(-5deg);
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .book-page-right {
          right: 0;
          transform: rotateY(5deg);
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        
        .writing-feather {
          animation: writing 2s ease-in-out infinite;
        }
        
        .progress-bar {
          animation: progressFill 3s ease-in-out infinite;
        }
        
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-10px) rotateX(2deg); }
        }
        
        @keyframes writing {
          0%, 100% { transform: translateX(0px) translateY(0px) rotate(45deg); }
          25% { transform: translateX(-5px) translateY(2px) rotate(40deg); }
          50% { transform: translateX(0px) translateY(-2px) rotate(45deg); }
          75% { transform: translateX(5px) translateY(2px) rotate(50deg); }
        }
        
        @keyframes progressFill {
          0% { width: 0%; }
          50% { width: 60%; }
          100% { width: 85%; }
        }
      `}</style>
    </div>
  );
};