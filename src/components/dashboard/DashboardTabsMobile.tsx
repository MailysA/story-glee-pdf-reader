import { Button } from "@/components/ui/button";
import { Plus, Library } from "lucide-react";

interface DashboardTabsMobileProps {
  activeTab: "create" | "library";
  onTabChange: (tab: "create" | "library") => void;
}

export function DashboardTabsMobile({ activeTab, onTabChange }: DashboardTabsMobileProps) {
  return (
    <div className="flex sm:hidden bg-muted rounded-lg p-1">
      <Button
        variant={activeTab === "create" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("create")}
        className="px-2"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Button
        variant={activeTab === "library" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("library")}
        className="px-2"
      >
        <Library className="w-4 h-4" />
      </Button>
    </div>
  );
} 