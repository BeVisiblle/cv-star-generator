import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, Info } from 'lucide-react';
import { JobFormData } from '../JobCreationWizard';

interface JobSalaryStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
}

const SALARY_INTERVALS = [
  { value: 'hour', label: 'pro Stunde' },
  { value: 'month', label: 'pro Monat' },
  { value: 'year', label: 'pro Jahr' },
];

const CURRENCIES = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'CHF', label: 'Schweizer Franken (CHF)' },
];

// Mock market data - in real app, this would come from an API
const getMarketData = (title: string, location: string) => {
  // Simplified mock data
  const baseRanges = {
    'internship': { min: 400, max: 800, median: 600 },
    'apprenticeship': { min: 500, max: 1200, median: 850 },
    'professional': { min: 2500, max: 5500, median: 3800 },
  };

  return baseRanges.professional; // Default to professional for demo
};

export default function JobSalaryStep({ formData, updateFormData, company }: JobSalaryStepProps) {
  const marketData = getMarketData(formData.title, formData.city);
  
  const handleSetToMedian = () => {
    updateFormData({
      salary_min: Math.round(marketData.median * 0.9),
      salary_max: Math.round(marketData.median * 1.1),
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: formData.salary_currency || 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isApprenticeshipSalary = formData.job_type === 'apprenticeship';

  return (
    <div className="space-y-6">
      {/* Salary Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Vergütung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Currency and Interval */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Währung</Label>
              <Select 
                value={formData.salary_currency} 
                onValueChange={(value) => updateFormData({ salary_currency: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Intervall</Label>
              <Select 
                value={formData.salary_interval} 
                onValueChange={(value: 'hour' | 'month' | 'year') => updateFormData({ salary_interval: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_INTERVALS.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value}>
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          {!isApprenticeshipSalary && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary_min">Mindestgehalt</Label>
                <Input
                  id="salary_min"
                  type="number"
                  min="0"
                  value={formData.salary_min || ''}
                  onChange={(e) => updateFormData({ salary_min: parseInt(e.target.value) || undefined })}
                  placeholder="z.B. 2500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="salary_max">Maximalgehalt</Label>
                <Input
                  id="salary_max"
                  type="number"
                  min="0"
                  value={formData.salary_max || ''}
                  onChange={(e) => updateFormData({ salary_max: parseInt(e.target.value) || undefined })}
                  placeholder="z.B. 3500"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Apprenticeship Salary Years */}
          {isApprenticeshipSalary && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary_year_1">1. Ausbildungsjahr</Label>
                <Input
                  id="salary_year_1"
                  type="number"
                  min="0"
                  value={formData.apprenticeship?.salary_year_1_cents ? formData.apprenticeship.salary_year_1_cents / 100 : ''}
                  onChange={(e) => updateFormData({
                    apprenticeship: {
                      ...formData.apprenticeship,
                      salary_year_1_cents: parseInt(e.target.value) * 100 || undefined
                    }
                  })}
                  placeholder="z.B. 650"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="salary_year_2">2. Ausbildungsjahr</Label>
                <Input
                  id="salary_year_2"
                  type="number"
                  min="0"
                  value={formData.apprenticeship?.salary_year_2_cents ? formData.apprenticeship.salary_year_2_cents / 100 : ''}
                  onChange={(e) => updateFormData({
                    apprenticeship: {
                      ...formData.apprenticeship,
                      salary_year_2_cents: parseInt(e.target.value) * 100 || undefined
                    }
                  })}
                  placeholder="z.B. 750"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="salary_year_3">3. Ausbildungsjahr</Label>
                <Input
                  id="salary_year_3"
                  type="number"
                  min="0"
                  value={formData.apprenticeship?.salary_year_3_cents ? formData.apprenticeship.salary_year_3_cents / 100 : ''}
                  onChange={(e) => updateFormData({
                    apprenticeship: {
                      ...formData.apprenticeship,
                      salary_year_3_cents: parseInt(e.target.value) * 100 || undefined
                    }
                  })}
                  placeholder="z.B. 850"
                  className="mt-1"
                />
              </div>
              {formData.apprenticeship?.duration_months && formData.apprenticeship.duration_months > 36 && (
                <div>
                  <Label htmlFor="salary_year_4">4. Ausbildungsjahr</Label>
                  <Input
                    id="salary_year_4"
                    type="number"
                    min="0"
                    value={formData.apprenticeship?.salary_year_4_cents ? formData.apprenticeship.salary_year_4_cents / 100 : ''}
                    onChange={(e) => updateFormData({
                      apprenticeship: {
                        ...formData.apprenticeship,
                        salary_year_4_cents: parseInt(e.target.value) * 100 || undefined
                      }
                    })}
                    placeholder="z.B. 950"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Data */}
      {!isApprenticeshipSalary && formData.title && formData.city && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Marktvergleich
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Marktspanne für "{formData.title}"</p>
                  <p className="text-sm text-muted-foreground">in {formData.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(marketData.min)} - {formatCurrency(marketData.max)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Median: {formatCurrency(marketData.median)}
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleSetToMedian}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Auf Median setzen ({formatCurrency(marketData.median)})
              </Button>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Transparenz-Hinweis</p>
                  <p>Ein klarer Gehaltsbereich erhöht Bewerbungen um bis zu 30%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Salary Preview */}
      {(formData.salary_min || formData.salary_max || isApprenticeshipSalary) && (
        <Card>
          <CardHeader>
            <CardTitle>Vergütungsübersicht</CardTitle>
          </CardHeader>
          <CardContent>
            {!isApprenticeshipSalary ? (
              <div className="space-y-2">
                {formData.salary_min && formData.salary_max && (
                  <div className="flex justify-between items-center">
                    <span>Gehaltsbereich:</span>
                    <Badge variant="outline" className="text-sm">
                      {formatCurrency(formData.salary_min)} - {formatCurrency(formData.salary_max)} {
                        formData.salary_interval === 'hour' ? '/Std.' :
                        formData.salary_interval === 'month' ? '/Monat' : '/Jahr'
                      }
                    </Badge>
                  </div>
                )}
                {formData.salary_min && !formData.salary_max && (
                  <div className="flex justify-between items-center">
                    <span>Mindestgehalt:</span>
                    <Badge variant="outline" className="text-sm">
                      ab {formatCurrency(formData.salary_min)} {
                        formData.salary_interval === 'hour' ? '/Std.' :
                        formData.salary_interval === 'month' ? '/Monat' : '/Jahr'
                      }
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">Ausbildungsvergütung:</p>
                {formData.apprenticeship?.salary_year_1_cents && (
                  <div className="flex justify-between">
                    <span>1. Jahr:</span>
                    <span>{formatCurrency(formData.apprenticeship.salary_year_1_cents / 100)}</span>
                  </div>
                )}
                {formData.apprenticeship?.salary_year_2_cents && (
                  <div className="flex justify-between">
                    <span>2. Jahr:</span>
                    <span>{formatCurrency(formData.apprenticeship.salary_year_2_cents / 100)}</span>
                  </div>
                )}
                {formData.apprenticeship?.salary_year_3_cents && (
                  <div className="flex justify-between">
                    <span>3. Jahr:</span>
                    <span>{formatCurrency(formData.apprenticeship.salary_year_3_cents / 100)}</span>
                  </div>
                )}
                {formData.apprenticeship?.salary_year_4_cents && (
                  <div className="flex justify-between">
                    <span>4. Jahr:</span>
                    <span>{formatCurrency(formData.apprenticeship.salary_year_4_cents / 100)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Gehaltsfindung-Tipps:</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Berücksichtigen Sie regionale Unterschiede bei der Gehaltsfindung</p>
          <p>• Ein fairer Gehaltsbereich zieht qualifizierte Bewerber an</p>
          <p>• Bei Ausbildungen: Orientieren Sie sich an Branchentarifen</p>
          {formData.job_type === 'internship' && (
            <p>• Praktikumsvergütung ist ab 3 Monaten Pflicht (Mindestlohn)</p>
          )}
        </div>
      </div>
    </div>
  );
}