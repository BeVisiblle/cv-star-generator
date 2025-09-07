import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Clock, Euro } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PublicJob {
  id: string;
  slug: string;
  company_id: string;
  company_name: string;
  title: string;
  category: string;
  city: string;
  country: string;
  work_mode: string;
  employment: string;
  salary_currency: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_interval: string;
  published_at: string;
  description_snippet: string;
}

export default function PublicJobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const { data, error } = await supabase
        .from('public_job_listings')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(query) ||
      job.company_name?.toLowerCase().includes(query) ||
      job.city?.toLowerCase().includes(query) ||
      job.category?.toLowerCase().includes(query)
    );
  });

  const formatSalary = (job: PublicJob) => {
    if (!job.salary_min && !job.salary_max) return null;
    
    const currency = job.salary_currency === 'EUR' ? '€' : job.salary_currency;
    const interval = job.salary_interval === 'month' ? '/Monat' : 
                    job.salary_interval === 'year' ? '/Jahr' : 
                    job.salary_interval === 'hour' ? '/Std' : '';

    if (job.salary_min && job.salary_max) {
      return `${currency}${job.salary_min.toLocaleString()} - ${currency}${job.salary_max.toLocaleString()} ${interval}`;
    } else if (job.salary_min) {
      return `ab ${currency}${job.salary_min.toLocaleString()} ${interval}`;
    } else if (job.salary_max) {
      return `bis ${currency}${job.salary_max.toLocaleString()} ${interval}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Stellenanzeigen</h1>
        <p className="text-muted-foreground">
          Entdecke spannende Karrieremöglichkeiten und bewirb dich mit nur einem Klick
        </p>
        
        <div className="flex gap-4">
          <Input
            placeholder="Suche nach Stelle, Unternehmen oder Ort..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'Keine Stellen gefunden.' : 'Aktuell sind keine Stellen verfügbar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {job.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {job.employment}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{job.company_name}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description_snippet}...
                </p>
                
                <div className="space-y-2">
                  {job.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{job.city}{job.country && `, ${job.country}`}</span>
                    </div>
                  )}
                  
                  {formatSalary(job) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Euro className="h-4 w-4" />
                      <span>{formatSalary(job)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(job.published_at).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col gap-2">
                  <Button 
                    onClick={() => navigate(`/jobs/${job.slug}`)}
                    className="w-full"
                  >
                    Jetzt bewerben
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/jobs/${job.slug}`)}
                    className="w-full"
                  >
                    Details ansehen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}