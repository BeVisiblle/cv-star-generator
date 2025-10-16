import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicJobs } from "@/hooks/useJobs";
import { useMyApplications } from "@/hooks/useMyApplications";
import { JobSearchHero } from "@/components/community/jobs/JobSearchHero";
import { JobFilters } from "@/components/community/jobs/JobFilters";
import { PublicJobCard } from "@/components/community/jobs/PublicJobCard";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table as TableIcon, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function CommunityJobs() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"large" | "compact">("large");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [requiresLicense, setRequiresLicense] = useState(false);
  const [datePosted, setDatePosted] = useState("all");
  const [experience, setExperience] = useState("all");
  const [salaryRange, setSalaryRange] = useState<[number, number]>([15000, 100000]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");

  const {
    data: jobs,
    isLoading
  } = usePublicJobs({
    employment_type: selectedJobTypes[0],
    location: location || selectedCity
  });

  const { data: myApplications } = useMyApplications();

  // Create a map of job_id to application for quick lookup
  const applicationsByJobId = myApplications?.reduce((acc, app) => {
    acc[app.job_id] = app;
    return acc;
  }, {} as Record<string, typeof myApplications[0]>) || {};

  // Filter jobs based on all criteria
  const filteredJobs = jobs?.filter(job => {
    // Hide rejected applications
    const application = applicationsByJobId[job.id];
    if (application?.status === 'rejected') {
      return false;
    }

    // Search filter (includes company name)
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesTitle = job.title?.toLowerCase().includes(searchLower);
      const matchesCompany = job.company?.name?.toLowerCase().includes(searchLower);
      const matchesDescription = job.description?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesCompany && !matchesDescription) {
        return false;
      }
    }

    // Company filter
    if (selectedCompany && job.company?.name) {
      if (!job.company.name.toLowerCase().includes(selectedCompany.toLowerCase())) {
        return false;
      }
    }

    // Job type filter (Stellenart)
    if (selectedJobTypes.length > 0 && !selectedJobTypes.includes(job.employment_type)) {
      return false;
    }

    // Industry filter (Branche)
    if (selectedIndustry && job.industry) {
      if (job.industry !== selectedIndustry) {
        return false;
      }
    }

    // Work mode filter
    if (selectedWorkModes.length > 0 && !selectedWorkModes.includes(job.work_mode)) {
      return false;
    }

    // City filter
    if (selectedCity && job.city && !job.city.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }

    // Location filter (from search bar)
    if (location && job.city && !job.city.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }

    // Start date filter
    if (startDate && job.start_date) {
      const jobStartDate = new Date(job.start_date);
      const filterStartDate = new Date(startDate);
      if (jobStartDate < filterStartDate) {
        return false;
      }
    }

    // License requirement filter
    if (requiresLicense && !job.requires_drivers_license) {
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

    // Experience filter
    if (experience !== 'all' && job.experience_level) {
      if (job.experience_level !== experience) {
        return false;
      }
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
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const resetFilters = () => {
    setSelectedJobTypes([]);
    setSelectedWorkModes([]);
    setSelectedCity("");
    setSelectedCompany("");
    setSelectedIndustry("");
    setStartDate("");
    setRequiresLicense(false);
    setDatePosted("all");
    setExperience("all");
    setSalaryRange([15000, 100000]);
    setSelectedSkills([]);
    setSearch("");
    setLocation("");
  };
  
  const hasActiveFilters = 
    selectedJobTypes.length > 0 || 
    selectedWorkModes.length > 0 || 
    selectedCity !== "" || 
    selectedCompany !== "" ||
    selectedIndustry !== "" ||
    startDate !== "" ||
    requiresLicense ||
    datePosted !== 'all' || 
    experience !== 'all' || 
    selectedSkills.length > 0 || 
    search || 
    location;

  const handleJobClick = (job: any) => {
    navigate(`/jobs/${job.id}`);
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_time: 'Vollzeit',
      part_time: 'Teilzeit',
      apprenticeship: 'Ausbildung',
      dual_study: 'Duales Studium',
      internship: 'Praktikum',
    };
    return labels[type] || type;
  };

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
          datePosted={datePosted}
          experience={experience}
          onDatePostedChange={setDatePosted}
          onExperienceChange={setExperience}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <JobFilters 
                selectedJobTypes={selectedJobTypes} 
                selectedWorkModes={selectedWorkModes}
                selectedCity={selectedCity}
                selectedCompany={selectedCompany}
                selectedIndustry={selectedIndustry}
                startDate={startDate}
                requiresLicense={requiresLicense}
                datePosted={datePosted} 
                experience={experience} 
                salaryRange={salaryRange} 
                selectedSkills={selectedSkills}
                onJobTypeChange={setSelectedJobTypes} 
                onWorkModeChange={setSelectedWorkModes}
                onCityChange={setSelectedCity}
                onCompanyChange={setSelectedCompany}
                onIndustryChange={setSelectedIndustry}
                onStartDateChange={setStartDate}
                onRequiresLicenseChange={setRequiresLicense}
                onDatePostedChange={setDatePosted} 
                onExperienceChange={setExperience} 
                onSalaryRangeChange={setSalaryRange} 
                onSkillsChange={setSelectedSkills}
                onReset={resetFilters} 
              />
            </div>
          </aside>

          {/* Jobs List */}
          <div className="space-y-6">
            {/* View Toggle and Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Stelle gefunden' : 'Stellen gefunden'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "large" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("large")}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Groß
                </Button>
                <Button
                  variant={viewMode === "compact" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("compact")}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kompakt
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : paginatedJobs.length > 0 ? (
              <>
                {/* Jobs Grid */}
                <div className={viewMode === "large" ? "grid gap-4" : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"}>
                  {paginatedJobs.map(job => {
                    const application = applicationsByJobId[job.id];
                    return (
                      <PublicJobCard 
                        key={job.id} 
                        job={job} 
                        onClick={() => handleJobClick(job)}
                        compact={viewMode === "compact"}
                        application={application}
                      />
                    );
                  })}
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
    </main>
  );
}
