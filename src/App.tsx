import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EmailConfirmation from "./pages/EmailConfirmation";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Contenu principal + footer */}
        <div className="min-h-screen flex flex-col relative" style={{background: "var(--gradient-rainbow)"}}>
          {/* Éléments magiques animés */}
          <div className="magical-elements">
            <div className="rainbow-element">🌈</div>
            <div className="rainbow-element">⭐</div>
            <div className="rainbow-element">🌙</div>
            <div className="dinosaur-element">🦕</div>
            <div className="dinosaur-element">🦖</div>
            <div className="fairy-element">🧚‍♀️</div>
            <div className="fairy-element">✨</div>
            <div className="fairy-element">🦋</div>
          </div>
          <div className="flex-1 relative z-10">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/legal" element={<Legal />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <footer className="w-full text-center py-4 text-xs text-muted-foreground bg-background/80 border-t">
            <a href="/legal" className="underline hover:text-primary">Mentions légales & confidentialité</a>
          </footer>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
