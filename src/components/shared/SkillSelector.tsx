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
  statusLevel?: string;
  maxSkills?: number;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const SkillSelector = ({
  selectedSkills,
  onSkillsChange,
  branch,
  statusLevel,
  maxSkills = 5,
  label = 'Fähigkeiten',
  placeholder = 'Fähigkeit auswählen...',
  className = ''
}: SkillSelectorProps) => {
  const { skills, loading, error } = useSkills(branch, statusLevel);
  const [customSkill, setCustomSkill] = useState('');

  const addSkill = (skillName: string) => {
    if (!skillName.trim()) return;
    if (selectedSkills.length >= maxSkills) return;
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
      <div className="flex justify-between items-center mb-2">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">
          {selectedSkills.length}/{maxSkills} ausgewählt
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Predefined Skills Dropdown */}
        {!error && skills.length > 0 && (
          <Select onValueChange={(value) => addSkill(value)} disabled={selectedSkills.length >= maxSkills}>
            <SelectTrigger>
              <SelectValue placeholder={selectedSkills.length >= maxSkills ? "Maximum erreicht" : placeholder} />
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
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Eigene Fähigkeit eingeben..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            disabled={selectedSkills.length >= maxSkills}
            className="flex-1 text-sm md:text-base"
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
            disabled={!customSkill.trim() || selectedSkills.length >= maxSkills}
            className="w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Hinzufügen</span>
          </Button>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill, index) => (
              <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-2 rounded-full text-xs md:text-sm">
                <span className="max-w-[120px] md:max-w-none truncate">{skill}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 min-w-[16px]"
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