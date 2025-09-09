import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Check, Loader2 } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    jobPosts: 2,
    tokens: 0,
    features: ['2 Job-Posts', 'Basis-Support', 'Standard-Features'],
    current: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 299,
    jobPosts: 10,
    tokens: 100,
    features: ['10 Job-Posts', '100 Tokens', 'Priority-Support', 'Erweiterte Features'],
    current: false,
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 799,
    jobPosts: 50,
    tokens: 400,
    features: ['50 Job-Posts', '400 Tokens', 'Premium-Support', 'Alle Features', 'API-Zugang'],
    current: false,
  },
];

export function PlanUpgrade() {
  const { company } = useCompany();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mark current plan
  const plansWithCurrent = PLANS.map(plan => ({
    ...plan,
    current: false // Disable for now since plan property doesn't exist in Company type
  }));

  const handleUpgrade = async () => {
    if (!company?.id) return;

    setIsProcessing(true);
    try {
      // Create subscription checkout
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          company_id: company.id,
          plan_id: selectedPlan.id,
          price_cents: selectedPlan.price * 100,
        }
      });

      if (error) throw error;

      // Redirect to checkout
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('Keine Checkout-URL erhalten');
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Crown className="h-4 w-4 mr-2" />
          Plan upgraden
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Plan upgraden
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Plan Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Aktueller Plan:</span>
              <Badge variant="outline" className="ml-2">
                Starter
              </Badge>
            </div>
          </div>

          {/* Plan Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansWithCurrent.map((plan) => (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan.id === plan.id 
                    ? 'ring-2 ring-primary' 
                    : 'hover:shadow-md'
                } ${plan.popular ? 'border-primary' : ''} ${
                  plan.current ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !plan.current && setSelectedPlan(plan)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex gap-2">
                      {plan.popular && (
                        <Badge variant="default">Beliebt</Badge>
                      )}
                      {plan.current && (
                        <Badge variant="outline">Aktuell</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">€{plan.price}</div>
                  <div className="text-sm text-muted-foreground mb-4">pro Monat</div>
                  
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upgrade Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleUpgrade}
              disabled={isProcessing || selectedPlan.current}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : selectedPlan.current ? (
                'Aktueller Plan'
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  €{selectedPlan.price}/Monat upgraden
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground">
            <p>• Sofortige Aktivierung nach Zahlung</p>
            <p>• Jederzeit kündbar</p>
            <p>• Sichere Zahlung über Stripe</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
