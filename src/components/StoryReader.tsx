import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2, VolumeOff, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { cn } from "@/lib/utils";

interface StoryPage {
  id: number;
  text: string;
  illustration?: string;
  audioUrl?: string;
}

interface StoryReaderProps {
  story: {
    id: string;
    title: string;
    content: string;
    illustration_url?: string;
    audio_url?: string;
  };
}

export const StoryReader = ({ story }: StoryReaderProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [pages, setPages] = useState<StoryPage[]>([]);

  useEffect(() => {
    // Diviser l'histoire en pages (environ 100-150 mots par page)
    const sentences = story.content.split(/[.!?]+/).filter(s => s.trim());
    const wordsPerPage = 25; // Pour les enfants, moins de mots par page
    const storyPages: StoryPage[] = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
      const pageText = sentences.slice(i, i + 2).join('. ') + '.';
      storyPages.push({
        id: i / 2,
        text: pageText.trim(),
        illustration: story.illustration_url,
      });
    }

    setPages(storyPages);
  }, [story]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    setIsFlipping(true);
    
    setTimeout(() => {
      if (direction === 'next' && currentPage < pages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
      setIsFlipping(false);
    }, 300);
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
          
          {/* Book Spine Effect */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent"></div>
          
          {/* Current Page */}
          <div className={cn(
            "p-8 h-full min-h-[600px] flex flex-col transition-all duration-500",
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
                <p className="text-lg leading-relaxed text-foreground font-medium">
                  {pages[currentPage]?.text}
                </p>
              </div>

              {/* Illustration Side */}
              <div className="flex items-center justify-center">
                {pages[currentPage]?.illustration ? (
                  <img 
                    src={pages[currentPage].illustration} 
                    alt={`Illustration page ${currentPage + 1}`}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      // En cas d'erreur de chargement, afficher l'image par défaut
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center ${
                  pages[currentPage]?.illustration ? 'hidden' : ''
                }`}>
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </div>
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

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(pages.length, 5) }, (_, i) => {
                  const pageIndex = Math.max(0, currentPage - 2 + i);
                  if (pageIndex >= pages.length) return null;
                  
                  return (
                    <button
                      key={pageIndex}
                      onClick={() => setCurrentPage(pageIndex)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all",
                        pageIndex === currentPage 
                          ? "bg-primary scale-125" 
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  );
                })}
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