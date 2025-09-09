import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MapPin, Briefcase, Building, Clock, Euro, Calendar, MoreVertical, Eye, EyeOff, Edit } from "lucide-react";
import { useJobPostingLimits } from "@/hooks/useJobPostingLimits";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CompanyJobCardProps {
  job: {
    id: string;
    title: string;
    city?: string;
    category?: string;
    work_mode?: string;
    employment?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    salary_interval?: string;
    created_at: string;
    description_md?: string;
    is_active: boolean;
    is_public: boolean;
  };
  companyName: string;
  onJobUpdated: () => void;
  onViewJob?: (jobId: string) => void;
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'apprenticeship':
      return 'Ausbildung';
    case 'professional':
      return 'Berufserfahren';
    case 'internship':
      return 'Praktikum';
    default:
      return category;
  }
};

const getWorkModeLabel = (workMode: string) => {
  switch (workMode) {
    case 'remote':
      return 'Remote';
    case 'hybrid':
      return 'Hybrid';
    case 'onsite':
      return 'Vor Ort';
    default:
      return workMode;
  }
};

const getEmploymentLabel = (employment: string) => {
  switch (employment) {
    case 'fulltime':
      return 'Vollzeit';
    case 'parttime':
      return 'Teilzeit';
    case 'apprenticeship':
      return 'Ausbildung';
    case 'internship':
      return 'Praktikum';
    default:
      return employment;
  }
};

const formatSalary = (job: CompanyJobCardProps['job']) => {
  if (!job.salary_min && !job.salary_max) return null;
  
  const currency = job.salary_currency === 'EUR' ? '€' : job.salary_currency;
  const interval = job.salary_interval === 'month' ? '/Monat' : 
                  job.salary_interval === 'year' ? '/Jahr' : '';
  
  if (job.salary_min && job.salary_max) {
    return `${currency}${job.salary_min.toLocaleString()} - ${currency}${job.salary_max.toLocaleString()}${interval}`;
  } else if (job.salary_min) {
    return `ab ${currency}${job.salary_min.toLocaleString()}${interval}`;
  } else if (job.salary_max) {
    return `bis ${currency}${job.salary_max.toLocaleString()}${interval}`;
  }
  
  return null;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

export function CompanyJobCard({ job, companyName, onJobUpdated }: CompanyJobCardProps) {
  const { publishJob, isPublishing, updateJob } = useJobPostingLimits();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePublish = () => {
    publishJob(job.id);
    setTimeout(() => onJobUpdated(), 1000);
  };

  const handleToggleActive = async () => {
    setIsUpdating(true);
    try {
      await updateJob.mutateAsync({
        jobId: job.id,
        jobData: { is_active: !job.is_active }
      });
      onJobUpdated();
    } catch (error) {
      console.error('Toggle active error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePublic = async () => {
    setIsUpdating(true);
    try {
      await updateJob.mutateAsync({
        jobId: job.id,
        jobData: { is_public: !job.is_public }
      });
      onJobUpdated();
    } catch (error) {
      console.error('Toggle public error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const salaryString = formatSalary(job);
  const description = job.description_md ? 
    job.description_md.replace(/[#*`]/g, '').substring(0, 120) + '...' : 
    '';

  const getStatusBadge = () => {
    if (!job.is_active) {
      return <Badge variant="secondary">Entwurf</Badge>;
    } else if (job.is_active && job.is_public) {
      return <Badge variant="default">Aktiv</Badge>;
    } else {
      return <Badge variant="outline">Inaktiv</Badge>;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">
                  {job.title}
                </h3>
                {getStatusBadge()}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {companyName}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                {job.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{job.city}</span>
                  </div>
                )}
                {job.category && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{getCategoryLabel(job.category)}</span>
                  </div>
                )}
                {job.employment && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{getEmploymentLabel(job.employment)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 inline mr-1" />
                {formatDate(job.created_at)}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewJob?.(job.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Details & Bewerbungen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/jobs/${job.id}`, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Öffentliche Ansicht
                </DropdownMenuItem>
                
                {!job.is_active ? (
                  <DropdownMenuItem onClick={handlePublish} disabled={isPublishing}>
                    <Edit className="h-4 w-4 mr-2" />
                    Veröffentlichen
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleToggleActive} disabled={isUpdating}>
                      {job.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Deaktivieren
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Aktivieren
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleTogglePublic} disabled={isUpdating}>
                      {job.is_public ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Öffentlich ausblenden
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Öffentlich machen
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
    
      <CardContent className="pt-0">
        {description && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {job.work_mode && (
            <Badge variant="secondary" className="text-xs">
              {getWorkModeLabel(job.work_mode)}
            </Badge>
          )}
          {salaryString && (
            <Badge variant="outline" className="text-xs">
              <Euro className="h-3 w-3 mr-1" />
              {salaryString}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}