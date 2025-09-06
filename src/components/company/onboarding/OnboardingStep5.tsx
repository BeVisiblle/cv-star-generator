import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Users, Check, Building2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center py-20">
      <div className="w-full max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-sm text-green-400 font-medium tracking-wide uppercase mb-2">
            TEAM EINLADEN
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Laden Sie Ihr Team ein
          </h1>
          <p className="text-slate-300 text-lg">
            Arbeiten Sie gemeinsam an der Kandidatensuche (optional)
          </p>
        </div>

        <div className="space-y-8">
          {/* Team Invitation Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Team-Mitglieder einladen</h3>
              </div>

              {/* Add Email Input */}
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="teamEmail" className="text-white">E-Mail-Adresse</Label>
                  <Input
                    id="teamEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTeamEmail()}
                    placeholder="kollege@unternehmen.de"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                  {emailError && (
                    <p className="text-sm text-red-400">{emailError}</p>
                  )}
                </div>
                <div className="pt-7">
                  <Button 
                    onClick={addTeamEmail}
                    className="bg-green-400 text-black hover:bg-green-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Hinzufügen
                  </Button>
                </div>
              </div>

              {/* Team Email List */}
              {data.teamEmails.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-white">Eingeladene Team-Mitglieder ({data.teamEmails.length})</Label>
                  <div className="space-y-2">
                    {data.teamEmails.map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-white text-sm">{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamEmail(email)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-black" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-medium">Was passiert als nächstes?</p>
                    <ul className="text-white/80 text-sm space-y-1">
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
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Zusammenfassung</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="font-medium text-white">Unternehmen:</span>
                  <p className="text-white/80">{data.companyName}</p>
                </div>
                <div>
                  <span className="font-medium text-white">Plan:</span>
                  <Badge variant={data.selectedPlan === 'free' ? 'outline' : 'default'} className="mt-1">
                    {data.selectedPlan === 'free' ? 'Free' : data.selectedPlan === 'starter' ? 'Starter' : 'Premium'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-white">Kontakt:</span>
                  <p className="text-white/80">{data.firstName} {data.lastName}</p>
                </div>
                <div>
                  <span className="font-medium text-white">Suchen nach:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.lookingFor.map(item => (
                      <Badge key={item} variant="outline" className="text-xs border-white/20 text-white/80">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8">
          <Button 
            variant="outline" 
            onClick={onPrev}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Später erledigen
            </Button>
            <Button 
              onClick={handleComplete} 
              className="bg-green-400 text-black hover:bg-green-500 px-8"
            >
              Fertig & Profil ansehen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}