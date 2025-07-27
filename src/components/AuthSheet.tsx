import * as React from "react";
import { Drawer } from "vaul";
import AuthPage from "@/pages/AuthPage";

interface AuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
}

export function AuthSheet({ open, onOpenChange, onAuthSuccess }: AuthSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="bottom">
      <Drawer.Overlay />
      <Drawer.Content className="max-w-lg mx-auto rounded-t-2xl p-0 bg-background relative" style={{ minHeight: '50vh', height: '50vh' }}>
        {/* Bouton de fermeture (croix) */}
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Fermer la connexion"
          className="absolute top-4 right-4 z-20 text-2xl text-muted-foreground hover:text-primary transition-colors"
        >
          ×
        </button>
        <div className="p-6 pb-2">
          <Drawer.Title className="text-lg font-bold mb-2">Connectez-vous ou créez un compte</Drawer.Title>
        </div>
        <div className="p-6 pt-0">
          <AuthPage onAuthSuccess={onAuthSuccess} />
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
} 