import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DOCUMENT_TYPE_LABELS, type DocType } from "@/lib/document-types";
import { FileCheck, Upload, X } from "lucide-react";

interface DocumentUploadPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingDocuments: string[];
  userId: string;
  onUploadComplete: () => void;
}

export function DocumentUploadPrompt({
  open,
  onOpenChange,
  missingDocuments,
  userId,
  onUploadComplete,
}: DocumentUploadPromptProps) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDocType, setCurrentDocType] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(docType);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${userId}/${docType}/${Date.now()}.${fileExt}`;
      
      const getFileType = (extension: string) => {
        switch (extension) {
          case 'pdf': return 'application/pdf';
          case 'doc': return 'application/msword';
          case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          case 'jpg':
          case 'jpeg': return 'image/jpeg';
          case 'png': return 'image/png';
          default: return 'application/octet-stream';
        }
      };
      
      const fileType = getFileType(fileExt || '');

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          document_type: docType,
          filename: fileName,
          original_name: file.name,
          file_type: fileType,
          file_size: file.size,
          uploaded_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      setUploadedDocs([...uploadedDocs, docType]);
      toast.success(`${DOCUMENT_TYPE_LABELS[docType as DocType]} hochgeladen`);

      // Wenn alle Dokumente hochgeladen wurden
      const remainingDocs = missingDocuments.filter(d => ![...uploadedDocs, docType].includes(d));
      if (remainingDocs.length === 0) {
        setTimeout(() => {
          onUploadComplete();
          onOpenChange(false);
        }, 500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fehler beim Hochladen');
    } finally {
      setUploadingDoc(null);
      setCurrentDocType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const remainingDocs = missingDocuments.filter(d => !uploadedDocs.includes(d));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dokumente hochladen</DialogTitle>
          <DialogDescription>
            Für diese Bewerbung benötigen Sie noch folgende Dokumente:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {remainingDocs.map((docType) => (
            <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {DOCUMENT_TYPE_LABELS[docType as DocType] || docType}
                  </p>
                  {uploadingDoc === docType && (
                    <p className="text-xs text-muted-foreground">Wird hochgeladen...</p>
                  )}
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCurrentDocType(docType);
                  fileInputRef.current?.click();
                }}
                disabled={uploadingDoc === docType}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {uploadedDocs.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">Hochgeladen:</p>
              <div className="flex flex-wrap gap-2">
                {uploadedDocs.map((docType) => (
                  <Badge key={docType} variant="secondary" className="text-xs">
                    <FileCheck className="h-3 w-3 mr-1" />
                    {DOCUMENT_TYPE_LABELS[docType as DocType] || docType}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => currentDocType && handleFileSelect(e, currentDocType)}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Abbrechen
          </Button>
          {uploadedDocs.length === missingDocuments.length && (
            <Button
              onClick={() => {
                onUploadComplete();
                onOpenChange(false);
              }}
              className="flex-1"
            >
              Weiter zur Bewerbung
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
