import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PersonCard } from '@/components/discover/PersonCard';
import { CompanyCard } from '@/components/discover/CompanyCard';
import { createClient } from '@/lib/supabase';
import { Users, Building2, ArrowRight } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  profileImage?: string;
  title?: string;
  company?: string;
  isVerified?: boolean;
  industry?: string;
  location?: string;
  bio?: string;
  connections?: string[];
  isConnected?: boolean;
  canMessage?: boolean;
}

interface Company {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  location?: string;
  employeeCount?: string;
  description?: string;
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
    location: string;
    company: string;
    companyLogo?: string;
    description?: string;
    requirements: string[];
    benefits: string[];
    isNew: boolean;
    isFeatured: boolean;
    applicationCount: number;
  }>;
  isFollowing?: boolean;
}

export function DiscoverSection() {
  const [interestingPeople, setInterestingPeople] = useState<Person[]>([]);
  const [interestingCompanies, setInterestingCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterestingPeople();
    loadInterestingCompanies();
  }, []);

  const loadInterestingPeople = async () => {
    try {
      const supabase = createClient();
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .limit(6);

      if (candidatesData) {
        const formattedPeople: Person[] = candidatesData.map((candidate: any) => ({
          id: candidate.id,
          name: candidate.full_name || 'Unknown',
          profileImage: null,
          title: 'Candidate',
          company: 'Looking for opportunities',
          isVerified: false,
          industry: 'Various',
          location: candidate.city || 'Unknown',
          bio: 'Interested candidate',
          connections: [],
          isConnected: false,
          canMessage: true
        }));

        setInterestingPeople(formattedPeople);
      }
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const loadInterestingCompanies = async () => {
    try {
      const supabase = createClient();
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .limit(6);

      const { data: jobsData } = await supabase
        .from('job_posts')
        .select('*')
        .in('company_id', companiesData?.map(c => c.id) || []);

      if (companiesData) {
        const formattedCompanies: Company[] = companiesData.map((company: any) => ({
          id: company.id,
          name: company.name,
          logo: company.logo_url,
          industry: company.industry,
          location: company.main_location,
          employeeCount: company.size_range,
          description: company.description,
          employees: [],
          openJobs: jobsData?.filter(job => job.company_id === company.id).map(job => ({
            id: job.id,
            title: job.title,
            track: 'General',
            contractType: 'Full-time',
            location: company.main_location,
            company: company.name,
            companyLogo: company.logo_url,
            description: job.description_md || '',
            requirements: [],
            benefits: [],
            isNew: false,
            isFeatured: false,
            applicationCount: 0
          })) || [],
          isFollowing: false
        }));

        setInterestingCompanies(formattedCompanies);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (personId: string) => {
    console.log('Connecting to person:', personId);
  };

  const handleMessage = async (personId: string) => {
    console.log('Messaging person:', personId);
  };

  const handleFollow = async (id: string, type: 'person' | 'company') => {
    console.log('Following:', type, id);
  };

  const handleViewProfile = (id: string, type: 'person' | 'company') => {
    if (type === 'person') {
      window.location.href = `/u/${id}`;
    } else {
      window.location.href = `/company/${id}`;
    }
  };

  const handleViewEmployee = (employeeId: string) => {
    window.location.href = `/u/${employeeId}`;
  };

  const handleViewJob = (jobId: string) => {
    window.location.href = `/jobs#${jobId}`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Interesting People */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">
              Interessante Personen
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/discover/people'}
            className="flex items-center space-x-2"
          >
            <span>Weitere anzeigen</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {interestingPeople.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Noch keine interessanten Personen
              </h3>
              <p className="text-muted-foreground">
                Personen mit vollständigen Profilen werden hier angezeigt.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interestingPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onConnect={() => handleConnect(person.id)}
                onMessage={() => handleMessage(person.id)}
                onFollow={() => handleFollow(person.id, 'person')}
                onViewProfile={() => handleViewProfile(person.id, 'person')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interesting Companies */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">
              Interessante Unternehmen
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/discover/companies'}
            className="flex items-center space-x-2"
          >
            <span>Weitere anzeigen</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {interestingCompanies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Noch keine interessanten Unternehmen
              </h3>
              <p className="text-muted-foreground">
                Unternehmen mit aktiven Jobs werden hier angezeigt.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interestingCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onFollow={() => handleFollow(company.id, 'company')}
                onViewProfile={() => handleViewProfile(company.id, 'company')}
                onViewEmployee={handleViewEmployee}
                onViewJob={handleViewJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}