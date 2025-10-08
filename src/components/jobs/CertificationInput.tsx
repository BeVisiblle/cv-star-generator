import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface CertificationInputProps {
  value: string[];
  onChange: (certifications: string[]) => void;
}

const COMMON_CERTIFICATIONS = [
  'Führerschein Klasse B',
  'Führerschein Klasse C',
  'Führerschein Klasse CE',
  'Staplerschein',
  'Kranführerschein',
  'Erste-Hilfe-Kurs',
  'Schweißerschein',
  'Gabelstaplerführerschein',
];

export function CertificationInput({ value, onChange }: CertificationInputProps) {
  const [newCert, setNewCert] = useState('');

  const addCertification = (cert: string) => {
    if (!cert.trim()) return;
    if (value.includes(cert.trim())) return;
    onChange([...value, cert.trim()]);
    setNewCert('');
  };

  const removeCertification = (cert: string) => {
    onChange(value.filter(c => c !== cert));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Zertifikate & Führerscheine</label>
        <p className="text-sm text-muted-foreground">Benötigte Qualifikationen</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Zertifikat eingeben..."
          value={newCert}
          onChange={(e) => setNewCert(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification(newCert))}
          list="cert-suggestions"
        />
        <datalist id="cert-suggestions">
          {COMMON_CERTIFICATIONS.map((cert) => (
            <option key={cert} value={cert} />
          ))}
        </datalist>
        <Button type="button" onClick={() => addCertification(newCert)} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {COMMON_CERTIFICATIONS.filter(c => !value.includes(c)).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Häufige Zertifikate:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_CERTIFICATIONS.filter(c => !value.includes(c)).map((cert) => (
              <Badge
                key={cert}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => addCertification(cert)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
          {value.map((cert) => (
            <Badge key={cert} variant="secondary" className="gap-1">
              {cert}
              <button
                type="button"
                onClick={() => removeCertification(cert)}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}