// Pipeline Board Component for Kanban-style candidate management
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Loader2, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PipelineService, Pipeline, PipelineStage, PipelineItem } from '@/services/pipelineService';
import StageColumn from './StageColumn';
import PipelineCard from './PipelineCard';

interface PipelineBoardProps {
  className?: string;
}

export default function PipelineBoard({ className = '' }: PipelineBoardProps) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<PipelineItem | null>(null);
  const [moving, setMoving] = useState(false);

  const pipelineService = new PipelineService();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    try {
      setLoading(true);
      const data = await pipelineService.loadPipeline();
      setPipeline(data);
    } catch (error) {
      console.error('Error loading pipeline:', error);
      toast.error('Fehler beim Laden der Pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = pipeline?.items.find(i => i.id === active.id);
    setDraggedItem(item || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over || !pipeline) return;

    const itemId = active.id as string;
    const targetStageId = over.id as string;

    // Find the target stage
    const targetStage = pipeline.stages.find(stage => stage.id === targetStageId);
    if (!targetStage) return;

    // Find the item being moved
    const item = pipeline.items.find(i => i.id === itemId);
    if (!item) return;

    // Don't move if already in the same stage
    if (item.stage_id === targetStageId) return;

    try {
      setMoving(true);

      // Move the item to the new stage
      await pipelineService.movePipelineItem({
        itemId,
        toStageId: targetStageId,
        toIndex: 0 // Add to top of the stage
      });

      // Reload pipeline to get updated data
      await loadPipeline();

      toast.success(`Kandidat zu "${targetStage.name}" verschoben`);
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error('Fehler beim Verschieben des Kandidaten');
    } finally {
      setMoving(false);
    }
  };

  const getStageItems = (stageId: string): PipelineItem[] => {
    return pipeline?.items.filter(item => item.stage_id === stageId) || [];
  };

  const getTotalCandidates = (): number => {
    return pipeline?.items.length || 0;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Pipeline wird geladen...</span>
        </div>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Pipeline gefunden</h3>
          <p className="text-muted-foreground mb-4">
            Erstellen Sie eine Pipeline, um Kandidaten zu verwalten
          </p>
          <Button onClick={loadPipeline}>
            Pipeline erstellen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{pipeline.name}</h1>
          <p className="text-muted-foreground">
            {getTotalCandidates()} Kandidaten in der Pipeline
          </p>
        </div>
        <Button onClick={loadPipeline} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {pipeline.stages.map((stage) => {
            const stageItems = getStageItems(stage.id);
            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                items={stageItems}
                moving={moving}
              />
            );
          })}
        </div>

        <DragOverlay>
          {draggedItem ? (
            <PipelineCard item={draggedItem} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
