import React, { useState, useEffect, useMemo } from "react";
import { JobCard } from "@/components/public/JobCard";
import { JobSearchHeader } from "@/components/public/JobSearchHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company_name: string;
  city: string;
  country?: string;
  category?: string;
  work_mode?: string;
  employment?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_interval?: string;
  published_at: string;
  description_md?: string;
  slug?: string;
}

interface JobSearchFilters {
  keywords: string;
  category: string;
  location: string;
  workMode: string;
  employment: string;
}

export default function CommunityJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<JobSearchFilters>({
    keywords: "",
    category: "",
    location: "",
    workMode: "",
    employment: "",
  });

  const loadJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('public_job_listings')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Fehler beim Laden der Stellenanzeigen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Keywords filter
      if (filters.keywords) {
        const keywords = filters.keywords.toLowerCase();
        const searchText = `${job.title} ${job.company_name} ${job.description_md || ''}`.toLowerCase();
        if (!searchText.includes(keywords)) return false;
      }

      // Category filter
      if (filters.category && job.category !== filters.category) return false;

      // Location filter
      if (filters.location) {
        const location = filters.location.toLowerCase();
        if (!job.city?.toLowerCase().includes(location)) return false;
      }

      // Work mode filter
      if (filters.workMode && job.work_mode !== filters.workMode) return false;

      // Employment filter
      if (filters.employment && job.employment !== filters.employment) return false;

      return true;
    });
  }, [jobs, filters]);

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast.error('Bitte melde dich an, um dich zu bewerben');
      return;
    }

    try {
      // Get the job details first
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        toast.error('Job nicht gefunden');
        return;
      }

      // Get user profile for application
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, vorname, nachname, telefon, cv_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        toast.error('Fehler beim Laden des Profils');
        return;
      }

      const fullName = `${profile.vorname || ''} ${profile.nachname || ''}`.trim();
      if (!fullName || !profile.email) {
        toast.error('Bitte vervollständige dein Profil, um dich zu bewerben');
        return;
      }

      const result = await supabase.rpc('apply_one_click', {
        p_job: jobId,
        p_email: profile.email,
        p_full_name: fullName,
        p_phone: profile.telefon || undefined,
        p_cv_url: profile.cv_url || undefined
      });

      if (result.error) throw result.error;

      toast.success('Bewerbung erfolgreich eingereicht!');
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Fehler beim Einreichen der Bewerbung');
    }
  };

  return (
    <main className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-2">Stellenanzeigen</h1>
        <p className="text-muted-foreground">Entdecke spannende Karrieremöglichkeiten und bewirb dich mit einem Klick.</p>
      </div>

      <JobSearchHeader
        filters={filters}
        onFiltersChange={setFilters}
        resultsCount={filteredJobs.length}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Arbeitsort</label>
                <select
                  value={filters.workMode}
                  onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Alle</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Vor Ort</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Beschäftigungsart</label>
                <select
                  value={filters.employment}
                  onChange={(e) => setFilters({ ...filters, employment: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Alle</option>
                  <option value="vollzeit">Vollzeit</option>
                  <option value="teilzeit">Teilzeit</option>
                  <option value="ausbildung">Ausbildung</option>
                  <option value="praktikum">Praktikum</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Standort</label>
                <input
                  type="text"
                  placeholder="Stadt eingeben..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-[340px]">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {jobs.length === 0 
                ? "Derzeit sind keine Stellenanzeigen verfügbar." 
                : "Keine Stellenanzeigen gefunden, die deinen Suchkriterien entsprechen."}
            </p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onApply={handleApply}
            />
          ))
        )}
      </div>
    </main>
  );
}
