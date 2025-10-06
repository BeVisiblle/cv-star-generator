import React, { useState, useRef } from "react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VALID_DOC_TYPES, normalizeDocType, DOCUMENT_TYPE_LABELS } from '@/lib/document-types';

const DOC_TYPES = VALID_DOC_TYPES.map(type => ({
  id: type,
  label: DOCUMENT_TYPE_LABELS[type]
}));

interface WeitereDokumenteWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onDocumentUploaded?: () => void; // Callback nach erfolgreichem Upload
}

export default function WeitereDokumenteWidget({ isOpen, onClose, userId, onDocumentUploaded }: WeitereDokumenteWidgetProps) {
  const [step, setStep] = useState(1); // 1: Dokumenttyp wählen, 2: Datei hochladen
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Funktion um erlaubte document_type Werte zu ermitteln
  const getAllowedDocumentTypes = async () => {
    try {
      // Versuche die CHECK constraint aus der Datenbank zu ermitteln
      const { data, error } = await supabase
        .from('user_documents')
        .select('document_type')
        .limit(1);
      
      if (error) {
        console.warn('Could not determine allowed document types:', error);
        return ['other']; // Fallback
      }
      
      // Für jetzt verwenden wir die DOC_TYPES IDs
      return DOC_TYPES.map(doc => doc.id);
    } catch (error) {
      console.warn('Error getting allowed document types:', error);
      return ['other']; // Fallback
    }
  };

  const handleDocTypeSelect = (docType: string) => {
    setSelectedDocType(docType);
    setStep(2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setIsUploading(true);
    try {
      // Datei in Supabase Storage hochladen
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const fileName = `${userId}/${selectedDocType}/${Date.now()}.${fileExt}`;
      
      // Dateityp basierend auf Dateiendung bestimmen
      const getFileType = (extension: string) => {
        switch (extension) {
          case 'pdf': return 'application/pdf';
          case 'doc': return 'application/msword';
          case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          case 'jpg':
          case 'jpeg': return 'image/jpeg';
          case 'png': return 'image/png';
          case 'gif': return 'image/gif';
          case 'txt': return 'text/plain';
          default: return 'application/octet-stream';
        }
      };
      
      const fileType = getFileType(fileExt || '');
      
      console.log('🔵 Uploading file:', {
        fileName,
        fileSize: selectedFile.size,
        docType: selectedDocType,
        fileType,
        userId
      });

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Storage-Fehler: ${uploadError.message}`);
      }

      console.log('🔵 File uploaded successfully, saving to database...');

      // Dokument-Info in der Datenbank speichern (selectedDocType ist bereits korrekt)
      console.log('🔵 Inserting document with type:', selectedDocType);
      
      const { error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          document_type: selectedDocType,
          filename: fileName,
          original_name: selectedFile.name,
          file_type: fileType,
          file_size: selectedFile.size,
          uploaded_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`Datenbank-Fehler: ${dbError.message}`);
      }

      console.log('🔵 Document saved to database successfully');

      toast.success('Dokument erfolgreich hochgeladen!');
      onClose();
      setStep(1);
      setSelectedDocType("");
      setSelectedFile(null);
      
      // Callback aufrufen, um die Dokumentenliste zu aktualisieren
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      toast.error(`Fehler beim Hochladen: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedDocType("");
      setSelectedFile(null);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {step === 1 ? "Dokumenttyp wählen" : "Datei hochladen"}
          </h2>
          <button
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Welche Art von Dokument möchtest du hochladen?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {DOC_TYPES.map((docType) => (
                  <button
                    key={docType.id}
                    onClick={() => handleDocTypeSelect(docType.id)}
                    className="p-3 text-left border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <span className="text-sm font-medium">{docType.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Ausgewählter Typ:</p>
                <p className="text-sm text-gray-600">
                  {DOC_TYPES.find(d => d.id === selectedDocType)?.label}
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm mb-3">Datei hierhin ziehen oder auswählen</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                >
                  Datei auswählen
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              
              {selectedFile && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">Ausgewählte Datei:</p>
                  <p className="text-sm text-gray-600 truncate">{selectedFile.name}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Zurück
                </button>
                {selectedFile && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    {isUploading ? "Wird hochgeladen..." : `${DOC_TYPES.find(d => d.id === selectedDocType)?.label} hochladen`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
