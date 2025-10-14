import { Search, MapPin, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jobsHero from "@/assets/jobs-hero.jpg";
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
      <div className="relative overflow-hidden rounded-3xl h-[400px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={jobsHero} alt="Jobs Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Finde deinen Traumjob
              </h1>
              <p className="text-white/90 text-base md:text-lg max-w-2xl">
                {totalJobs} offene Stellen warten auf dich
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-3 items-center max-w-3xl">
              <Button size="lg" className="h-14 w-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 shrink-0">
                <Search className="h-6 w-6 text-white" />
              </Button>
              <div className="relative flex-1 w-full">
                <Input placeholder="Jobtitel oder Stichwort" value={search} onChange={e => onSearchChange(e.target.value)} className="border-0 focus-visible:ring-0 h-14 text-base font-medium" />
              </div>
              <div className="h-8 w-px bg-border hidden sm:block"></div>
              <div className="relative sm:w-64 w-full flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input placeholder="Stadt oder PLZ" value={location} onChange={e => onLocationChange(e.target.value)} className="border-0 focus-visible:ring-0 h-14 text-base font-medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}