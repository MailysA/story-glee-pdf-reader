import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2, VolumeOff, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { SandmanAnimation } from "./SandmanAnimation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Fonction utilitaire pour créer un hash simple du contenu
const createContentHash = (content: string) => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

interface StoryPage {
  id: number;
  text: string;
  audioUrl?: string;
}

interface StoryReaderProps {
  story: {
    id: string;
    title: string;
    content: string;
    theme: string;
    audio_url?: string;
    illustration_url?: string;
  };
}

export const StoryReader = ({ story }: StoryReaderProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [loadingIllustrations, setLoadingIllustrations] = useState<{[key: number]: boolean}>({});
  const [showSandAnimation, setShowSandAnimation] = useState(false);

  // Video mapping based on theme
  const getThemeVideo = (theme: string) => {
    const videoMap: { [key: string]: string } = {
      "conte-de-fees": "/videos/farytail.mp4",
      "princesse": "/videos/princess.mp4",
      "sorciere": "/videos/witch.mp4",
      "fantome": "/videos/ghost.mp4",
      "aventure": "/videos/adventure1.mp4",
      "aventure-jungle": "/videos/adventure2.mp4",
      "pirate": "/videos/pirate.mp4",
      "alien": "/videos/alien.mp4",
      "foret": "/videos/forest1.mp4",
      "foret-enchantee": "/videos/magic-forest.mp4",
      "ocean": "/videos/ocean.mp4",
      "banquise": "/videos/banquise.mp4",
      "environnement": "/videos/environment.mp4",
      "egypte": "/videos/egypte.mp4",
      "moyen-age": "/videos/moyen-age.mp4",
      "renaissance": "/videos/renaissance.mp4",
      "revolution": "/videos/revolution.mp4",
      "dinosaures": "/videos/dinosaures.mp4",
      "robots": "/videos/robots.mp4",
      "industriel": "/videos/industriel.mp4",
      "alphabet": "/videos/alphabet.mp4",
      "nombres": "/videos/numbers.mp4",
      "logique": "/videos/logic.mp4",
      "emotions": "/videos/emotions.mp4",
      "respect": "/videos/respect.mp4",
      "bonnes-manieres": "/videos/goodmaners.mp4",
      "recyclage": "/videos/recycling.mp4",
      "cirque": "/videos/circus.mp4",
      "bonbons": "/videos/candys.mp4",
      "maison-magique": "/videos/magic-house.mp4"
    };
    return videoMap[theme] || "/videos/book.mp4"; // fallback video
  };

  useEffect(() => {
    // Diviser l'histoire en pages (environ 100-150 mots par page)
    const sentences = story.content.split(/[.!?]+/).filter(s => s.trim());
    const storyPages: StoryPage[] = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
      const pageText = sentences.slice(i, i + 2).join('. ') + '.';
      const pageId = i / 2;
      storyPages.push({
        id: pageId,
        text: pageText.trim(),
      });
    }

    setPages(storyPages);
  }, [story]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    setIsFlipping(true);
    setShowSandAnimation(true);
    
    setTimeout(() => {
      if (direction === 'next' && currentPage < pages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
      setIsFlipping(false);
    }, 300);

    setTimeout(() => {
      setShowSandAnimation(false);
    }, 1500);
  };

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Préparation de l'histoire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Book Container */}
      <div className="relative">
        {/* Book Cover/Pages */}
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden" 
             style={{
               background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)))",
               minHeight: "600px"
             }}>
          
          {/* Sandman Animation Overlay */}
          <SandmanAnimation 
            isActive={showSandAnimation || isFlipping}
            direction={isFlipping ? (currentPage > 0 ? 'right' : 'left') : 'none'}
            className="absolute inset-0 z-10"
          >
            {/* Current Page Content */}
            <div className={cn(
              "relative z-20 p-8 h-full min-h-[600px] flex flex-col transition-all duration-500",
              isFlipping && "scale-95 opacity-50"
            )}>
              
              {/* Page Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-muted-foreground">
                  {story.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1} / {pages.length}
                </div>
              </div>

              {/* Page Content */}
              <div className="flex-1 grid md:grid-cols-2 gap-8 items-center">
                
                {/* Text Side */}
                <div className="space-y-4">
                  {/* Titre sur la première page */}
                  {currentPage === 0 && (
                    <h1 className="text-2xl font-bold text-center text-primary mb-6">
                      {story.title}
                    </h1>
                  )}
                  <p className="text-lg leading-relaxed text-foreground font-medium">
                    {pages[currentPage]?.text}
                  </p>
                </div>

                {/* Illustration Side (affichée sur toutes les pages) */}
                <div className="flex items-center justify-center">
                  {story.illustration_url ? (
                    <img
                      src={story.illustration_url}
                      alt="Illustration de l'histoire"
                      className="max-w-full h-auto rounded-lg shadow-lg max-h-80 object-contain"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">Pas d'illustration</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Page Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 0 || isFlipping}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Page précédente
                </Button>

                {/* Pagination adaptative */}
                <div className="flex items-center gap-2">
                  {pages.length <= 10 ? (
                    // Points ronds pour les livres courts
                    pages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={cn(
                          "w-3 h-3 rounded-full transition-all",
                          index === currentPage 
                            ? "bg-primary scale-125" 
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                      />
                    ))
                  ) : (
                    // Pagination numérotée pour les livres longs
                    <div className="flex items-center gap-1">
                      {/* Première page */}
                      {currentPage > 2 && (
                        <>
                          <button
                            onClick={() => setCurrentPage(0)}
                            className={cn(
                              "px-3 py-1 rounded-md text-sm font-medium transition-all",
                              "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                          >
                            1
                          </button>
                          {currentPage > 3 && (
                            <span className="text-muted-foreground px-1">...</span>
                          )}
                        </>
                      )}
                      
                      {/* Pages autour de la page courante */}
                      {Array.from({ length: Math.min(5, pages.length) }, (_, i) => {
                        const start = Math.max(0, Math.min(currentPage - 2, pages.length - 5));
                        const pageIndex = start + i;
                        
                        if (pageIndex >= pages.length) return null;
                        
                        return (
                          <button
                            key={pageIndex}
                            onClick={() => setCurrentPage(pageIndex)}
                            className={cn(
                              "px-3 py-1 rounded-md text-sm font-medium transition-all",
                              pageIndex === currentPage 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {pageIndex + 1}
                          </button>
                        );
                      })}
                      
                      {/* Dernière page */}
                      {currentPage < pages.length - 3 && (
                        <>
                          {currentPage < pages.length - 4 && (
                            <span className="text-muted-foreground px-1">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(pages.length - 1)}
                            className={cn(
                              "px-3 py-1 rounded-md text-sm font-medium transition-all",
                              "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                          >
                            {pages.length}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage === pages.length - 1 || isFlipping}
                  className="flex items-center gap-2"
                >
                  Page suivante
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SandmanAnimation>

          {/* Page Flip Animation Overlay */}
          {isFlipping && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="animate-spin">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Audio Player */}
        <div className="mt-6">
          <AudioPlayer story={story} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
};