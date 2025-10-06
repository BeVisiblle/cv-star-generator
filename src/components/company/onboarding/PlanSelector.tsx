import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { OnboardingPopup } from './OnboardingPopup';

interface PlanSelectorProps {
  selectedPlanId?: string;
  onNext: () => void;
}

const plans = [
  {
    id: 'base',
    name: 'Base',
    price: '79€',
    period: '/Monat',
    yearlyPrice: '790€/Jahr',
    features: [
      '3 aktive Stellenanzeigen',
      'Zugriff auf Talentpool',
      'Basis-Matching',
      'E-Mail Support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '129€',
    period: '/Monat',
    yearlyPrice: '1.290€/Jahr',
    features: [
      '10 aktive Stellenanzeigen',
      'Erweiterte Matching-Algorithmen',
      'Prioritäts-Support',
      'Analytics Dashboard',
      'Team-Verwaltung'
    ],
    highlighted: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '249€',
    period: '/Monat',
    yearlyPrice: '2.490€/Jahr',
    features: [
      'Unbegrenzte Stellenanzeigen',
      'Dedizierter Account Manager',
      'Custom Branding',
      'API-Zugang',
      'White-Label Option'
    ]
  }
];

export function PlanSelector({ selectedPlanId, onNext }: PlanSelectorProps) {
  // If free plan, skip this step
  if (selectedPlanId === 'free') {
    onNext();
    return null;
  }

  const handleSelectPlan = (planId: string) => {
    // TODO: Implement Stripe Checkout
    console.log('Selected plan:', planId);
    // For now, just proceed to next step
    onNext();
  };

  return (
    <OnboardingPopup>
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-2">Wählen Sie Ihren Plan</h2>
        <p className="text-muted-foreground mb-6">
          Starten Sie jetzt mit dem für Sie passenden Plan
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {plans.map(plan => (
            <Card
              key={plan.id}
              className={`p-6 relative ${
                plan.highlighted ? 'border-primary shadow-lg' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Beliebt
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
                <p className="text-sm text-muted-foreground mt-1">{plan.yearlyPrice}</p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                variant={plan.highlighted ? 'default' : 'outline'}
                className="w-full"
              >
                Jetzt starten
              </Button>
            </Card>
          ))}
        </div>

        <Button
          onClick={onNext}
          variant="ghost"
          className="w-full"
        >
          Später entscheiden
        </Button>
      </div>
    </OnboardingPopup>
  );
}
