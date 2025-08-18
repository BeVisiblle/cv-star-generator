import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CompanyAutocomplete } from "@/components/shared/CompanyAutocomplete";
import { CompanyOption } from "@/hooks/useSearchCompanies";
import { useUpdateProfile, useStartEmploymentRequest, useWithdrawEmploymentRequest } from "@/hooks/mutations/employment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Building2, Send, X } from "lucide-react";

interface ProfileEmployerSectionProps {
  profileData?: {
    headline?: string | null;
    employer_free?: string | null;
    employer_slogan?: string | null;
  };
}

export function ProfileEmployerSection({ profileData }: ProfileEmployerSectionProps) {
  const { user, refetchProfile } = useAuth();
  const [pickedCompany, setPickedCompany] = useState<CompanyOption | null>(null);
  const [formData, setFormData] = useState({
    headline: profileData?.headline || "",
    employer_free: profileData?.employer_free || "",
    employer_slogan: profileData?.employer_slogan || "",
  });

  // Update employer_free when company is picked or cleared
  useEffect(() => {
    if (pickedCompany) {
      setFormData(prev => ({ ...prev, employer_free: pickedCompany.name }));
    }
  }, [pickedCompany]);

  const updateProfile = useUpdateProfile();
  const startRequest = useStartEmploymentRequest();
  const withdrawRequest = useWithdrawEmploymentRequest();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;

    updateProfile.mutate({
      userId: user.id,
      headline: formData.headline || null,
      employer_free: formData.employer_free || null,
      employer_slogan: formData.employer_slogan || null,
    }, {
      onSuccess: () => {
        // Immediately refresh profile to update header/chips
        refetchProfile();
      }
    });
  }

  // Handle company selection - sets both picked company and employer_free text
  function handleCompanyPick(company: CompanyOption | null) {
    setPickedCompany(company);
    if (company) {
      setFormData(prev => ({ ...prev, employer_free: company.name }));
    }
  }

  // Handle manual employer text changes
  function handleEmployerTextChange(text: string) {
    setFormData(prev => ({ ...prev, employer_free: text }));
    // Clear picked company if user manually changes text
    if (pickedCompany && text !== pickedCompany.name) {
      setPickedCompany(null);
    }
  }

  function sendRequest() {
    if (!pickedCompany || !user?.id) return;
    startRequest.mutate({
      userId: user.id,
      companyId: pickedCompany.id,
    });
  }

  function withdrawEmploymentRequest() {
    if (!pickedCompany || !user?.id) return;
    withdrawRequest.mutate({
      userId: user.id,
      companyId: pickedCompany.id,
    });
  }

  const isLoading = updateProfile.isPending || startRequest.isPending || withdrawRequest.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Arbeitgeber & Beruf</CardTitle>
        </div>
        <CardDescription>
          Gib deinen aktuellen oder gewünschten Beruf und Arbeitgeber an
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Headline/Job Title */}
          <div className="space-y-2">
            <Label htmlFor="headline">Berufsbezeichnung / Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
              placeholder="z.B. Azubi Fachinformatiker, Mediengestalter, ..."
            />
          </div>

          {/* Integrated company search/free text input */}
          <CompanyAutocomplete 
            onPick={handleCompanyPick}
            value={pickedCompany}
            label="Arbeitgeber"
            placeholder="Unternehmen suchen oder eingeben..."
            defaultLabel={formData.employer_free}
            onTextChange={handleEmployerTextChange}
            currentText={formData.employer_free}
          />

          {/* Employer slogan */}
          <div className="space-y-2">
            <Label htmlFor="employer_slogan">Slogan / Zusatz</Label>
            <Textarea
              id="employer_slogan"
              rows={2}
              value={formData.employer_slogan}
              onChange={(e) => setFormData(prev => ({ ...prev, employer_slogan: e.target.value }))}
              placeholder="Kurzer Slogan oder Zusatzinfo zum Arbeitgeber"
            />
          </div>

          {pickedCompany && (
            <>
              <Separator />

              {/* Company verification section - only show if company is selected */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Arbeitgeber verifizieren</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Du hast ein verifiziertes Unternehmen ausgewählt. Beantrage eine 
                    Beschäftigungsbestätigung, um als Mitarbeiter verifiziert zu werden.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  {pickedCompany.logo_url ? (
                    <img 
                      src={pickedCompany.logo_url} 
                      alt="" 
                      className="h-8 w-8 rounded object-cover" 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {pickedCompany.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-sm">{pickedCompany.name}</span>
                </div>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              Profil speichern
            </Button>

            {pickedCompany && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  disabled={isLoading || startRequest.isPending}
                  onClick={sendRequest}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {startRequest.isPending ? "Sende..." : "Antrag senden"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || withdrawRequest.isPending}
                  onClick={withdrawEmploymentRequest}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {withdrawRequest.isPending ? "Zurückziehen..." : "Zurückziehen"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}