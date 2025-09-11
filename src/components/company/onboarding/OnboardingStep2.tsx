import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';

interface OnboardingStep2Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function OnboardingStep2({ data, updateData, onNext, onPrev }: OnboardingStep2Props) {
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '0€',
      description: '2 Credits zum Testen',
      features: [
        'Keine Kontaktdaten',
        'Kein Nachkauf'
      ],
      highlighted: false,
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '299€',
      period: '/Monat (netto)',
      description: 'Profile + Kontaktdaten freischalten',
      features: [
        '5 Anforderungsprofile',
        '40 Credits pro Monat',
        '15% Rabatt auf Credits',
        '1 Recruiter Seat',
        '3 Standorte'
      ],
      highlighted: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '889€',
      period: '/Monat (netto)',
      description: 'Mehr Credits + Employer Branding',
      features: [
        '15 Anforderungsprofile',
        '120 Credits pro Monat',
        '25% Rabatt auf Credits',
        '5 Recruiter Seats',
        '8 Standorte',
        'Priorisierte Sichtbarkeit'
      ],
      highlighted: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'ab 1.000€',
      period: '/Monat',
      description: 'Individuell ab 1.000 €/Monat',
      features: [
        'Individuelle Lösung',
        'Persönlicher Support',
        'Custom Integration'
      ],
      highlighted: false,
      isEnterprise: true,
    },
  ];

  const handlePlanSelect = (planId: string) => {
    updateData({ selectedPlan: planId as OnboardingData['selectedPlan'] });
    
    if (planId === 'enterprise') {
      // Handle enterprise plan separately (open calendar, etc.)
      window.open('https://calendly.com/company', '_blank');
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Wählen Sie Ihren Plan</h2>
        <p className="text-muted-foreground mb-4">
          Credits sind unsere Währung für Profile und Kontaktdaten.
        </p>
        <p className="text-sm text-muted-foreground">
          💡 <strong>3 Credits</strong> benötigt pro Profil: 1 für Freischaltung + 2 für Kontaktdaten
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              plan.highlighted 
                ? 'border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))]' 
                : 'hover:border-[hsl(var(--accent-hover))]'
            } ${data.selectedPlan === plan.id ? 'ring-2 ring-[hsl(var(--accent))]' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[hsl(var(--accent))] text-white">
                Beliebt
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="text-2xl font-bold">
                {plan.price}
                {plan.period && <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>}
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  plan.isEnterprise 
                    ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground' 
                    : plan.highlighted 
                      ? 'bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white'
                      : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {plan.isEnterprise ? "Let's Talk" : "Plan wählen"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
      </div>
    </div>
  );
}