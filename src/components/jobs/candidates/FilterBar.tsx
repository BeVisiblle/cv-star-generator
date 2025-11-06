import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useState } from "react";

interface FilterBarProps {
  onCityChange?: (city: string) => void;
  onSkillsChange?: (skills: string[]) => void;
  onSearchChange?: (search: string) => void;
  availableSkills?: string[];
}

export function FilterBar({
  onCityChange,
  onSkillsChange,
  onSearchChange,
  availableSkills = []
}: FilterBarProps) {
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleCityChange = (value: string) => {
    setCity(value);
    onCityChange?.(value);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills);
    onSkillsChange?.(skills);
  };

  const skillOptions = availableSkills.map(skill => ({
    value: skill,
    label: skill
  }));

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      {/* Search Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Name oder Email suchen..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* City Filter */}
      <Input
        placeholder="Stadt/PLZ filtern..."
        value={city}
        onChange={(e) => handleCityChange(e.target.value)}
      />

      {/* Skills Filter */}
      <MultiSelect
        options={skillOptions}
        selected={selectedSkills}
        onChange={handleSkillsChange}
        placeholder="Skills filtern..."
      />
    </div>
  );
}
