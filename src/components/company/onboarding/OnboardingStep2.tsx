import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Star, Zap, Target } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep2Props {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Pricing configuration
const pricingConfig = {
  base_prices: { starter: 299, premium: 999 },
  company_size_multipliers: {
    '1-9': 0.8,
    '10-49': 1.0,
    '50-249': 1.25,
    '250-999': 1.5,
    '1000+': 2.0
  },
  looking_for_multipliers: {
    'Praktikanten': 1.00,
    'Auszubildende': 1.10,
    'Fachkräfte': 1.30
  }
};

export function OnboardingStep2({ data, updateData, onNext, onPrev }: OnboardingStep2Props) {
  const [calculatedPrices, setCalculatedPrices] = useState({ starter: 299, premium: 999 });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    calculatePrices();
  }, [data.companySize, data.lookingFor]);

  const calculatePrices = () => {
    const companySizeMultiplier = pricingConfig.company_size_multipliers[data.companySize as keyof typeof pricingConfig.company_size_multipliers] || 1.0;
    
    // Take highest multiplier for multiple selections
    const lookingForMultiplier = Math.max(
      ...data.lookingFor.map(item => 
        pricingConfig.looking_for_multipliers[item as keyof typeof pricingConfig.looking_for_multipliers] || 1.0
      ),
      1.0
    );

    const starter = Math.round(pricingConfig.base_prices.starter * companySizeMultiplier * lookingForMultiplier);
    const premium = Math.round(pricingConfig.base_prices.premium * companySizeMultiplier * lookingForMultiplier);

    setCalculatedPrices({ starter, premium });
  };

  const handlePlanSelect = async (planId: 'free' | 'starter' | 'premium') => {
    updateData({ selectedPlan: planId });

    if (planId === 'free') {
      // Free plan - proceed directly
      onNext();
      return;
    }

    // Paid plans - create Stripe checkout
    setLoading(true);
    try {
      const { data: sessionData, error } = await supabase.functions.invoke('create-subscription', {
        body: { 
          planId,
          companySize: data.companySize,
          lookingFor: data.lookingFor,
          calculatedPrice: calculatedPrices[planId as keyof typeof calculatedPrices]
        }
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
      console.error('Error creating checkout:', error);
      toast({
        title: "Fehler bei der Zahlungseinrichtung",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Zum Ausprobieren',
      features: [
        'Einmalig 3 Freischaltungen',
        'Kein Matching',
        'Keine Stellenanzeige'
      ],
      highlighted: false,
      icon: Target
    },
    {
      id: 'starter',
      name: 'Starter',
      price: calculatedPrices.starter,
      description: 'Für wachsende Teams',
      features: [
        'Monatlich 10 Freischaltungen',
        '1 Stellenanzeige aktiv',
        '2 Matchings garantiert',
        'Weitere Matchings dazubuchbar'
      ],
      highlighted: true,
      icon: Zap
    },
    {
      id: 'premium',
      name: 'Premium',
      price: calculatedPrices.premium,
      description: 'Für etablierte Unternehmen',
      features: [
        'Monatlich 50 Freischaltungen',
        '10 Stellenanzeigen',
        'Personalisiertes Matching per E-Mail',
        'Werbung schaltbar (Brand Ads)',
        'Priority Support'
      ],
      highlighted: false,
      icon: Star
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Wähle deinen Plan</h2>
        <p className="text-muted-foreground text-lg">
          Preise basieren auf Unternehmensgröße ({data.companySize}) & Bedarf ({data.lookingFor.join(', ')})
        </p>
        <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <span>zzgl. USt., monatlich kündbar</span>
          <Badge variant="outline" className="text-xs">
            Preis basiert auf Unternehmensgröße & Bedarf
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.highlighted ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Empfohlen
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? 'Kostenlos' : `€${plan.price}`}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-sm text-muted-foreground">
                      pro Monat, netto
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan.id as 'free' | 'starter' | 'premium')}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full h-11"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Wird geladen...
                    </>
                  ) : (
                    `${plan.name} wählen`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Mit deiner Auswahl stimmst du unseren{' '}
          <a href="/agb" target="_blank" className="text-primary hover:underline">
            AGB
          </a>{' '}
          &{' '}
          <a href="/datenschutz" target="_blank" className="text-primary hover:underline">
            Datenschutz
          </a>{' '}
          zu.
        </div>
      </div>
    </div>
  );
}