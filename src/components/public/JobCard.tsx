import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Briefcase, Building, Clock, Euro, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: {
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
  };
  onApply?: (jobId: string) => void;
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'azubi':
      return 'Ausbildung';
    case 'fachkraft':
      return 'Fachkraft';
    case 'praktikum':
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
    case 'vollzeit':
      return 'Vollzeit';
    case 'teilzeit':
      return 'Teilzeit';
    case 'ausbildung':
      return 'Ausbildung';
    case 'praktikum':
      return 'Praktikum';
    default:
      return employment;
  }
};

const formatSalary = (job: JobCardProps['job']) => {
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

const formatPublishedDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Heute';
  if (diffInDays === 1) return 'Gestern';
  if (diffInDays < 7) return `vor ${diffInDays} Tagen`;
  if (diffInDays < 30) return `vor ${Math.floor(diffInDays / 7)} Wochen`;
  
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

export function JobCard({ job, onApply }: JobCardProps) {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    if (job.slug) {
      navigate(`/jobs/${job.slug}`);
    } else {
      navigate(`/jobs/${job.id}`);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(job.id);
    } else {
      handleViewDetails();
    }
  };

  const salaryString = formatSalary(job);
  const description = job.description_md ? 
    job.description_md.replace(/[#*`]/g, '').substring(0, 120) + '...' : 
    '';

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md h-[340px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {job.title}
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">
                {job.company_name}
              </p>
              
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{job.city}</span>
                </div>
                {job.category && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{getCategoryLabel(job.category)}</span>
                  </div>
                )}
                {job.employment && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">{getEmploymentLabel(job.employment)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-2">
            <div className="text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              {formatPublishedDate(job.published_at)}
            </div>
          </div>
        </div>
      </CardHeader>
    
      <CardContent className="pt-0 flex-1 flex flex-col min-w-0 px-3 sm:px-6">
        {/* Description - Fixed height area */}
        <div className="mb-4 h-[60px] sm:h-[70px] flex items-start overflow-hidden">
          {description ? (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Keine Beschreibung verfügbar
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="mb-4 h-[30px] flex items-start">
          <div className="flex flex-wrap gap-1 w-full">
            {job.work_mode && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                {getWorkModeLabel(job.work_mode)}
              </Badge>
            )}
            {salaryString && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                <Euro className="h-3 w-3 mr-1" />
                {salaryString}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons - Always at same position */}
        <div className="space-y-2 mt-auto">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleApply}
              className="flex-1 text-[10px] sm:text-xs px-1 sm:px-2 h-8"
            >
              Jetzt bewerben
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleViewDetails}
              className="flex-1 text-[10px] sm:text-xs px-1 sm:px-2 h-8"
            >
              Details ansehen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}