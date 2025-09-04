import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageThumbnails } from './PageThumbnails';
import { PDFSidebar } from './PDFSidebar';
import type { PDFViewerProps } from '@/types/groups';
import { useFilePages, useQuestions, useAnnotations } from '@/hooks/useFiles';

export const PdfViewer: React.FC<PDFViewerProps> = ({
  file,
  onQuestionCreate,
  onAnnotationCreate,
  initialPage = 1,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: pages = [] } = useFilePages(file.id);
  const { data: questions = [] } = useQuestions(file.group_id, { file_id: file.id });
  const { data: annotations = [] } = useAnnotations(file.id);

  const currentPageData = pages.find(p => p.page_number === currentPage);
  const totalPages = pages.length;

  // PDF.js setup (simplified for MVP)
  useEffect(() => {
    // TODO: Implement actual PDF.js rendering
    // For now, we'll show a placeholder
  }, [currentPage, zoom, rotation]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePageSelect = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleCreateQuestion = () => {
    if (selectedText && currentPageData) {
      onQuestionCreate?.(currentPageData.id, {
        x: 0, // TODO: Calculate from selection
        y: 0,
        width: 100,
        height: 20,
      });
    }
  };

  const handleCreateAnnotation = () => {
    if (selectedText && currentPageData) {
      onAnnotationCreate?.(currentPageData.id, {
        x: 0, // TODO: Calculate from selection
        y: 0,
        width: 100,
        height: 20,
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Page Thumbnails */}
      {showSidebar && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-sm text-gray-900">Seiten</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PageThumbnails
              file={file}
              currentPage={currentPage}
              onPageSelect={handlePageSelect}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? 'Seiten ausblenden' : 'Seiten anzeigen'}
              </Button>
              
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {currentPage} von {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 flex">
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl">
              <CardContent className="p-0">
                <div
                  ref={containerRef}
                  className="relative overflow-auto max-h-full"
                  onMouseUp={handleTextSelection}
                >
                  {currentPageData ? (
                    <div className="flex items-center justify-center min-h-[600px]">
                      {/* TODO: Replace with actual PDF.js canvas */}
                      <div className="text-center text-gray-500">
                        <div className="text-lg font-medium mb-2">
                          PDF-Seite {currentPage}
                        </div>
                        <div className="text-sm">
                          {file.filename}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          PDF-Viewer wird implementiert...
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-[600px]">
                      <div className="text-center text-gray-500">
                        <div className="text-lg font-medium mb-2">
                          PDF wird geladen...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Questions & Annotations */}
          {showSidebar && (
            <div className="w-80 bg-white border-l border-gray-200">
              <PDFSidebar
                file={file}
                currentPage={currentPage}
                questions={questions}
                annotations={annotations}
                onQuestionCreate={handleCreateQuestion}
                onAnnotationCreate={handleCreateAnnotation}
                onQuestionClick={(questionId) => {
                  // TODO: Navigate to question
                  console.log('Navigate to question:', questionId);
                }}
                onAnnotationClick={(annotationId) => {
                  // TODO: Navigate to annotation
                  console.log('Navigate to annotation:', annotationId);
                }}
              />
            </div>
          )}
        </div>

        {/* Text Selection Actions */}
        {selectedText && (
          <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                Ausgewählt: "{selectedText}"
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCreateQuestion}>
                  Frage stellen
                </Button>
                <Button size="sm" variant="outline" onClick={handleCreateAnnotation}>
                  Annotieren
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedText('')}>
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
