// Stage Column Component for Pipeline Board
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PipelineStage, PipelineItem } from '@/services/pipelineService';
import PipelineCard from './PipelineCard';

interface StageColumnProps {
  stage: PipelineStage;
  items: PipelineItem[];
  moving: boolean;
}

export default function StageColumn({ stage, items, moving }: StageColumnProps) {
  const itemIds = items.map(item => item.id);

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>{stage.name}</span>
            <Badge variant="secondary" className="ml-2">
              {items.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 min-h-[200px]">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Keine Kandidaten</p>
                </div>
              ) : (
                items.map((item) => (
                  <PipelineCard
                    key={item.id}
                    item={item}
                    disabled={moving}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}
