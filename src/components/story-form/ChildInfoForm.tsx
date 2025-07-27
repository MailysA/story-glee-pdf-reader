import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChildInfoFormProps {
  childName: string;
  setChildName: (v: string) => void;
  childAge: string;
  setChildAge: (v: string) => void;
}

export function ChildInfoForm({ childName, setChildName, childAge, setChildAge }: ChildInfoFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="childName" className="text-base font-medium">
          Prénom de l'enfant *
        </Label>
        <Input
          id="childName"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="Emma, Lucas, Chloé..."
          className="text-base"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="childAge" className="text-base font-medium">
          Âge de l'enfant *
        </Label>
        <Select value={childAge} onValueChange={setChildAge} required>
          <SelectTrigger>
            <SelectValue placeholder="Choisir l'âge" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => i + 3).map((age) => (
              <SelectItem key={age} value={age.toString()}>
                {age} ans
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 