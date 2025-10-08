import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface Skill {
  name: string;
  level: 'must_have' | 'nice_to_have' | 'trainable';
}

interface SkillSelectorProps {
  value: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillSelector({ value, onChange }: SkillSelectorProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState<Skill['level']>('must_have');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    onChange([...value, { name: newSkill.trim(), level: newLevel }]);
    setNewSkill('');
    setNewLevel('must_have');
  };

  const removeSkill = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const getLevelColor = (level: Skill['level']) => {
    switch (level) {
      case 'must_have': return 'destructive';
      case 'nice_to_have': return 'default';
      case 'trainable': return 'secondary';
    }
  };

  const getLevelLabel = (level: Skill['level']) => {
    switch (level) {
      case 'must_have': return 'Must-Have';
      case 'nice_to_have': return 'Nice-to-Have';
      case 'trainable': return 'Trainable';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Skills & Fähigkeiten</label>
        <p className="text-sm text-muted-foreground">Kategorisiere nach Wichtigkeit</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Skill eingeben..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
        />
        <Select value={newLevel} onValueChange={(v: Skill['level']) => setNewLevel(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="must_have">Must-Have</SelectItem>
            <SelectItem value="nice_to_have">Nice-to-Have</SelectItem>
            <SelectItem value="trainable">Trainable</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" onClick={addSkill} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
          {value.map((skill, index) => (
            <Badge key={index} variant={getLevelColor(skill.level)} className="gap-1">
              {skill.name}
              <span className="text-xs opacity-70">({getLevelLabel(skill.level)})</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}