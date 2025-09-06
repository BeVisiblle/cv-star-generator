import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Users, Check } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep5Props {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export function OnboardingStep5({ data, updateData, onComplete, onPrev }: OnboardingStep5Props) {
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { toast } = useToast();

  const addTeamEmail = () => {
    if (!newEmail.trim()) {
      setEmailError('E-Mail ist erforderlich');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('Ungültige E-Mail-Adresse');
      return;
    }
    
    if (data.teamEmails.includes(newEmail)) {
      setEmailError('E-Mail bereits hinzugefügt');
      return;
    }
    
    updateData({ teamEmails: [...data.teamEmails, newEmail] });
    setNewEmail('');
    setEmailError('');
  };

  const removeTeamEmail = (email: string) => {
    updateData({ teamEmails: data.teamEmails.filter(e => e !== email) });
  };

  const handleComplete = () => {
    toast({
      title: "Willkommen!",
      description: "Ihr Unternehmensprofil wurde erfolgreich erstellt.",
    });
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Team einladen</h2>
        <p className="text-muted-foreground text-lg">
          Laden Sie Kollegen ein, um gemeinsam Kandidaten zu finden (optional)
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Team Invitation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team-Mitglieder einladen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Email Input */}
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="teamEmail">E-Mail-Adresse</Label>
                <Input
                  id="teamEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTeamEmail()}
                  placeholder="kollege@unternehmen.de"
                  className={emailError ? "border-destructive" : ""}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
              <div className="pt-7">
                <Button onClick={addTeamEmail}>
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
            </div>

            {/* Team Email List */}
            {data.teamEmails.length > 0 && (
              <div className="space-y-3">
                <Label>Eingeladene Team-Mitglieder ({data.teamEmails.length})</Label>
                <div className="space-y-2">
                  {data.teamEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamEmail(email)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Was passiert als nächstes?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ihre Kollegen erhalten eine Einladung per E-Mail</li>
                    <li>• Sie können direkt auf Ihr Unternehmensprofil zugreifen</li>
                    <li>• Gemeinsam können Sie Kandidaten suchen und verwalten</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Unternehmen:</span>
                <p className="text-muted-foreground">{data.companyName}</p>
              </div>
              <div>
                <span className="font-medium">Plan:</span>
                <Badge variant={data.selectedPlan === 'free' ? 'outline' : 'default'}>
                  {data.selectedPlan === 'free' ? 'Free' : data.selectedPlan === 'starter' ? 'Starter' : 'Premium'}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Kontakt:</span>
                <p className="text-muted-foreground">{data.firstName} {data.lastName}</p>
              </div>
              <div>
                <span className="font-medium">Suchen nach:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.lookingFor.map(item => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSkip}>
            Später erledigen
          </Button>
          <Button onClick={handleComplete} className="px-8">
            Fertig & Profil ansehen
          </Button>
        </div>
      </div>
    </div>
  );
}