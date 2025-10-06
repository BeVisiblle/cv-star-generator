"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  Eye, 
  Trash2, 
  ChevronDown, 
  ChevronRight
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserDocument {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  document_type: string;
  uploaded_at: string;
}

interface WeitereDokumenteSectionProps {
  userId?: string;
  readOnly?: boolean;
  openWidget: () => void;
  refreshTrigger?: number; // Add refresh trigger
}

export function WeitereDokumenteSection({ userId, readOnly = false, openWidget, refreshTrigger }: WeitereDokumenteSectionProps) {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Einfache Funktion zum Laden der Dokumente
  const loadDocuments = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      console.log('🔵 Loading documents for user:', userId);
      // Einfache Abfrage ohne komplexe Filter
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        toast.error('Fehler beim Laden der Dokumente');
        return;
      }

      console.log('🔵 Loaded documents:', data);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Fehler beim Laden der Dokumente');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and reload on refresh trigger
  useEffect(() => {
    loadDocuments();
  }, [userId, refreshTrigger]);

  // Download/Vorschau
  const handleDownload = async (doc: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.filename);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Fehler beim Herunterladen der Datei');
    }
  };

  // Löschen
  const handleDelete = async (doc: UserDocument) => {
    const confirmed = window.confirm(
      `Möchten Sie das Dokument "${doc.original_name}" wirklich löschen?`
    );
    
    if (!confirmed) return;

    try {
      // Lösche aus Storage
      await supabase.storage
        .from('documents')
        .remove([doc.filename]);

      // Lösche aus Datenbank
      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast.success('Dokument erfolgreich gelöscht');
      loadDocuments(); // Reload
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Fehler beim Löschen des Dokuments');
    }
  };

  // Format Dateigröße
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Weitere Dokumente</CardTitle>
          {!readOnly && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openWidget}
              className="h-8 px-3"
            >
              <Upload className="h-4 w-4 mr-1" />
              Hinzufügen
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {readOnly ? 'Keine Dokumente verfügbar' : 'Noch keine Dokumente hochgeladen'}
            </p>
            {!readOnly && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openWidget}
                className="mt-3"
              >
                <Upload className="h-4 w-4 mr-1" />
                Erstes Dokument hinzufügen
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" title={doc.original_name}>
                        {doc.original_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {doc.document_type} • {formatFileSize(doc.file_size)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      title="Vorschau/Herunterladen"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}