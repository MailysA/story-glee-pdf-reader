import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndexPage from "./pages/IndexPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import PublicLibraryPage from "./pages/PublicLibraryPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFoundPage from "./pages/NotFoundPage";
import LegalPage from "./pages/LegalPage";
import CguPageStandalone from "./pages/CguPageStandalone";
import PublicStoryPage from "./pages/PublicStoryPage";
import PrivateStoryPage from "./pages/PrivateStoryPage";
import { Paywall as PaywallPage } from "./pages/PaywallPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Contenu principal + footer */}
        <div className="min-h-screen flex flex-col relative px-safe pb-safe" style={{background: "var(--gradient-rainbow)"}}>
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
              <Route path="/" element={<IndexPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/library" element={<PublicLibraryPage />} />
              <Route path="/library/:id" element={<PublicStoryPage />} />
              <Route path="/dashboard/library/:id" element={<PrivateStoryPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/paywall" element={<PaywallPage />} />
              <Route path="/cgu" element={<CguPageStandalone />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
