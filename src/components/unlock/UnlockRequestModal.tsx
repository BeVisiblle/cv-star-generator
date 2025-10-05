// Unlock Request Modal for Two-Step Profile Unlocking
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Coins, User, Mail, Phone, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { UnlockService, UnlockOptions, UnlockResult } from '@/services/unlockService';
import { JobsService, JobPosting } from '@/services/jobsService';
import { PipelineService } from '@/services/pipelineService';

interface UnlockRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profileName?: string;
  onUnlockSuccess?: () => void;
}

export default function UnlockRequestModal({
  isOpen,
  onClose,
  profileId,
  profileName = 'Kandidat',
  onUnlockSuccess
}: UnlockRequestModalProps) {
  const [activeTab, setActiveTab] = useState<'job' | 'general'>('job');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [generalInterest, setGeneralInterest] = useState(false);
  const [addToPipeline, setAddToPipeline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const unlockService = new UnlockService();
  const jobsService = new JobsService();
  const pipelineService = new PipelineService();

  useEffect(() => {
    if (isOpen) {
      loadJobs();
    }
  }, [isOpen]);

  const loadJobs = async () => {
    try {
      setJobsLoading(true);
      const companyJobs = await jobsService.listCompanyJobs();
      setJobs(companyJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Fehler beim Laden der Stellenausschreibungen');
    } finally {
      setJobsLoading(false);
    }
  };

  const handleUnlock = async (level: 'basic' | 'contact') => {
    try {
      setLoading(true);

      const options: UnlockOptions = {
        profileId,
        jobPostingId: activeTab === 'job' ? selectedJobId : undefined,
        generalInterest: activeTab === 'general' || generalInterest
      };

      let result: UnlockResult;
      if (level === 'basic') {
        result = await unlockService.unlockBasic(options);
      } else {
        result = await unlockService.unlockContact(options);
      }

      switch (result) {
        case 'unlocked_basic':
          toast.success('Basic-Level erfolgreich freigeschaltet!');
          break;
        case 'unlocked_contact':
          toast.success('Kontakt-Level erfolgreich freigeschaltet!');
          break;
        case 'already_basic':
          toast.info('Basic-Level bereits freigeschaltet');
          break;
        case 'already_contact':
          toast.info('Kontakt-Level bereits freigeschaltet');
          break;
        case 'insufficient_funds':
          toast.error('Nicht genügend Tokens im Wallet');
          break;
        case 'idempotent_duplicate':
          toast.info('Freischaltung bereits verarbeitet');
          break;
        case 'error':
          toast.error('Fehler bei der Freischaltung');
          break;
      }

      if (result === 'unlocked_basic' || result === 'unlocked_contact') {
        // Add to pipeline if requested
        if (addToPipeline) {
          try {
            await pipelineService.addToPipeline({
              profileId,
              jobPostingId: activeTab === 'job' ? selectedJobId : undefined
            });
            toast.success('Kandidat zur Pipeline hinzugefügt');
          } catch (error) {
            console.error('Error adding to pipeline:', error);
            toast.error('Fehler beim Hinzufügen zur Pipeline');
          }
        }

        onUnlockSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error during unlock:', error);
      toast.error('Fehler bei der Freischaltung');
    } finally {
      setLoading(false);
    }
  };

  const canUnlockBasic = !loading && (activeTab === 'general' || selectedJobId);
  const canUnlockContact = !loading && (activeTab === 'general' || selectedJobId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil freischalten
          </DialogTitle>
          <DialogDescription>
            Wählen Sie die gewünschte Freischaltungsstufe für {profileName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'job' | 'general')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="job">Stellenbezogen</TabsTrigger>
            <TabsTrigger value="general">Allgemeines Interesse</TabsTrigger>
          </TabsList>

          <TabsContent value="job" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stellenausschreibung auswählen</label>
              {jobsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Lädt...</span>
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
                  <p>Keine Stellenausschreibungen vorhanden</p>
                  <p className="text-xs mt-1">Erstellen Sie zuerst eine Stellenausschreibung</p>
                </div>
              ) : (
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stelle auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="general-interest"
                checked={generalInterest}
                onCheckedChange={(checked) => setGeneralInterest(!!checked)}
              />
              <label htmlFor="general-interest" className="text-sm font-medium">
                Ohne konkrete Stelle anfragen
              </label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Basic-Level</p>
                  <p className="text-sm text-muted-foreground">
                    Mehr Profildetails, Skills, Ausbildung
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                1 Token
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Kontakt-Level</p>
                  <p className="text-sm text-muted-foreground">
                    E-Mail, Telefon, Nachname, CV & Zertifikate
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                2 Tokens
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-to-pipeline"
              checked={addToPipeline}
              onCheckedChange={(checked) => setAddToPipeline(!!checked)}
            />
            <label htmlFor="add-to-pipeline" className="text-sm font-medium">
              Kandidat zur Pipeline hinzufügen
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => handleUnlock('basic')}
              disabled={!canUnlockBasic}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Basic (1 Token)'
              )}
            </Button>
            <Button
              onClick={() => handleUnlock('contact')}
              disabled={!canUnlockContact}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Kontakt (2 Tokens)'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
