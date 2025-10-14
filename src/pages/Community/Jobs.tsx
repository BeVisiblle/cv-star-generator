import { useState } from "react";
import { usePublicJobs } from "@/hooks/useJobs";
import { JobSearchHero } from "@/components/community/jobs/JobSearchHero";
import { JobFilters } from "@/components/community/jobs/JobFilters";
import { PublicJobCard } from "@/components/community/jobs/PublicJobCard";
import { JobDetailDialog } from "@/components/community/jobs/JobDetailDialog";
import { Button } from "@/components/ui/button";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CommunityJobs() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [datePosted, setDatePosted] = useState("all");
  const [experience, setExperience] = useState("all");
  const [salaryRange, setSalaryRange] = useState<[number, number]>([15000, 100000]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");

  const { data: jobs, isLoading } = usePublicJobs({
    employment_type: selectedJobTypes[0], // API supports single type for now
    location: location || selectedLocations[0],
  });

  // Filter jobs based on all criteria
  const filteredJobs = jobs?.filter((job) => {
    // Search filter
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) &&
        !job.company?.name?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Job type filter
    if (selectedJobTypes.length > 0 && !selectedJobTypes.includes(job.employment_type)) {
      return false;
    }

    // Date posted filter
    if (datePosted !== 'all') {
      const jobDate = new Date(job.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);
      
      if (datePosted === '24h' && hoursDiff > 24) return false;
      if (datePosted === '7d' && hoursDiff > 24 * 7) return false;
      if (datePosted === '30d' && hoursDiff > 24 * 30) return false;
    }

    // Salary filter (if job has salary info)
    if (job.salary_min && job.salary_min < salaryRange[0]) return false;
    if (job.salary_max && job.salary_max > salaryRange[1]) return false;

    return true;
  }) || [];

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  // Pagination
  const jobsPerPage = 10;
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const resetFilters = () => {
    setSelectedJobTypes([]);
    setSelectedLocations([]);
    setDatePosted("all");
    setExperience("all");
    setSalaryRange([15000, 100000]);
    setSearch("");
    setLocation("");
  };

  const hasActiveFilters = selectedJobTypes.length > 0 || 
    selectedLocations.length > 0 || 
    datePosted !== 'all' || 
    experience !== 'all' ||
    search ||
    location;

  return (
    <main className="w-full py-6 px-3 sm:px-6 bg-background">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Hero Section */}
        <JobSearchHero
          search={search}
          location={location}
          onSearchChange={setSearch}
          onLocationChange={setLocation}
          totalJobs={filteredJobs.length}
        />

        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={datePosted} onValueChange={setDatePosted}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Date Posted" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Daten</SelectItem>
              <SelectItem value="24h">Letzte 24h</SelectItem>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzter Monat</SelectItem>
            </SelectContent>
          </Select>

          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Level</SelectItem>
              <SelectItem value="entry">Einsteiger</SelectItem>
              <SelectItem value="mid">Mid-Level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Neueste</SelectItem>
              <SelectItem value="relevant">Relevanz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block">
            <JobFilters
              selectedJobTypes={selectedJobTypes}
              selectedLocations={selectedLocations}
              datePosted={datePosted}
              experience={experience}
              salaryRange={salaryRange}
              onJobTypeChange={setSelectedJobTypes}
              onLocationChange={setSelectedLocations}
              onDatePostedChange={setDatePosted}
              onExperienceChange={setExperience}
              onSalaryRangeChange={setSalaryRange}
              onReset={resetFilters}
            />
          </aside>

          {/* Jobs List */}
          <div className="space-y-6">
            {/* Results Header */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} gefunden
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : paginatedJobs.length > 0 ? (
              <>
                {/* Jobs Grid */}
                <div className="grid gap-4">
                  {paginatedJobs.map((job) => (
                    <PublicJobCard
                      key={job.id}
                      job={job}
                      onClick={() => setSelectedJob(job)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                  <Briefcase className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Keine Jobs gefunden</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  Versuche, deine Suchkriterien anzupassen oder erstelle ein neues Projekt von Grund auf
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={resetFilters}>
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Detail Dialog */}
      <JobDetailDialog
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => !open && setSelectedJob(null)}
      />
    </main>
  );
}
