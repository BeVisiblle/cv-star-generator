import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useJobPostingLimits } from '@/hooks/useJobPostingLimits';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Coins, CreditCard, Loader2 } from 'lucide-react';

const TOKEN_PACKAGES = [
  { tokens: 10, price: 12.00, popular: false },
  { tokens: 50, price: 50.00, popular: true },
  { tokens: 100, price: 80.00, popular: false },
  { tokens: 500, price: 300.00, popular: false },
];

export function TokenPurchase() {
  const { company } = useCompany();
  const { tokenBalance, remainingJobPosts } = useJobPostingLimits();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(TOKEN_PACKAGES[1]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!company?.id) return;

    setIsProcessing(true);
    try {
      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-token-checkout', {
        body: {
          company_id: company.id,
          tokens: selectedPackage.tokens,
          price_cents: selectedPackage.price * 100,
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
      console.error('Purchase error:', error);
      toast({
        title: "Kauf fehlgeschlagen",
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
          <Coins className="h-4 w-4 mr-2" />
          Tokens kaufen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Tokens kaufen
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Verbleibende Tokens:</span>
<Badge variant={tokenBalance > 0 ? "default" : "destructive"} className="ml-2">
  {tokenBalance}
</Badge>
              </div>
              <div>
                <span className="font-medium">Verbleibende Job-Posts:</span>
                <Badge variant={remainingJobPosts > 0 ? "default" : "destructive"} className="ml-2">
                  {remainingJobPosts}
                </Badge>
              </div>
            </div>
          </div>

          {/* Token Packages */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Token-Pakete auswählen</Label>
            <div className="grid grid-cols-2 gap-4">
              {TOKEN_PACKAGES.map((pkg) => (
                <Card 
                  key={pkg.tokens}
                  className={`cursor-pointer transition-all ${
                    selectedPackage.tokens === pkg.tokens 
                      ? 'ring-2 ring-primary' 
                      : 'hover:shadow-md'
                  } ${pkg.popular ? 'border-primary' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.tokens} Tokens</CardTitle>
                      {pkg.popular && (
                        <Badge variant="default">Beliebt</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{pkg.price.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      €{(pkg.price / pkg.tokens).toFixed(2)} pro Token
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Purchase Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handlePurchase}
              disabled={isProcessing}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  €{selectedPackage.price.toFixed(2)} zahlen
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground">
            <p>• 1 Token = 1 Job-Post</p>
            <p>• Tokens verfallen nicht</p>
            <p>• Sichere Zahlung über Stripe</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
