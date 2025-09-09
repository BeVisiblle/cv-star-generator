import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Euro, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company_name: string;
    city: string;
    country: string;
    work_mode: string;
    employment_type: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    salary_interval: string;
    published_at: string;
    description_snippet: string;
  };
  onClick: (jobId: string) => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    
    const min = job.salary_min ? job.salary_min.toLocaleString('de-DE') : '';
    const max = job.salary_max ? job.salary_max.toLocaleString('de-DE') : '';
    const currency = job.salary_currency || 'EUR';
    const interval = job.salary_interval || 'Monat';
    
    if (min && max) {
      return `${min} - ${max} €/${interval}`;
    } else if (min) {
      return `ab ${min} €/${interval}`;
    } else if (max) {
      return `bis ${max} €/${interval}`;
    }
    return null;
  };

  const formatWorkMode = (mode: string) => {
    switch (mode) {
      case 'remote': return 'Remote';
      case 'hybrid': return 'Hybrid';
      case 'office': return 'Büro';
      default: return mode;
    }
  };

  const formatEmploymentType = (type: string) => {
    switch (type) {
      case 'full_time': return 'Vollzeit';
      case 'part_time': return 'Teilzeit';
      case 'internship': return 'Praktikum';
      case 'trainee': return 'Ausbildung';
      case 'student': return 'Werkstudent';
      default: return type;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(job.published_at), {
    addSuffix: true,
    locale: de
  });

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200"
      onClick={() => onClick(job.id)}
      data-testid="job-card"
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {job.title}
            </h3>
            <p className="text-gray-600 mb-2">
              {job.company_name}
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{job.city}, {job.country}</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {formatWorkMode(job.work_mode)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {formatEmploymentType(job.employment_type)}
          </Badge>
        </div>

        {formatSalary() && (
          <div className="flex items-center text-sm text-green-600 mb-3">
            <Euro className="h-4 w-4 mr-1" />
            <span className="font-medium">{formatSalary()}</span>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {job.description_snippet}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>vor {timeAgo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}