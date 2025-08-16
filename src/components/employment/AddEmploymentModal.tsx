import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequestEmployment } from '@/hooks/useEmployment';
import { Building2, Search } from 'lucide-react';

interface AddEmploymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEmploymentModal({ open, onOpenChange }: AddEmploymentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string; logo_url?: string | null } | null>(null);
  
  const requestEmployment = useRequestEmployment();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, logo_url')
        .ilike('name', `%${searchTerm}%`)
        .limit(10);
        
      if (error) throw error;
      return data ?? [];
    },
    enabled: searchTerm.length > 2,
  });

  const handleSubmit = async () => {
    if (!selectedCompany) return;
    
    try {
      await requestEmployment.mutateAsync({ company_id: selectedCompany.id });
      onOpenChange(false);
      setSelectedCompany(null);
      setSearchTerm('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aktuelles Unternehmen hinzufügen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="company-search">Unternehmen suchen</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="company-search"
                placeholder="Name des Unternehmens eingeben"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {searchTerm.length > 2 && (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Suche...
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Keine Unternehmen gefunden
                </div>
              ) : (
                companies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                      ${selectedCompany?.id === company.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={company.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                    )}
                    <span className="font-medium">{company.name}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedCompany && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                {selectedCompany.logo_url ? (
                  <img 
                    src={selectedCompany.logo_url} 
                    alt={selectedCompany.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{selectedCompany.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Bestätigung erforderlich
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCompany || requestEmployment.isPending}
              className="flex-1"
            >
              {requestEmployment.isPending ? 'Wird gesendet...' : 'Anfrage senden'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}