import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface JobSearchHeroProps {
  search: string;
  location: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  totalJobs?: number;
}

export function JobSearchHero({
  search,
  location,
  onSearchChange,
  onLocationChange,
  totalJobs = 0,
}: JobSearchHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary-glow))] to-[hsl(var(--accent))] p-8 md:p-12">
      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            {totalJobs > 0 ? `${totalJobs} Verfügbare Jobs` : 'Suche deinen nächsten Job'}
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            Wenn du nach einem Job suchst, gibt es ein paar Dinge, die du tun kannst,
            um das Beste aus deiner Suche herauszuholen
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Jobtitel, Stichwort oder Unternehmen"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 border-0 focus-visible:ring-0 h-12 text-base"
            />
          </div>
          <div className="relative sm:w-64">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Ort"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="pl-12 border-0 focus-visible:ring-0 h-12 text-base"
            />
          </div>
          <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Decorative circles - profile images placeholder */}
      <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm"></div>
      <div className="absolute top-12 right-12 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm"></div>
      <div className="absolute bottom-8 left-1/4 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm"></div>
    </div>
  );
}
