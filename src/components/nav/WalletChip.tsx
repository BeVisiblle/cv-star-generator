// Wallet Chip Component for displaying token balance
import React, { useState, useEffect } from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WalletService } from '@/services/walletService';
import { TokenTransaction } from '@/services/walletService';

interface WalletChipProps {
  className?: string;
}

export default function WalletChip({ className = '' }: WalletChipProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);

  const walletService = new WalletService();

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const wallet = await walletService.getWallet();
      if (wallet) {
        setBalance(wallet.balance);
      } else {
        // Create wallet if it doesn't exist
        const newWallet = await walletService.ensureWallet();
        setBalance(newWallet.balance);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const txns = await walletService.getTransactions(10);
      setTransactions(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleTransactionClick = () => {
    setShowTransactions(!showTransactions);
    if (!showTransactions) {
      loadTransactions();
    }
  };

  const formatTransactionReason = (reason: string) => {
    switch (reason) {
      case 'unlock_basic':
        return 'Basic freigeschaltet';
      case 'unlock_contact':
        return 'Kontakt freigeschaltet';
      case 'purchase':
        return 'Tokens gekauft';
      case 'manual_adjust':
        return 'Manuelle Anpassung';
      default:
        return reason;
    }
  };

  const formatTransactionDelta = (delta: number) => {
    return delta > 0 ? `+${delta}` : `${delta}`;
  };

  if (loading) {
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Lädt...</span>
      </Badge>
    );
  }

  return (
    <Popover open={showTransactions} onOpenChange={setShowTransactions}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
          onClick={handleTransactionClick}
        >
          <Coins className="h-4 w-4" />
          <span className="font-medium">{balance ?? 0}</span>
          <span className="text-muted-foreground">Tokens</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Token-Wallet</h3>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {balance ?? 0} Tokens
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Letzte Transaktionen</h4>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Transaktionen vorhanden</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{formatTransactionReason(tx.reason)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className={`font-mono ${
                      tx.delta > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatTransactionDelta(tx.delta)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // TODO: Implement token purchase flow
                console.log('Purchase tokens clicked');
              }}
            >
              Tokens kaufen
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
