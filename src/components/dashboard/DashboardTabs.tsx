import { Button } from "@/components/ui/button";
import { Plus, Library } from "lucide-react";

interface DashboardTabsProps {
  activeTab: "create" | "library";
  onTabChange: (tab: "create" | "library") => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="hidden sm:flex bg-muted rounded-lg p-1">
      <Button
        variant={activeTab === "create" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("create")}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden md:inline">Créer</span>
      </Button>
      <Button
        variant={activeTab === "library" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("library")}
        className="flex items-center gap-2"
      >
        <Library className="w-4 h-4" />
        <span className="hidden md:inline">Bibliothèque</span>
      </Button>
    </div>
  );
} 