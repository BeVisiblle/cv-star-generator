import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface JobFiltersProps {
  selectedJobTypes: string[];
  selectedLocations: string[];
  datePosted: string;
  experience: string;
  salaryRange: [number, number];
  onJobTypeChange: (types: string[]) => void;
  onLocationChange: (locations: string[]) => void;
  onDatePostedChange: (date: string) => void;
  onExperienceChange: (exp: string) => void;
  onSalaryRangeChange: (range: [number, number]) => void;
  onReset: () => void;
}

const JOB_TYPES = [
  { id: 'full_time', label: 'Vollzeit', count: 94 },
  { id: 'part_time', label: 'Teilzeit', count: 289 },
  { id: 'apprenticeship', label: 'Ausbildung', count: 84 },
  { id: 'dual_study', label: 'Duales Studium', count: 42 },
  { id: 'internship', label: 'Praktikum', count: 56 },
];

const LOCATIONS = [
  { id: 'berlin', label: 'Berlin', count: 48 },
  { id: 'munich', label: 'München', count: 296 },
  { id: 'hamburg', label: 'Hamburg', count: 62 },
  { id: 'cologne', label: 'Köln', count: 45 },
];

export function JobFilters({
  selectedJobTypes,
  selectedLocations,
  datePosted,
  experience,
  salaryRange,
  onJobTypeChange,
  onLocationChange,
  onDatePostedChange,
  onExperienceChange,
  onSalaryRangeChange,
  onReset,
}: JobFiltersProps) {
  const toggleJobType = (type: string) => {
    if (selectedJobTypes.includes(type)) {
      onJobTypeChange(selectedJobTypes.filter(t => t !== type));
    } else {
      onJobTypeChange([...selectedJobTypes, type]);
    }
  };

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      onLocationChange(selectedLocations.filter(l => l !== location));
    } else {
      onLocationChange([...selectedLocations, location]);
    }
  };

  const hasActiveFilters = selectedJobTypes.length > 0 || 
    selectedLocations.length > 0 || 
    datePosted !== 'all' || 
    experience !== 'all';

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Filter by</CardTitle>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={['date', 'type', 'location', 'salary', 'experience']}>
          {/* Date Posted */}
          <AccordionItem value="date" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              Date posted
            </AccordionTrigger>
            <AccordionContent>
              <Select value={datePosted} onValueChange={onDatePostedChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="24h">Letzte 24 Stunden</SelectItem>
                  <SelectItem value="7d">Letzte 7 Tage</SelectItem>
                  <SelectItem value="30d">Letzter Monat</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {/* Job Type */}
          <AccordionItem value="type" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              Job type
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {JOB_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={selectedJobTypes.includes(type.id)}
                        onCheckedChange={() => toggleJobType(type.id)}
                      />
                      <Label
                        htmlFor={type.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type.label}
                      </Label>
                    </div>
                    <span className="text-xs text-muted-foreground">{type.count}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Location */}
          <AccordionItem value="location" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              Location
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {LOCATIONS.map((location) => (
                  <div key={location.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={location.id}
                        checked={selectedLocations.includes(location.id)}
                        onCheckedChange={() => toggleLocation(location.id)}
                      />
                      <Label
                        htmlFor={location.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {location.label}
                      </Label>
                    </div>
                    <span className="text-xs text-muted-foreground">{location.count}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Salary Estimates */}
          <AccordionItem value="salary" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              Salary estimates
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Slider
                  min={15000}
                  max={100000}
                  step={5000}
                  value={salaryRange}
                  onValueChange={onSalaryRangeChange}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">€{salaryRange[0].toLocaleString()}</span>
                  <span className="font-medium">€{salaryRange[1].toLocaleString()}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Experience Level */}
          <AccordionItem value="experience" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              Experience level
            </AccordionTrigger>
            <AccordionContent>
              <Select value={experience} onValueChange={onExperienceChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Level</SelectItem>
                  <SelectItem value="entry">Berufseinsteiger</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
