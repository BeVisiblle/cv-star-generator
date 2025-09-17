import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CompanyCard } from '@/components/discover/CompanyCard';
import { createClient } from '@/lib/supabase';
import { Search, Building2, Filter, ArrowLeft } from 'lucide-react';

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

export default function DiscoverCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
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
        .limit(50);

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
            openJobs: companyJobs.slice(0, 3).map(job => ({
              id: job.id,
              title: job.title,
              track: job.track,
              contractType: job.contract_type
            })),
            isFollowing: false
          };
        });
        setCompanies(formattedCompanies);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (companyId: string) => {
    try {
      // TODO: Implement follow logic
      console.log('Following company:', companyId);
      alert('Unternehmen erfolgreich gefolgt!');
    } catch (error) {
      console.error('Error following company:', error);
    }
  };

  const handleViewProfile = (companyId: string) => {
    window.location.href = `/company/${companyId}`;
  };

  const handleViewEmployee = (employeeId: string) => {
    window.location.href = `/u/${employeeId}`;
  };

  const handleViewJob = (jobId: string) => {
    window.location.href = `/jobs#${jobId}`;
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Interessante Unternehmen
            </h1>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Unternehmen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Unternehmen gefunden
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'Versuche einen anderen Suchbegriff' : 'Lade interessante Unternehmen...'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onFollow={() => handleFollow(company.id)}
                onViewProfile={() => handleViewProfile(company.id)}
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