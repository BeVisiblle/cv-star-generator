import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface RadiusSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  value,
  onChange,
  min = 10,
  max = 200,
  step = 10,
  label = "Umkreis",
  className,
}) => {
  const presets = [10, 25, 50, 100, 150, 200];
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label>
          {label}: {value} km
        </Label>
        <div className="hidden md:flex gap-1">
          {presets.map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={p === value ? "default" : "secondary"}
              onClick={() => onChange(p)}
              className="h-7 px-2"
            >
              {p}km
            </Button>
          ))}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};

export default RadiusSelector;
