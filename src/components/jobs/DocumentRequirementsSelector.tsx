import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, FileCheck, AlertCircle } from "lucide-react";
import { DOCUMENT_TYPE_LABELS, type DocType, VALID_DOC_TYPES } from "@/lib/document-types";

interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean; // true = must-have, false = nice-to-have
}

interface DocumentRequirementsSelectorProps {
  requiredDocuments: DocumentRequirement[];
  optionalDocuments: DocumentRequirement[];
  onChange: (required: DocumentRequirement[], optional: DocumentRequirement[]) => void;
}

export function DocumentRequirementsSelector({
  requiredDocuments,
  optionalDocuments,
  onChange,
}: DocumentRequirementsSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [isRequired, setIsRequired] = useState(true);

  const allDocuments = [...requiredDocuments, ...optionalDocuments];
  const usedTypes = allDocuments.map(d => d.type);
  const availableTypes = VALID_DOC_TYPES.filter(type => !usedTypes.includes(type));

  const addDocument = () => {
    if (!selectedType) return;

    const newDoc: DocumentRequirement = {
      type: selectedType,
      label: DOCUMENT_TYPE_LABELS[selectedType as DocType],
      required: isRequired,
    };

    if (isRequired) {
      onChange([...requiredDocuments, newDoc], optionalDocuments);
    } else {
      onChange(requiredDocuments, [...optionalDocuments, newDoc]);
    }

    setSelectedType("");
  };

  const removeDocument = (type: string, required: boolean) => {
    if (required) {
      onChange(
        requiredDocuments.filter(d => d.type !== type),
        optionalDocuments
      );
    } else {
      onChange(
        requiredDocuments,
        optionalDocuments.filter(d => d.type !== type)
      );
    }
  };

  const toggleRequirement = (type: string, currentlyRequired: boolean) => {
    const doc = currentlyRequired 
      ? requiredDocuments.find(d => d.type === type)
      : optionalDocuments.find(d => d.type === type);

    if (!doc) return;

    if (currentlyRequired) {
      // Move from required to optional
      onChange(
        requiredDocuments.filter(d => d.type !== type),
        [...optionalDocuments, { ...doc, required: false }]
      );
    } else {
      // Move from optional to required
      onChange(
        [...requiredDocuments, { ...doc, required: true }],
        optionalDocuments.filter(d => d.type !== type)
      );
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Benötigte Bewerbungsunterlagen</Label>
      
      {/* Add Document Section */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-sm mb-1.5">Dokumententyp</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Dokument auswählen..." />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {DOCUMENT_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-40">
          <Label className="text-sm mb-1.5">Art</Label>
          <Select value={isRequired ? "required" : "optional"} onValueChange={(v) => setIsRequired(v === "required")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="required">Pflicht (Must-Have)</SelectItem>
              <SelectItem value="optional">Optional (Nice-to-Have)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={addDocument}
          disabled={!selectedType}
          size="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          Hinzufügen
        </Button>
      </div>

      {/* Required Documents List */}
      {requiredDocuments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Pflichtdokumente (Must-Have):
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredDocuments.map((doc) => (
              <Badge
                key={doc.type}
                variant="destructive"
                className="px-3 py-1.5 text-sm flex items-center gap-2"
              >
                <FileCheck className="h-3 w-3" />
                {doc.label}
                <button
                  type="button"
                  onClick={() => toggleRequirement(doc.type, true)}
                  className="ml-1 hover:bg-destructive-foreground/20 rounded-full p-0.5"
                  title="Zu Optional ändern"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.type, true)}
                  className="hover:bg-destructive-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Optional Documents List */}
      {optionalDocuments.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Optional (Nice-to-Have):
          </div>
          <div className="flex flex-wrap gap-2">
            {optionalDocuments.map((doc) => (
              <Badge
                key={doc.type}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-2"
              >
                {doc.label}
                <button
                  type="button"
                  onClick={() => toggleRequirement(doc.type, false)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  title="Zu Pflicht ändern"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.type, false)}
                  className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {allDocuments.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Keine Dokumenten-Anforderungen festgelegt
        </p>
      )}
    </div>
  );
}