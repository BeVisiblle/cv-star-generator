import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSkills } from '@/hooks/useSkills';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface SkillSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  branch?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const SkillSelector = ({
  selectedSkills,
  onSkillsChange,
  branch,
  label = 'Fähigkeiten',
  placeholder = 'Fähigkeit auswählen...',
  className = ''
}: SkillSelectorProps) => {
  const { skills, loading, error } = useSkills(branch);
  const [customSkill, setCustomSkill] = useState('');

  const addSkill = (skillName: string) => {
    if (!skillName.trim()) return;
    if (!selectedSkills.includes(skillName.trim())) {
      onSkillsChange([...selectedSkills, skillName.trim()]);
    }
  };

  const removeSkill = (index: number) => {
    onSkillsChange(selectedSkills.filter((_, i) => i !== index));
  };

  const addCustomSkill = () => {
    addSkill(customSkill);
    setCustomSkill('');
  };

  if (loading) {
    return (
      <div className={className}>
        <Label>{label}</Label>
        <div className="flex items-center justify-center h-10 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Label>{label}</Label>
      
      <div className="space-y-4">
        {/* Predefined Skills Dropdown */}
        {!error && skills.length > 0 && (
          <Select onValueChange={(value) => addSkill(value)}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {skills
                .filter(skill => !selectedSkills.includes(skill.name))
                .map((skill) => (
                  <SelectItem key={skill.id} value={skill.name}>
                    {skill.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        {/* Custom Skill Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Eigene Fähigkeit eingeben..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomSkill();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustomSkill}
            disabled={!customSkill.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill, index) => (
              <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {skill}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => removeSkill(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm p-4 bg-muted/20 rounded">
            Wähle Fähigkeiten aus der Liste oder gib eigene ein.
          </p>
        )}
      </div>
    </div>
  );
};