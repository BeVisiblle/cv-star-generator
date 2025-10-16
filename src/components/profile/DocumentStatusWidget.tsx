import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VALID_DOC_TYPES, DOCUMENT_TYPE_LABELS, type DocType } from "@/lib/document-types";
import { FileCheck, FileX, Upload } from "lucide-react";
import { useState } from "react";
import WeitereDokumenteWidget from "./WeitereDokumenteWidget";

interface DocumentStatusWidgetProps {
  userId: string;
}

export function DocumentStatusWidget({ userId }: DocumentStatusWidgetProps) {
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: userDocuments, refetch } = useQuery({
    queryKey: ["user-documents", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_documents")
        .select("document_type")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data || [];
    },
  });

  const uploadedDocTypes = userDocuments?.map(d => d.document_type) || [];
  const commonDocTypes: DocType[] = [
    'arbeitszeugnisse',
    'hochschulzeugnisse',
    'letztes_schulzeugnis',
    'zertifikate',
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Meine Dokumente</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Hochladen
        </Button>
      </div>

      <div className="space-y-2">
        {commonDocTypes.map((docType) => {
          const isUploaded = uploadedDocTypes.includes(docType);
          return (
            <div
              key={docType}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {isUploaded ? (
                  <FileCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <FileX className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {DOCUMENT_TYPE_LABELS[docType]}
                </span>
              </div>
              
              {isUploaded ? (
                <span className="text-xs text-green-600 font-medium">✓ Hochgeladen</span>
              ) : (
                <span className="text-xs text-muted-foreground">Fehlt</span>
              )}
            </div>
          );
        })}
      </div>

      <WeitereDokumenteWidget
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        userId={userId}
        onDocumentUploaded={() => refetch()}
      />
    </Card>
  );
}
