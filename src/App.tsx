import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/DashboardPage";
import PublicLibrary from "./pages/PublicLibrary";
import EmailConfirmation from "./pages/EmailConfirmation";
import ResetPassword from "./pages/ResetPasswordPage";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFoundPage";
import Legal from "./pages/LegalPage";
import { CGUPage } from "./pages/CguPage";
import PublicStoryPage from "./pages/PublicStoryPage";
import PrivateStoryPage from "./pages/PrivateStoryPage";
import { Paywall } from "@/pages/PaywallPage";

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
              <Route path="/library" element={<PublicLibrary />} />
              <Route path="/library/:id" element={<PublicStoryPage />} />
              <Route path="/dashboard/library/:id" element={<PrivateStoryPage />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/paywall" element={<Paywall />} />
              <Route path="/cgu" element={<CGUPage isOpen={true} onClose={() => window.history.back()} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
