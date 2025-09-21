import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CandidateProfileForm } from '@/components/profile/CandidateProfileForm';
import { ForYouJobs } from '@/components/discover/ForYouJobs';
import { MyApplications } from '@/components/applications/MyApplications';
import { createClient } from '@/lib/supabase';
import { User, Briefcase, Heart, Settings } from 'lucide-react';

interface Candidate {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  skills: any[];
  languages: any[];
  cv_url: string;
  created_at: string;
  company_id: string;
}

interface Application {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  job_title?: string;
  company_name?: string;
  sla_status?: string;
}

export default function CandidateProfile() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadCandidateData();
  }, []);

  const loadCandidateData = async () => {
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get candidate data
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (candidateData) {
        setCandidate(candidateData);

        // Load applications
        const { data: applicationsData } = await supabase
          .from('applications')
          .select('*')
          .eq('candidate_id', candidateData.id)
          .order('applied_at', { ascending: false });

        setApplications(applicationsData || []);
      } else {
        // Create candidate profile if it doesn't exist
        const { data: newCandidate } = await supabase
          .from('candidates')
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.email,
            company_id: '00000000-0000-0000-0000-000000000000'
          })
          .select()
          .single();

        if (newCandidate) {
          setCandidate(newCandidate);
        }
      }
    } catch (error) {
      console.error('Error loading candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      const supabase = createClient();
      
      if (!candidate) return;

      const { error } = await supabase
        .from('candidates')
        .update(updatedData)
        .eq('id', candidate.id);

      if (error) throw error;

      // Reload data
      await loadCandidateData();
      
      alert('Profil erfolgreich aktualisiert!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Fehler beim Aktualisieren des Profils');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Profil wird erstellt...</h2>
              <p className="text-gray-600">
                Dein Kandidaten-Profil wird erstellt. Bitte warte einen Moment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {candidate.full_name}
              </h1>
              <p className="text-gray-600">
                Kandidat
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profil-Vollständigkeit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    50%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bewerbungen</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Skills</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {candidate.skills?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verfügbar ab</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Sofort
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="foryou">Für dich</TabsTrigger>
            <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mein Profil</CardTitle>
                <CardDescription>
                  Verwalte deine persönlichen Informationen und Präferenzen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CandidateProfileForm 
                  initialData={candidate}
                  candidateId={candidate.id}
                  onSave={handleProfileUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="foryou" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Jobs für dich</CardTitle>
                <CardDescription>
                  Personalisierte Job-Empfehlungen basierend auf deinem Profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ForYouJobs candidateId={candidate.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Meine Bewerbungen</CardTitle>
                <CardDescription>
                  Verwalte deine Bewerbungen und verfolge den Status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MyApplications />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
                <CardDescription>
                  Verwalte deine Kontoeinstellungen und Präferenzen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Benachrichtigungen</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span>E-Mail Benachrichtigungen für neue Job-Empfehlungen</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span>E-Mail Benachrichtigungen für Bewerbungsupdates</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <span>Push-Benachrichtigungen</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Datenschutz</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span>Profil für Unternehmen sichtbar</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <span>Kontaktdaten für Recruiter freigeben</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Profil-Status</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          name="status" 
                          value="available"
                          defaultChecked={true}
                          className="rounded" 
                        />
                        <span>Verfügbar für neue Jobs</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          name="status" 
                          value="interviewing"
                          className="rounded" 
                        />
                        <span>Im Bewerbungsprozess</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          name="status" 
                          value="inactive"
                          className="rounded" 
                        />
                        <span>Profil pausieren</span>
                      </label>
                    </div>
                  </div>

                  <Button className="w-full">
                    Einstellungen speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
