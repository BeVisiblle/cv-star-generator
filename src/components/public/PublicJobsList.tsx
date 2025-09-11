import React, { useEffect, useState } from 'react';
import { JobCard } from './JobCard';
import { JobSearchHeader } from './JobSearchHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface PublicJob {
  id: string;
  slug: string;
  company_id: string;
  company_name: string;
  title: string;
  job_type: string;
  city: string;
  country: string;
  work_mode: string;
  employment_type: string;
  salary_currency: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_interval: string;
  published_at: string;
  description_snippet: string;
  description_md?: string;
}

interface JobSearchFilters {
  keywords: string;
  category: string;
  location: string;
  workMode: string;
  employment: string;
}

export default function PublicJobsList() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<JobSearchFilters>({
    keywords: "",
    category: "",
    location: "",
    workMode: "",
    employment: "",
  });

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      console.log('🔍 Lade Jobs...');
      
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          id,
          title,
          city,
          country,
          work_mode,
          employment_type,
          salary_currency,
          salary_min,
          salary_max,
          salary_interval,
          published_at,
          description_md,
          company_id,
          companies!job_posts_company_id_fkey(
            id,
            name,
            logo_url
          )
        `)
        .eq('is_public', true)
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Fehler beim Laden der Jobs:', error);
        throw error;
      }
      
      console.log('📊 Gefundene Jobs:', data?.length || 0);
      
      // Transform data to match expected format
      const transformedJobs = (data || []).map(job => ({
        id: job.id,
        slug: job.id, // Use ID as slug for now
        company_id: job.company_id,
        company_name: 'TechCorp GmbH', // Fester Name für Test
        title: job.title,
        job_type: 'professional', // Default since category doesn't exist
        city: job.city,
        country: job.country,
        work_mode: job.work_mode,
        employment_type: job.employment_type,
        salary_currency: job.salary_currency,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        salary_interval: job.salary_interval,
        published_at: job.published_at,
        description_snippet: job.description_md ? job.description_md.substring(0, 200) + '...' : 'Keine Beschreibung verfügbar',
        description_md: job.description_md
      }));
      
      console.log('✅ Jobs erfolgreich transformiert:', transformedJobs.length);
      setJobs(transformedJobs);
    } catch (error) {
      console.error('❌ Error loading jobs:', error);
      console.error('❌ Error details:', error.message);
      toast.error('Fehler beim Laden der Stellenanzeigen: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = jobs.filter(job => {
    // Keywords filter
    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase();
      const searchText = `${job.title} ${job.company_name} ${job.description_snippet || ''}`.toLowerCase();
      if (!searchText.includes(keywords)) return false;
    }

    // Category filter
    if (filters.category && job.job_type !== filters.category) return false;

    // Location filter
    if (filters.location) {
      const location = filters.location.toLowerCase();
      if (!job.city?.toLowerCase().includes(location)) return false;
    }

    // Work mode filter
    if (filters.workMode && job.work_mode !== filters.workMode) return false;

    // Employment filter
    if (filters.employment && job.employment_type !== filters.employment) return false;

    return true;
  });

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast.error('Bitte melde dich an, um dich zu bewerben');
      return;
    }

    try {
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Stellenanzeigen</h1>
        <p className="text-muted-foreground mb-6">Entdecke spannende Karrieremöglichkeiten und bewirb dich mit einem Klick</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kategorie</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Alle</option>
                  <option value="internship">Praktikum</option>
                  <option value="apprenticeship">Ausbildung</option>
                  <option value="professional">Berufserfahren</option>
                </select>
              </div>
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
                  <option value="fulltime">Vollzeit</option>
                  <option value="parttime">Teilzeit</option>
                  <option value="apprenticeship">Ausbildung</option>
                  <option value="internship">Praktikum</option>
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
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
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {jobs.length === 0 
              ? "Derzeit sind keine Stellenanzeigen verfügbar." 
              : "Keine Stellenanzeigen gefunden, die deinen Suchkriterien entsprechen."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job}
              onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
            />
          ))}
        </div>
      )}
    </div>
  );
}