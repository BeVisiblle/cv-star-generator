import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center py-20">
      <div className="w-full max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-sm text-green-400 font-medium tracking-wide uppercase mb-2">
            PLAN AUSWÄHLEN
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Wähle deinen Plan
          </h1>
          <p className="text-slate-300 text-lg mb-4">
            Preise basieren auf Unternehmensgröße ({data.companySize}) & Bedarf ({data.lookingFor.join(', ')})
          </p>
          <div className="text-sm text-white/60">
            zzgl. USt., monatlich kündbar
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl transition-all duration-200 hover:bg-white/15 ${
                  plan.highlighted ? 'ring-2 ring-green-400/50 border-green-400/30' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-400 text-black font-medium">
                      Empfohlen
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    <div className="text-4xl font-bold text-white mb-2">
                      {plan.price === 0 ? 'Kostenlos' : `€${plan.price}`}
                    </div>
                    {plan.price > 0 && (
                      <div className="text-white/60 text-sm">
                        pro Monat, netto
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handlePlanSelect(plan.id as 'free' | 'starter' | 'premium')}
                    variant={plan.highlighted ? "default" : "outline"}
                    className={`w-full h-12 ${
                      plan.highlighted 
                        ? 'bg-green-400 text-black hover:bg-green-500' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
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

        {/* Footer */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onPrev}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="text-sm text-white/60 text-center">
            Mit deiner Auswahl stimmst du unseren{' '}
            <a href="/agb" target="_blank" className="text-green-400 hover:underline">
              AGB
            </a>{' '}
            &{' '}
            <a href="/datenschutz" target="_blank" className="text-green-400 hover:underline">
              Datenschutz
            </a>{' '}
            zu.
          </div>
        </div>
      </div>
    </div>
  );
}