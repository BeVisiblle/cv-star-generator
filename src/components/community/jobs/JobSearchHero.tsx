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
        
        {/* Hero Content - Centered */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 md:px-8">
          <div className="w-full max-w-4xl space-y-6">
            <div className="space-y-3 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Finde deinen Traumjob
              </h1>
              <p className="text-white/90 text-base md:text-lg">
                {totalJobs} offene Stellen warten auf dich
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                <div className="relative flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/5 transition-colors">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <Input 
                    placeholder="Jobtitel oder Stichwort" 
                    value={search} 
                    onChange={e => onSearchChange(e.target.value)} 
                    className="border-0 focus-visible:ring-0 h-auto p-0 text-base font-medium bg-transparent" 
                  />
                </div>
                <div className="h-px sm:h-auto sm:w-px bg-border"></div>
                <div className="relative flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/5 transition-colors">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <Input 
                    placeholder="Stadt oder PLZ" 
                    value={location} 
                    onChange={e => onLocationChange(e.target.value)} 
                    className="border-0 focus-visible:ring-0 h-auto p-0 text-base font-medium bg-transparent" 
                  />
                </div>
                <Button size="lg" className="h-12 sm:h-auto px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 shrink-0">
                  <Search className="h-5 w-5 text-white sm:mr-2" />
                  <span className="hidden sm:inline">Suchen</span>
                </Button>
              </div>
            </div>

            {/* Quick Filters - removed to avoid duplication with sidebar filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              <p className="text-white/80 text-sm">
                Nutze die Filter links, um deine Suche zu verfeinern
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}