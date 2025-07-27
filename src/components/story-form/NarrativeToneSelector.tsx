import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";

interface NarrativeToneSelectorProps {
  narrativeTones: any[];
  narrativeTone: string;
  setNarrativeTone: (v: string) => void;
  toneSectionCollapsed: boolean;
  setToneSectionCollapsed: (v: boolean) => void;
  popularTones: { value: string; label: string }[];
}

export function NarrativeToneSelector({
  narrativeTones,
  narrativeTone,
  setNarrativeTone,
  toneSectionCollapsed,
  setToneSectionCollapsed,
  popularTones,
}: NarrativeToneSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium">Ton narratif (optionnel)</span>
        {narrativeTone && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            Ton sélectionné
          </Badge>
        )}
      </div>
      <div className="space-y-3">
        <div
          className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
          onClick={() => setToneSectionCollapsed(!toneSectionCollapsed)}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="text-lg">🎭</span>
            Tons narratifs
            <Badge variant="outline" className="text-xs">
              {narrativeTones.length}
            </Badge>
          </div>
          {toneSectionCollapsed ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        {!toneSectionCollapsed && (
          <div className="flex flex-wrap gap-2">
            {narrativeTones.map((tone) => (
              <Button
                key={tone.value}
                type="button"
                variant={narrativeTone === tone.value ? "default" : "outline"}
                size="sm"
                onClick={() => setNarrativeTone(narrativeTone === tone.value ? "" : tone.value)}
                className="h-8 text-xs"
              >
                {tone.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 