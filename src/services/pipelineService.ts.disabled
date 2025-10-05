// Pipeline Service for Kanban Board Management
import { supabase } from '@/integrations/supabase/client';

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface PipelineItem {
  id: string;
  pipeline_id: string;
  stage_id: string;
  company_id: string;
  profile_id: string;
  job_posting_id?: string;
  order_index: number;
  created_at: string;
  // Joined profile data
  profile?: {
    id: string;
    full_name?: string;
    vorname?: string;
    nachname?: string;
    avatar_url?: string;
    status?: string;
    ausbildungsberuf?: string;
    aktueller_beruf?: string;
  };
}

export interface Pipeline {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
  stages: PipelineStage[];
  items: PipelineItem[];
}

export interface MoveItemData {
  itemId: string;
  toStageId: string;
  toIndex: number;
}

export class PipelineService {
  /**
   * Load complete pipeline with stages and items
   */
  async loadPipeline(): Promise<Pipeline | null> {
    try {
      // First ensure default pipeline exists
      await this.createPipelineIfMissing();

      // Get pipeline with stages
      const { data: pipeline, error: pipelineError } = await supabase
        .from('company_pipelines')
        .select(`
          *,
          pipeline_stages (
            id,
            pipeline_id,
            name,
            position,
            created_at
          )
        `)
        .single();

      if (pipelineError) throw pipelineError;

      // Get pipeline items with profile data
      const { data: items, error: itemsError } = await supabase
        .from('pipeline_items')
        .select(`
          *,
          profiles!inner (
            id,
            full_name,
            vorname,
            nachname,
            avatar_url,
            status,
            ausbildungsberuf,
            aktueller_beruf
          )
        `)
        .eq('pipeline_id', pipeline.id)
        .order('order_index');

      if (itemsError) throw itemsError;

      return {
        ...pipeline,
        stages: pipeline.pipeline_stages.sort((a, b) => a.position - b.position),
        items: items || []
      };
    } catch (error) {
      console.error('Error loading pipeline:', error);
      throw error;
    }
  }

  /**
   * Create default pipeline if missing
   */
  async createPipelineIfMissing(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('ensure_default_pipeline', {
        p_company: null // Will use current user's company
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw error;
    }
  }

  /**
   * Add profile to pipeline (in "Neu" stage)
   */
  async addToPipeline(options: { profileId: string; jobPostingId?: string }): Promise<void> {
    try {
      // Get pipeline
      const pipeline = await this.loadPipeline();
      if (!pipeline) throw new Error('No pipeline found');

      // Find "Neu" stage
      const neuStage = pipeline.stages.find(stage => stage.name === 'Neu');
      if (!neuStage) throw new Error('Neu stage not found');

      // Get current max order_index in this stage
      const { data: maxOrder, error: maxError } = await supabase
        .from('pipeline_items')
        .select('order_index')
        .eq('stage_id', neuStage.id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = maxOrder ? maxOrder.order_index + 1 : 0;

      // Insert new item
      const { error } = await supabase
        .from('pipeline_items')
        .insert({
          pipeline_id: pipeline.id,
          stage_id: neuStage.id,
          profile_id: options.profileId,
          job_posting_id: options.jobPostingId || null,
          order_index: nextOrder
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to pipeline:', error);
      throw error;
    }
  }

  /**
   * Move pipeline item to different stage/position
   */
  async movePipelineItem(data: MoveItemData): Promise<void> {
    try {
      const { error } = await supabase
        .from('pipeline_items')
        .update({
          stage_id: data.toStageId,
          order_index: data.toIndex
        })
        .eq('id', data.itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error moving pipeline item:', error);
      throw error;
    }
  }

  /**
   * Remove profile from pipeline
   */
  async removeFromPipeline(profileId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pipeline_items')
        .delete()
        .eq('profile_id', profileId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from pipeline:', error);
      throw error;
    }
  }

  /**
   * Get pipeline items for a specific stage
   */
  async getStageItems(stageId: string): Promise<PipelineItem[]> {
    try {
      const { data, error } = await supabase
        .from('pipeline_items')
        .select(`
          *,
          profiles!inner (
            id,
            full_name,
            vorname,
            nachname,
            avatar_url,
            status,
            ausbildungsberuf,
            aktueller_beruf
          )
        `)
        .eq('stage_id', stageId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stage items:', error);
      throw error;
    }
  }

  /**
   * Reorder items within a stage
   */
  async reorderStageItems(stageId: string, itemIds: string[]): Promise<void> {
    try {
      const updates = itemIds.map((itemId, index) => ({
        id: itemId,
        order_index: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('pipeline_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error reordering stage items:', error);
      throw error;
    }
  }
}
