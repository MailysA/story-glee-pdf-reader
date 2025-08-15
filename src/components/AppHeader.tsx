import { Sparkles, Home, BookOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "hero";
  children?: React.ReactNode;
}

export function AppHeader({ 
  title = "Histoires magiques", 
  subtitle, 
  showNavigation = true,
  className,
  variant = "default",
  children 
}: AppHeaderProps) {
  const navigate = useNavigate();

  const headerVariants = {
    default: "bg-white/95 backdrop-blur-sm border-b shadow-lg",
    minimal: "bg-transparent",
    hero: "bg-transparent text-center py-12"
  };

  const titleVariants = {
    default: "text-xl md:text-2xl font-bold text-foreground",
    minimal: "text-lg font-semibold text-foreground",
    hero: "text-4xl md:text-6xl font-bold text-foreground mb-6"
  };

  if (variant === "hero") {
    return (
      <div className={cn("container mx-auto px-4", className)}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-primary animate-pulse" />
          <h1 className={titleVariants.hero}>{title}</h1>
          <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-primary animate-pulse" />
        </div>
        {subtitle && (
          <p className="text-lg md:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    );
  }

  return (
    <header className={cn(headerVariants[variant], className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className={titleVariants[variant]}>{title}</h1>
          </div>
          
          {showNavigation && (
            <nav className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hidden md:flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/library")}
                className="hidden md:flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Bibliothèque
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hidden md:flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Créer
              </Button>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </nav>
          )}
          
          {children}
        </div>
        
        {subtitle && variant === "default" && (
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>
    </header>
  );
}