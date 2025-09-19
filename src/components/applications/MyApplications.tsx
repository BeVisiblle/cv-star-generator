import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, MapPin } from 'lucide-react';

interface MyApplicationsProps {
  candidateId?: string;
}

export function MyApplications({ candidateId }: MyApplicationsProps) {
  // Mock data for now
  const applications = [
    {
      id: '1',
      job_title: 'Software Entwickler',
      company_name: 'TechCorp GmbH',
      location: 'Berlin',
      applied_at: '2024-01-15',
      status: 'pending',
    },
    {
      id: '2',
      job_title: 'Frontend Developer',
      company_name: 'StartupXYZ',
      location: 'München',
      applied_at: '2024-01-10',
      status: 'interviewed',
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'interviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'interviewed': return 'Interview';
      case 'accepted': return 'Angenommen';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Noch keine Bewerbungen
        </h3>
        <p className="text-gray-600">
          Du hast dich noch nicht auf Jobs beworben.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{application.job_title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Building2 className="w-4 h-4" />
                  <span>{application.company_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{application.location}</span>
                </div>
              </div>
              <Badge className={getStatusColor(application.status)}>
                {getStatusText(application.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Beworben am {new Date(application.applied_at).toLocaleDateString('de-DE')}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Details ansehen
                </Button>
                {application.status === 'pending' && (
                  <Button variant="ghost" size="sm">
                    Zurückziehen
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}