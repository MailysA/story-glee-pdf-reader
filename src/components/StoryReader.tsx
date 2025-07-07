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
  const [loadingIllustrations, setLoadingIllustrations] = useState<{[key: number]: boolean}>({});
  const [showSandAnimation, setShowSandAnimation] = useState(false);

  const loadCoverIllustration = async (storyPages: StoryPage[]) => {
    try {
      // Vérifier s'il existe déjà une illustration de couverture (page 0)
      const { data: existingCover, error } = await supabase
        .from('story_page_illustrations')
        .select('illustration_url, page_content_hash')
        .eq('story_id', story.id)
        .eq('page_number', 0)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const titleHash = createContentHash(story.title);
      
      // Si l'illustration de couverture existe et correspond au titre actuel
      if (existingCover && existingCover.page_content_hash === titleHash) {
        const updatedPages = storyPages.map(page => 
          page.id === 0 ? { ...page, illustration: existingCover.illustration_url } : page
        );
        setPages(updatedPages);
      } else {
        // Initialiser les pages sans illustrations
        setPages(storyPages);
        // Générer uniquement l'illustration de couverture
        generateCoverIllustration();
      }
    } catch (error) {
      console.error('Erreur chargement couverture:', error);
      setPages(storyPages);
      generateCoverIllustration();
    }
  };

  const generateCoverIllustration = async () => {
    try {
      setLoadingIllustrations(prev => ({ ...prev, [0]: true }));
      
      const { data, error } = await supabase.functions.invoke('generate-illustration', {
        body: {
          theme: story.title,
          childName: "l'enfant",
          storyTitle: story.title,
          pageContent: `Couverture du livre: "${story.title}". Une belle illustration de couverture avec le titre visible.`
        }
      });

      if (error) throw error;

      // Sauvegarder l'illustration de couverture en base de données
      const titleHash = createContentHash(story.title);
      const { error: saveError } = await supabase
        .from('story_page_illustrations')
        .upsert({
          story_id: story.id,
          page_number: 0,
          page_content_hash: titleHash,
          illustration_url: data.imageUrl
        }, { 
          onConflict: 'story_id,page_number',
          ignoreDuplicates: false 
        });

      if (saveError) {
        console.error('Erreur sauvegarde couverture:', saveError);
      }

      setPages(prevPages => prevPages.map(page => 
        page.id === 0 
          ? { ...page, illustration: data.imageUrl }
          : page
      ));
    } catch (error) {
      console.error('Erreur génération couverture:', error);
    } finally {
      setLoadingIllustrations(prev => ({ ...prev, [0]: false }));
    }
  };

  const generateIllustrationForPage = async (pageText: string, pageId: number) => {
    try {
      setLoadingIllustrations(prev => ({ ...prev, [pageId]: true }));
      
      const { data, error } = await supabase.functions.invoke('generate-illustration', {
        body: {
          theme: story.title,
          childName: "l'enfant",
          storyTitle: story.title,
          pageContent: pageText
        }
      });

      if (error) throw error;

      // Sauvegarder l'illustration en base de données
      const contentHash = createContentHash(pageText);
      const { error: saveError } = await supabase
        .from('story_page_illustrations')
        .upsert({
          story_id: story.id,
          page_number: pageId,
          page_content_hash: contentHash,
          illustration_url: data.imageUrl
        }, { 
          onConflict: 'story_id,page_number',
          ignoreDuplicates: false 
        });

      if (saveError) {
        console.error('Erreur sauvegarde illustration:', saveError);
      }

      setPages(prevPages => prevPages.map(page => 
        page.id === pageId 
          ? { ...page, illustration: data.imageUrl }
          : page
      ));
    } catch (error) {
      console.error('Erreur génération illustration:', error);
    } finally {
      setLoadingIllustrations(prev => ({ ...prev, [pageId]: false }));
    }
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
        illustration: undefined,
      });
    }

    // Charger l'illustration de couverture
    loadCoverIllustration(storyPages);
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
            className="absolute inset-0 z-10 pointer-events-none"
          />
          
          {/* Book Spine Effect */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent"></div>
          
          {/* Current Page */}
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

              {/* Illustration Side - Seulement pour la première page */}
              <div className="flex items-center justify-center">
                {currentPage === 0 ? (
                  loadingIllustrations[0] ? (
                    <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin mb-2">
                          <BookOpen className="w-8 h-8 text-primary mx-auto" />
                        </div>
                        <p className="text-sm text-muted-foreground">Génération de la couverture...</p>
                      </div>
                    </div>
                  ) : pages[0]?.illustration ? (
                    <img 
                      src={pages[0].illustration} 
                      alt={`Couverture de ${story.title}`}
                      className="max-w-full h-auto rounded-lg shadow-lg max-h-80"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )
                ) : (
                  // Espace vide pour les autres pages (pas d'illustration)
                  <div className="w-64 h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Page {currentPage + 1}</p>
                    </div>
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