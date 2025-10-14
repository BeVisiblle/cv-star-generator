import { Search, MapPin, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface JobSearchHeroProps {
  search: string;
  location: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  totalJobs?: number;
  datePosted?: string;
  experience?: string;
  onDatePostedChange?: (value: string) => void;
  onExperienceChange?: (value: string) => void;
}
export function JobSearchHero({
  search,
  location,
  onSearchChange,
  onLocationChange,
  totalJobs = 0,
  datePosted,
  experience,
  onDatePostedChange,
  onExperienceChange
}: JobSearchHeroProps) {
  return <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary-glow))] to-[hsl(var(--accent))] p-8 md:p-16">
        {/* Decorative profile circles */}
        <div className="absolute top-12 left-[15%] w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40"></div>
        <div className="absolute top-20 left-[25%] w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40"></div>
        <div className="absolute top-8 left-[35%] w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40"></div>
        <div className="absolute top-12 right-[30%] w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40"></div>
        <div className="absolute top-20 right-[20%] w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40"></div>
        <div className="absolute top-6 right-[10%] w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Search for your next job
            </h1>
            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto">
              When you're searching for a job, there are a few things you can do to get the most out of your search
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-3 items-center max-w-3xl mx-auto">
            <Button size="lg" className="h-14 w-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 shrink-0">
              <Search className="h-6 w-6 text-white" />
            </Button>
            <div className="relative flex-1 w-full">
              <Input placeholder="Manager" value={search} onChange={e => onSearchChange(e.target.value)} className="border-0 focus-visible:ring-0 h-14 text-base font-medium" />
            </div>
            <div className="h-8 w-px bg-border hidden sm:block"></div>
            <div className="relative sm:w-64 w-full flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input placeholder="New York" value={location} onChange={e => onLocationChange(e.target.value)} className="border-0 focus-visible:ring-0 h-14 text-base font-medium" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      
    </div>;
}