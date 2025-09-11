import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PenTool, Calendar, FileText, BarChart3, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommunityComposer } from '@/components/community/CommunityComposer';
import JobShareDialog from '@/components/company/jobs/JobShareDialog';

interface CommunityComposerTeaserProps {
  onOpenComposer: () => void;
}

export default function CommunityComposerTeaser({ onOpenComposer }: CommunityComposerTeaserProps) {
  const { user, profile } = useAuth();
  const { company } = useCompany();
  const [composerOpen, setComposerOpen] = useState(false);
  const [jobShareOpen, setJobShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('text');

  // Fetch company jobs for job sharing
  const { data: jobs = [] } = useQuery({
    queryKey: ['company-jobs', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!company?.id
  });

  const postTypes = [
    { 
      value: 'text', 
      label: 'Text', 
      icon: PenTool, 
      description: 'Teile deine Gedanken' 
    },
    { 
      value: 'event', 
      label: 'Event', 
      icon: Calendar, 
      description: 'Erstelle ein Event' 
    },
    { 
      value: 'document', 
      label: 'Dokument', 
      icon: FileText, 
      description: 'Teile ein Dokument' 
    },
    { 
      value: 'poll', 
      label: 'Umfrage', 
      icon: BarChart3, 
      description: 'Erstelle eine Umfrage' 
    },
    { 
      value: 'job', 
      label: 'Job', 
      icon: Briefcase, 
      description: 'Teile eine Stellenausschreibung' 
    },
  ];

  const handlePostTypeClick = (type: string) => {
    if (type === 'job') {
      setJobShareOpen(true);
    } else {
      setActiveTab(type);
      setComposerOpen(true);
    }
  };

  const displayName = profile?.vorname 
    ? `${profile.vorname} ${profile.nachname || ''}`.trim() 
    : user?.email || 'Nutzer';

  const avatarUrl = profile?.avatar_url;
  const initials = profile?.vorname 
    ? `${profile.vorname[0]}${profile.nachname?.[0] || ''}` 
    : user?.email?.[0] || 'N';

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-muted-foreground" 
              onClick={() => setComposerOpen(true)}
            >
              Was möchtest du teilen?
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {postTypes.map((type) => (
              <Button
                key={type.value}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => handlePostTypeClick(type.value)}
                disabled={type.value === 'job' && (!company || jobs.length === 0)}
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      {composerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Neuer Beitrag</h2>
              <Button variant="ghost" size="sm" onClick={() => setComposerOpen(false)}>×</Button>
            </div>
            <div className="overflow-y-auto max-h-[70vh] p-4">
              <CommunityComposer />
            </div>
          </div>
        </div>
      )}

      {jobs.length > 0 && company && (
        <JobShareDialog
          open={jobShareOpen}
          onOpenChange={setJobShareOpen}
          job={jobs[0]} // For now, use the first job. Could expand to show job selector
          companyId={company.id}
        />
      )}
    </>
  );
}