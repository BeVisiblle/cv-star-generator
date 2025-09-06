import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Shield, Check } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep3Props {
  data: OnboardingData;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function OnboardingStep3({ data, onNext, onPrev, onSkip }: OnboardingStep3Props) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Skip payment setup for free plan
  if (data.selectedPlan === 'free') {
    React.useEffect(() => {
      onSkip();
    }, []);
    return null;
  }

  const handleStripeSetup = async () => {
    setLoading(true);
    
    try {
      const { data: sessionData, error } = await supabase.functions.invoke('create-subscription', {
        body: { planId: data.selectedPlan }
      });

      if (error) throw error;

      if (sessionData?.url) {
        // Open Stripe checkout in new tab
        window.open(sessionData.url, '_blank');
        
        // For demo purposes, proceed to next step after a delay
        setTimeout(() => {
          onNext();
        }, 2000);
      }
    } catch (error) {
      console.error('Error setting up Stripe:', error);
      toast({
        title: "Fehler bei der Zahlungseinrichtung",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const planNames = {
    starter: 'Starter-Plan',
    premium: 'Premium-Plan',
    enterprise: 'Enterprise-Plan'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center py-20">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-sm text-green-400 font-medium tracking-wide uppercase mb-2">
            ZAHLUNGSDETAILS
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Sichere Zahlung
          </h1>
          <p className="text-slate-300 text-lg">
            Für {planNames[data.selectedPlan as keyof typeof planNames]} benötigen wir eine Zahlungsmethode.
          </p>
        </div>

        {/* Payment Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl mb-8">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Sichere Zahlung mit Stripe</h3>
              <p className="text-white/60">Ihre Zahlungsdaten werden sicher verarbeitet</p>
            </div>

            {/* Security Features */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-white/80 text-sm">SSL-verschlüsselt</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-white/80 text-sm">PCI-DSS konform</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-white/80 text-sm">Keine Kartendaten gespeichert</span>
              </div>
            </div>
            
            <Button 
              onClick={handleStripeSetup}
              disabled={loading}
              className="w-full bg-green-400 text-black hover:bg-green-500 py-3"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Wird geladen...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Kreditkarte hinzufügen
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onNext}
              className="text-white/60 hover:text-white"
            >
              Später einrichten
            </Button>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={onPrev}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
      </div>
    </div>
  );
}