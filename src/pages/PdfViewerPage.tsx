import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { useFile } from '@/hooks/useFiles';

export default function PdfViewerPage() {
  const { id } = useParams<{ id: string }>();

  const { data: file, isLoading, error } = useFile(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Datei nicht gefunden
          </h3>
          <p className="text-muted-foreground">
            Diese Datei existiert nicht oder du hast keinen Zugriff darauf.
          </p>
        </div>
      </div>
    );
  }

  const handleQuestionCreate = (pageId: string, anchor: any) => {
    // TODO: Open question creation modal
    console.log('Create question for page:', pageId, 'anchor:', anchor);
  };

  const handleAnnotationCreate = (pageId: string, anchor: any) => {
    // TODO: Open annotation creation modal
    console.log('Create annotation for page:', pageId, 'anchor:', anchor);
  };

  return (
    <PdfViewer
      file={file}
      onQuestionCreate={handleQuestionCreate}
      onAnnotationCreate={handleAnnotationCreate}
    />
  );
}
