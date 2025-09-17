import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, Briefcase, Building2, MessageCircle, UserPlus, Bell } from 'lucide-react';

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
    employeeCount?: string;
    description?: string;
    mutualConnections?: number;
    employees?: Array<{
      id: string;
      name: string;
      title: string;
      profileImage?: string;
    }>;
    openJobs?: Array<{
      id: string;
      title: string;
      track: string;
      contractType: string;
    }>;
    isFollowing?: boolean;
  };
  onFollow?: (companyId: string) => void;
  onViewProfile?: (companyId: string) => void;
  onViewEmployee?: (employeeId: string) => void;
  onViewJob?: (jobId: string) => void;
}

export function CompanyCard({ 
  company, 
  onFollow, 
  onViewProfile, 
  onViewEmployee,
  onViewJob
}: CompanyCardProps) {
  const initials = company.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        {/* Company Header */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-md">
            <AvatarImage src={company.logoUrl} alt={company.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {company.name}
              </h3>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Industry Badge */}
            {company.industry && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 mb-2">
                {company.industry}
              </Badge>
            )}

            {/* Location and Employee Count */}
            <div className="space-y-1">
              {company.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {company.location}
                </div>
              )}
              {company.employeeCount && (
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {company.employeeCount} Mitarbeiter
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {company.description}
          </p>
        )}

        {/* Mutual Connections */}
        {company.mutualConnections && company.mutualConnections > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {company.mutualConnections} gemeinsame Kontakte
              </span>
            </div>
            
            {/* Employee Connections */}
            {company.employees && company.employees.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Mitarbeiter die du kennst:
                </p>
                <div className="space-y-2">
                  {company.employees.slice(0, 2).map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => onViewEmployee?.(employee.id)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.profileImage} alt={employee.name} />
                        <AvatarFallback className="text-xs">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employee.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {employee.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Open Jobs */}
        {company.openJobs && company.openJobs.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Angebotene Jobs:
            </p>
            <div className="space-y-2">
              {company.openJobs.slice(0, 2).map((job) => (
                <button
                  key={job.id}
                  onClick={() => onViewJob?.(job.id)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Briefcase className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {job.track} • {job.contractType}
                    </p>
                  </div>
                </button>
              ))}
              {company.openJobs.length > 2 && (
                <p className="text-xs text-blue-600 text-center">
                  +{company.openJobs.length - 2} weitere Jobs
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => onFollow?.(company.id)}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {company.isFollowing ? 'Folgen' : 'Folgen'}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewProfile?.(company.id)}
            className="flex-shrink-0"
          >
            <Building2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFollow?.(company.id)}
            className="flex-shrink-0"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        {/* View Company Link */}
        <div className="mt-3 text-center">
          <button
            onClick={() => onViewProfile?.(company.id)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Unternehmen ansehen →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
