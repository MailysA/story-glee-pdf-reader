import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";

interface StoryFormSubmitButtonProps {
  loading: boolean;
}

export function StoryFormSubmitButton({ loading }: StoryFormSubmitButtonProps) {
  return (
    <div className="flex justify-center pt-4">
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
      >
        {loading ? (
          <>
            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
            Création en cours...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5 mr-2" />
            Créer l'Histoire Magique
          </>
        )}
      </Button>
    </div>
  );
} 