import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, StickyNote, Plus, ChevronRight } from 'lucide-react';
import type { PDFSidebarProps } from '@/types/groups';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export const PDFSidebar: React.FC<PDFSidebarProps> = ({
  file,
  currentPage,
  questions,
  annotations,
  onQuestionCreate,
  onAnnotationCreate,
  onQuestionClick,
  onAnnotationClick,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'annotations'>('questions');

  const currentPageQuestions = questions.filter(q => q.page?.page_number === currentPage);
  const currentPageAnnotations = annotations.filter(a => a.page_id === questions.find(q => q.page?.page_number === currentPage)?.page_id);

  const handleCreateQuestion = () => {
    // Find current page ID
    const currentPageQuestion = questions.find(q => q.page?.page_number === currentPage);
    if (currentPageQuestion?.page_id) {
      onQuestionCreate(currentPageQuestion.page_id, {
        x: 0,
        y: 0,
        width: 100,
        height: 20,
      });
    }
  };

  const handleCreateAnnotation = () => {
    // Find current page ID
    const currentPageQuestion = questions.find(q => q.page?.page_number === currentPage);
    if (currentPageQuestion?.page_id) {
      onAnnotationCreate(currentPageQuestion.page_id, {
        x: 0,
        y: 0,
        width: 100,
        height: 20,
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">
          {file.filename}
        </h3>
        <div className="text-xs text-gray-500">
          Seite {currentPage} von {file.page_count || 0}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'questions' | 'annotations')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Fragen
            {currentPageQuestions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {currentPageQuestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="annotations" className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notizen
            {currentPageAnnotations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {currentPageAnnotations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="questions" className="mt-0 h-full">
            <div className="p-4 space-y-4">
              {/* Create Question Button */}
              <Button 
                onClick={handleCreateQuestion}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Frage zu dieser Seite stellen
              </Button>

              {/* Questions List */}
              {currentPageQuestions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm font-medium mb-1">Keine Fragen</div>
                  <div className="text-xs">
                    Stelle die erste Frage zu dieser Seite
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentPageQuestions.map((question) => (
                    <Card 
                      key={question.id}
                      className="cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => onQuestionClick(question.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {question.title}
                          </h4>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Badge 
                            variant={question.status === 'solved' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {question.status === 'solved' ? 'Gelöst' : 
                             question.status === 'answered' ? 'Beantwortet' : 'Offen'}
                          </Badge>
                          <span>
                            {question.answer_count || 0} Antworten
                          </span>
                        </div>

                        {question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {question.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {question.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{question.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(question.created_at), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="annotations" className="mt-0 h-full">
            <div className="p-4 space-y-4">
              {/* Create Annotation Button */}
              <Button 
                onClick={handleCreateAnnotation}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Notiz hinzufügen
              </Button>

              {/* Annotations List */}
              {currentPageAnnotations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <StickyNote className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm font-medium mb-1">Keine Notizen</div>
                  <div className="text-xs">
                    Füge die erste Notiz zu dieser Seite hinzu
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentPageAnnotations.map((annotation) => (
                    <Card 
                      key={annotation.id}
                      className="cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => onAnnotationClick(annotation.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {annotation.note || 'Notiz'}
                          </h4>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                        
                        {annotation.quote && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2 italic">
                            "{annotation.quote}"
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {annotation.visibility === 'private' ? 'Privat' : 'Gruppe'}
                          </Badge>
                          <span>
                            {annotation.author?.display_name || 'Unbekannt'}
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(annotation.created_at), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
