import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Briefcase, 
  Calendar,
  Building2,
  ArrowLeft,
  Bookmark,
  Users,
  Share2,
  Globe
} from "lucide-react";

export default function PublicJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: job, isLoading } = useQuery({
    queryKey: ['public-job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          company:companies!job_posts_company_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: moreJobs } = useQuery({
    queryKey: ['more-jobs', job?.company?.id],
    queryFn: async () => {
      if (!job?.company?.id) return [];
      const { data } = await supabase
        .from('job_posts')
        .select('id, title, city, employment_type, created_at')
        .eq('company_id', job.company.id)
        .eq('is_active', true)
        .neq('id', id)
        .limit(3);
      return data || [];
    },
    enabled: !!job?.company?.id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job nicht gefunden</h2>
          <Button onClick={() => navigate('/jobs')}>Zurück zu den Jobs</Button>
        </div>
      </div>
    );
  }

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apprenticeship: "Ausbildung",
      dual_study: "Duales Studium",
      internship: "Praktikum",
      fulltime: "Vollzeit",
      parttime: "Teilzeit",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      {job.company?.header_image && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img 
            src={job.company.header_image} 
            alt={job.company.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div>
              {job.company?.logo_url && (
                <img 
                  src={job.company.logo_url} 
                  alt={job.company.name}
                  className="w-12 h-12 object-contain mb-4"
                />
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{job.title}</h1>
              <div className="text-muted-foreground mb-1">{job.company?.name}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.city || "Standort nicht angegeben"}</span>
                <span>•</span>
                <span>Vor {Math.floor(Math.random() * 24)} Stunden</span>
              </div>
            </div>

            {/* About the Job */}
            {job.description_md && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Über die Stelle</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                    {job.description_md}
                  </p>
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.tasks_md && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Aufgaben:</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                    {job.tasks_md}
                  </p>
                </div>
              </div>
            )}

            {/* Required Qualifications */}
            {job.requirements_md && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Anforderungen:</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                    {job.requirements_md}
                  </p>
                </div>
              </div>
            )}

            {/* Skills */}
            {((job.must_have && job.must_have.length > 0) || (job.nice_to_have && job.nice_to_have.length > 0)) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Fähigkeiten:</h3>
                
                {job.must_have && job.must_have.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Must-Have:</div>
                    <div className="flex flex-wrap gap-2">
                      {job.must_have.map((skill: string, index: number) => (
                        <Badge key={`must-${index}`} variant="default" className="rounded-full px-4 py-2">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.nice_to_have && job.nice_to_have.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Nice-to-Have:</div>
                    <div className="flex flex-wrap gap-2">
                      {job.nice_to_have.map((skill: string, index: number) => (
                        <Badge key={`nice-${index}`} variant="secondary" className="rounded-full px-4 py-2">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Languages */}
            {job.languages && Array.isArray(job.languages) && job.languages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Sprachen:</h3>
                <div className="flex flex-wrap gap-2">
                  {job.languages.map((lang: any, index: number) => (
                    <Badge key={index} variant="outline" className="rounded-full px-4 py-2">
                      <Globe className="h-3 w-3 mr-1" />
                      {typeof lang === 'string' ? lang : `${lang.language} (${lang.level})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Qualifications */}
            {job.additional_qualifications && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Weitere Qualifikationen:</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                    {job.additional_qualifications}
                  </p>
                </div>
              </div>
            )}

            {/* Location Map Placeholder */}
            {job.city && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Standort</h3>
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p>{job.city}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Location & Salary Card */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              {job.city && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="font-medium">{job.city}</div>
                </div>
              )}
              
              {(job.salary_min && job.salary_max) && (
                <div className="border-t pt-4">
                  <div className="text-3xl font-bold">
                    €{job.salary_min.toLocaleString()} - €{job.salary_max.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Durchschn. Gehalt</div>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Details</div>
                
                {job.industry && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{job.industry}</div>
                      <div className="text-xs text-muted-foreground">Branche</div>
                    </div>
                  </div>
                )}

                {job.employment_type && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{getEmploymentTypeLabel(job.employment_type)}</div>
                      <div className="text-xs text-muted-foreground">Anstellungsart</div>
                    </div>
                  </div>
                )}

                {job.work_mode && (
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{job.work_mode}</div>
                      <div className="text-xs text-muted-foreground">Arbeitsmodell</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Jetzt bewerben
                </Button>
                <Button variant="outline" className="w-full">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Für später speichern
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
              </div>
            </div>

            {/* Job Posted By */}
            {job.company && (
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="text-sm font-medium">Veröffentlicht von</div>
                
                <div className="flex items-start gap-3">
                  {job.company.logo_url && (
                    <img 
                      src={job.company.logo_url} 
                      alt={job.company.name}
                      className="w-10 h-10 object-contain rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{job.company.name}</div>
                    {job.company.main_location && (
                      <div className="text-sm text-muted-foreground">
                        {job.company.main_location}
                      </div>
                    )}
                  </div>
                </div>

                {job.company.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.company.description}
                  </p>
                )}
              </div>
            )}

            {/* More Jobs */}
            {moreJobs && moreJobs.length > 0 && (
              <div className="bg-card border rounded-lg p-6">
                <div className="font-semibold mb-4">
                  {moreJobs.length} weitere {moreJobs.length === 1 ? 'Job' : 'Jobs'}
                </div>
                <div className="space-y-3">
                  {moreJobs.map((moreJob) => (
                    <button
                      key={moreJob.id}
                      onClick={() => navigate(`/jobs/${moreJob.id}`)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-sm mb-1">{moreJob.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {moreJob.city} • {getEmploymentTypeLabel(moreJob.employment_type)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
