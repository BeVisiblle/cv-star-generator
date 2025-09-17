import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonCard } from '@/components/discover/PersonCard';
import { CompanyCard } from '@/components/discover/CompanyCard';
import { createClient } from '@/lib/supabase';
import { Users, Building2, ArrowRight, Search } from 'lucide-react';

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
  mutualConnections?: number;
  connections?: string[];
  isConnected?: boolean;
  isFollowing?: boolean;
}

interface Company {
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
      
      const { data: peopleData } = await supabase
        .from('candidates')
        .select(`
          id,
          vorname,
          nachname,
          bio_short,
          stage,
          industry,
          location,
          profile_image,
          title,
          company_name,
          is_verified
        `)
        .eq('stage', 'available')
        .gte('profile_completeness', 0.7)
        .order('profile_completeness', { ascending: false })
        .limit(6);

      if (peopleData) {
        const formattedPeople: Person[] = peopleData.map(person => ({
          id: person.id,
          name: `${person.vorname} ${person.nachname}`,
          profileImage: person.profile_image,
          title: person.title,
          company: person.company_name,
          isVerified: person.is_verified,
          industry: person.industry,
          location: person.location,
          bio: person.bio_short,
          mutualConnections: Math.floor(Math.random() * 5), // Mock data
          connections: ['Max M.', 'Anna S.', 'Tom K.'], // Mock data
          isConnected: false,
          isFollowing: false
        }));
        setInterestingPeople(formattedPeople);
      }
    } catch (error) {
      console.error('Error loading interesting people:', error);
    }
  };

  const loadInterestingCompanies = async () => {
    try {
      const supabase = createClient();
      
      const { data: companiesData } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          logo_url,
          industry,
          size_range,
          description,
          location
        `)
        .limit(6);

      if (companiesData) {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('id, title, track, contract_type, company_id')
          .eq('is_active', true);

        const formattedCompanies: Company[] = companiesData.map(company => {
          const companyJobs = jobsData?.filter(job => job.company_id === company.id) || [];
          
          return {
            id: company.id,
            name: company.name,
            logoUrl: company.logo_url,
            industry: company.industry,
            location: company.location,
            employeeCount: company.size_range,
            description: company.description,
            mutualConnections: Math.floor(Math.random() * 10), // Mock data
            employees: [
              { id: '1', name: 'Max Mustermann', title: 'HR Manager', profileImage: undefined },
              { id: '2', name: 'Anna Schmidt', title: 'Developer', profileImage: undefined }
            ], // Mock data
            openJobs: companyJobs.slice(0, 2).map(job => ({
              id: job.id,
              title: job.title,
              track: job.track,
              contractType: job.contract_type
            })),
            isFollowing: false
          };
        });
        setInterestingCompanies(formattedCompanies);
      }
    } catch (error) {
      console.error('Error loading interesting companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (personId: string) => {
    try {
      // TODO: Implement connection logic
      console.log('Connecting to person:', personId);
      alert('Vernetzung erfolgreich!');
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  const handleMessage = async (personId: string) => {
    try {
      // TODO: Implement messaging logic
      console.log('Messaging person:', personId);
      alert('Nachricht gesendet!');
    } catch (error) {
      console.error('Error messaging:', error);
    }
  };

  const handleFollow = async (id: string, type: 'person' | 'company') => {
    try {
      // TODO: Implement follow logic
      console.log('Following:', type, id);
      alert('Erfolgreich gefolgt!');
    } catch (error) {
      console.error('Error following:', error);
    }
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
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
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
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine interessanten Personen
              </h3>
              <p className="text-gray-600">
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
            <Building2 className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">
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
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine interessanten Unternehmen
              </h3>
              <p className="text-gray-600">
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
